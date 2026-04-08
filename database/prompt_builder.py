"""
PromptBuilder — constructs structured English prompts for Claude that run
after each completed order to keep the customer profile and recommendations
up to date.

Three prompt types are supported:

1. ``build_profile_update_prompt``
   Re-evaluate customer attributes (persona fit, diet, intolerances, …)
   based on the new order.  Returns a JSON patch for the Customer row.

2. ``build_cart_prediction_prompt``
   Predict the most likely items for the customer's *next* order.
   Returns a ranked JSON list of SKU + quantity + confidence.

3. ``build_package_suggestion_prompt``
   Propose 1-3 new meal-kit packages tailored to the customer's buying
   pattern that do not yet exist in the catalogue.
   Returns a JSON list of package objects.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


# -- Input data containers ----------------------------------------------------

@dataclass
class CustomerContext:
    """Flat snapshot of a customer row used in prompt construction."""
    customer_id: str
    name: str
    persona: str | None          # current persona label, e.g. "fitness"
    diet: str                    # "omni" | "vegan" | "vegetarian"
    age_range: str | None
    house_hold_size: int
    has_children: bool
    has_pets: bool
    intolerances: list[str]      # e.g. ["gluten", "lactose"]
    location: str | None
    weekly_budget: float | None = None

    @classmethod
    def from_db_row(cls, row: Any, persona_name: str | None = None) -> "CustomerContext":
        raw = getattr(row, "intolerances", "") or ""
        intolerances = [t.strip() for t in raw.split(",") if t.strip()]
        return cls(
            customer_id=row.id,
            name=row.name,
            persona=persona_name or getattr(row, "persona_name", None),
            diet=row.diet or "omni",
            age_range=getattr(row, "age_range", None),
            house_hold_size=row.house_hold_size or 1,
            has_children=bool(row.has_children),
            has_pets=bool(row.has_pets),
            intolerances=intolerances,
            location=getattr(row, "location", None),
        )


@dataclass
class OrderedItem:
    """One line of the newly placed order."""
    sku: str
    name: str
    category: str
    quantity: int
    price: float
    is_biological: bool
    nutriscore: str | None       # "A"-"E"
    carbon_footprint: float | None  # kg CO2e per unit


@dataclass
class NewOrderEvent:
    """
    Represents the order that just completed and triggered the update run.
    Pass this to every prompt builder call so Claude has the triggering signal.
    """
    order_id: str
    items: list[OrderedItem]
    total_price: float
    order_date: str              # ISO date string, e.g. "2026-04-08"


@dataclass
class OrderHistory:
    """Aggregated purchase history (excluding the brand-new order)."""
    order_count: int             # total orders before this one
    avg_order_total: float
    top_categories: list[str]   # most-ordered categories, ranked
    frequent_skus: list[str]    # SKUs ordered in >= 2 different orders
    recent_items: list[OrderedItem]   # items from the last 3 orders (flat)


@dataclass
class ProductCatalog:
    """All available articles the model may reference for recommendations."""
    items: list[dict]            # {sku, name, category, price, is_biological, nutriscore, carbon_footprint}

    def to_text(self) -> str:
        lines = []
        for p in self.items:
            bio = " [Bio]" if p.get("is_biological") else ""
            ns  = p.get("nutriscore") or "?"
            co2 = f"{p['carbon_footprint']:.1f} kg CO2" if p.get("carbon_footprint") else "?"
            lines.append(
                f"  - {p['name']}{bio} | SKU: {p['sku']} | "
                f"Cat: {p['category']} | {p['price']:.2f} EUR | "
                f"Nutriscore: {ns} | CO2: {co2}"
            )
        return "\n".join(lines)


@dataclass
class ExistingPackages:
    """Packages already in the catalogue (so Claude does not duplicate them)."""
    items: list[dict]            # {id, name, description}

    def to_text(self) -> str:
        return "\n".join(
            f"  - {p['name']}: {p.get('description', '')}" for p in self.items
        )


# -- Builder ------------------------------------------------------------------

class PromptBuilder:
    """
    Fluent builder that assembles system + user prompts for the three
    post-order update tasks.

    Typical usage::

        event   = NewOrderEvent(...)
        ctx     = CustomerContext.from_db_row(customer_row, persona_name)
        history = OrderHistory(...)
        catalog = ProductCatalog(items=[...])

        builder = (
            PromptBuilder()
            .with_customer(ctx)
            .with_new_order(event)
            .with_order_history(history)
            .with_catalog(catalog)
        )

        profile_prompt  = builder.build_profile_update_prompt()
        cart_prompt     = builder.build_cart_prediction_prompt()
        package_prompt  = builder.build_package_suggestion_prompt()
    """

    def __init__(self) -> None:
        self._customer: CustomerContext | None = None
        self._new_order: NewOrderEvent | None = None
        self._history: OrderHistory | None = None
        self._catalog: ProductCatalog | None = None
        self._existing_packages: ExistingPackages | None = None
        self._personas = """seniors: {
                        avatar: "👴",
                        color: "#6B7280",
                        description:
                        "Reliable habits, familiar brands, and a tidy weekly basket.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "medium",
                        environmentalAwareness: "low",
                        brandLoyalty: "high",
                        noveltyOrientation: "low",
                        recipeInterest: "low",
                    },
                    students: {
                        avatar: "🧑‍🎓",
                        color: "#3B82F6",
                        description:
                        "Budget-conscious and hungry. Bread, eggs & pasta are the essentials.",
                        spendingBehavior: "frugal",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "high",
                        environmentalAwareness: "low",
                        brandLoyalty: "low",
                        noveltyOrientation: "medium",
                        recipeInterest: "low",
                    },
                    biological: {
                        avatar: "🌿",
                        color: "#10B981",
                        description:
                        "Organic is non-negotiable, CO₂ footprint always in mind. A true veggie lover.",
                        spendingBehavior: "lavish",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "low",
                        environmentalAwareness: "high",
                        brandLoyalty: "medium",
                        noveltyOrientation: "medium",
                        recipeInterest: "high",
                    },
                    regional: {
                        avatar: "🏡",
                        color: "#F59E0B",
                        description:
                        "Local & seasonal – straight from the producer, fresh from the region.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "low",
                        environmentalAwareness: "high",
                        brandLoyalty: "medium",
                        noveltyOrientation: "low",
                        recipeInterest: "medium",
                    },
                    bargain_hunters: {
                        avatar: "💰",
                        color: "#8B5CF6",
                        description: "Always hunting for the best deal. Bulk quantities, lowest prices.",
                        spendingBehavior: "frugal",
                        shoppingFrequency: "bi-weekly",
                        priceSensitivity: "high",
                        environmentalAwareness: "low",
                        brandLoyalty: "low",
                        noveltyOrientation: "low",
                        recipeInterest: "low",
                    },
                    gourmet: {
                        avatar: "👨‍🍳",
                        color: "#EF4444",
                        description:
                        "Cooking is a passion. Quality over price, variety is everything.",
                        spendingBehavior: "lavish",
                        shoppingFrequency: "daily",
                        priceSensitivity: "low",
                        environmentalAwareness: "medium",
                        brandLoyalty: "medium",
                        noveltyOrientation: "high",
                        recipeInterest: "high",
                    },
                    pet_owners: {
                        avatar: "🐾",
                        color: "#F97316",
                        description:
                        "Shopping for both people and pets. Chicken always ends up in the basket.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "medium",
                        environmentalAwareness: "low",
                        brandLoyalty: "medium",
                        noveltyOrientation: "low",
                        recipeInterest: "low",
                    },
                    plant_based: {
                        avatar: "🥦",
                        color: "#22C55E",
                        description:
                        "100% plant-based, 0% compromise. Vegetables, OJ, and variety.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "medium",
                        environmentalAwareness: "high",
                        brandLoyalty: "low",
                        noveltyOrientation: "high",
                        recipeInterest: "high",
                    },
                    fitness: {
                        avatar: "💪",
                        color: "#0EA5E9",
                        description:
                        "Meal prep every Sunday. Protein first – chicken, eggs, broccoli.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "weekly",
                        priceSensitivity: "medium",
                        environmentalAwareness: "medium",
                        brandLoyalty: "medium",
                        noveltyOrientation: "low",
                        recipeInterest: "high",
                    },
                    family: {
                        avatar: "👨‍👩‍👧",
                        color: "#00B3B3",
                        description:
                        "Feeding the whole family. Practical, balanced, and always stocked up.",
                        spendingBehavior: "moderate",
                        shoppingFrequency: "bi-weekly",
                        priceSensitivity: "medium",
                        environmentalAwareness: "medium",
                        brandLoyalty: "medium",
                        noveltyOrientation: "low",
                        recipeInterest: "high",
                    }"""
    # -- Fluent setters -------------------------------------------------------

    def with_customer(self, ctx: CustomerContext) -> "PromptBuilder":
        self._customer = ctx
        return self

    def with_new_order(self, event: NewOrderEvent) -> "PromptBuilder":
        self._new_order = event
        return self

    def with_order_history(self, history: OrderHistory) -> "PromptBuilder":
        self._history = history
        return self

    def with_catalog(self, catalog: ProductCatalog) -> "PromptBuilder":
        self._catalog = catalog
        return self

    def with_existing_packages(self, packages: ExistingPackages) -> "PromptBuilder":
        self._existing_packages = packages
        return self

    # -- Prompt factories -----------------------------------------------------
    

    def build_profile_update_prompt(self) -> "BuiltPrompt":
        """
        Ask Claude whether any customer attributes should be updated based on
        the new order and the overall history.

        Expected JSON response::

            {
              "persona":      "fitness" | null,
              "diet":         "omni" | "vegan" | "vegetarian" | null,
              "intolerances": ["gluten", ...] | null,
              "has_children": true | false | null,
              "has_pets":     true | false | null,
              "confidence":   0.0-1.0,
              "reasoning":    "short explanation"
            }

        A null value for any field means keep the current value unchanged.
        """
        system = (
            "You are a smart customer-profiling engine for Picnic+, a personalised "
            "online grocery service. Your job is to analyse a customer's latest order "
            "together with their purchase history and decide whether their stored "
            "profile attributes need updating.\n\n"
            "The following personas are available:\n"
            + self._personas +
            "Rules:\n"
            "- Only suggest a change when the evidence from the orders clearly supports it.\n"
            "- Set a field to null if the current value should remain unchanged.\n"
            "- Confidence must reflect how certain you are across ALL proposed changes.\n"
            "- Respond ONLY with a single valid JSON object. No prose, no markdown fences."
        )
        user = (
            self._customer_block()
            + self._new_order_block()
            + self._history_block()
            + "## Task\n"
            "Review the customer profile in light of the new order and history. "
            "Return a JSON patch with the fields that should be updated. "
            "Use null for fields that should remain unchanged.\n\n"
            "Required JSON schema:\n"
            '{"persona": <string|null>, "diet": <string|null>, '
            '"intolerances": <list|null>, "has_children": <bool|null>, '
            '"has_pets": <bool|null>, "confidence": <float>, "reasoning": <string>}'
        )
        return BuiltPrompt(system=system, user=user)

    def build_cart_prediction_prompt(self) -> "BuiltPrompt":
        """
        Predict the items the customer is most likely to order next.

        Expected JSON response::

            [
              {
                "sku":        "MEA-CHK-001",
                "name":       "Chicken Breast 500g",
                "quantity":   3,
                "confidence": 0.95,
                "reason":     "ordered in 9 of 10 previous orders"
              },
              ...
            ]
        """
        system = (
            "You are a next-basket prediction engine for Picnic+, a personalised "
            "online grocery service. Given a customer's profile, their latest order, "
            "and purchase history, predict which items they will most likely order next "
            "and in what quantities.\n\n"
            "The folllowing personas are available:"
            + self._personas +
            "Rules:\n"
            "- Only recommend items from the provided product catalogue.\n"
            "- Return as many items, as the customer usually orders, ranked by confidence (highest first).\n"
            "- Respect the customer's diet restrictions and intolerances.\n"
            "- Consider reorder frequency, quantities, and household size.\n"
            "- Respond ONLY with a valid JSON array. No prose, no markdown fences."
        )
        user = (
            self._customer_block()
            + self._new_order_block()
            + self._history_block()
            + self._catalog_block()
            + "## Task\n"
            "Predict the customer's next basket. Return a JSON array where each "
            "element has: sku, name, quantity (integer), confidence (0.0-1.0), reason."
        )
        return BuiltPrompt(system=system, user=user)

    def build_package_suggestion_prompt(self) -> "BuiltPrompt":
        """
        Propose new meal-kit packages tailored to the customer's buying pattern.

        Expected JSON response::

            [
              {
                "name":             "High-Protein Meal Prep Box",
                "description":      "A week of lean, protein-rich meal prep.",
                "article_skus":     ["MEA-CHK-001", "DAI-EGG-001", "VEG-BRC-001"],
                "reason":           "customer buys these items every week"
              }
            ]
        """
        system = (
            "You are a product merchandising engine for Picnic+, a personalised "
            "online grocery service. Your job is to design new meal-kit packages "
            "(bundles of grocery articles) that match a customer's actual buying "
            "patterns and dietary profile.\n\n"
            "Rules:\n"
            "- Suggest 1-3 NEW packages not already in the existing package catalogue.\n"
            "- Only use article SKUs that exist in the provided product catalogue.\n"
            "- Each package should contain 3-6 articles.\n"
            "- Respect the customer's diet and intolerances.\n"
            "- Respond ONLY with a valid JSON array. No prose, no markdown fences."
        )
        existing_block = (
            "## Existing Packages (do NOT duplicate these)\n"
            + (self._existing_packages.to_text() if self._existing_packages else "  (none)")
            + "\n\n"
        )
        user = (
            self._customer_block()
            + self._new_order_block()
            + self._history_block()
            + self._catalog_block()
            + existing_block
            + "## Task\n"
            "Design 1-3 new meal-kit packages for this customer. "
            "Each element in the JSON array must have: "
            "name, description, cook_time, portion_quantity (int), "
            "article_skus (list of SKU strings), reason."
        )
        return BuiltPrompt(system=system, user=user)

    # -- Block helpers --------------------------------------------------------

    def _customer_block(self) -> str:
        if not self._customer:
            return ""
        c = self._customer
        diet_map = {"omni": "omnivore", "vegan": "vegan", "vegetarian": "vegetarian"}
        lines = [
            "## Customer Profile",
            f"- ID: {c.customer_id}",
            f"- Name: {c.name}",
            f"- Current persona: {c.persona or 'unknown'}",
            f"- Diet: {diet_map.get(c.diet, c.diet)}",
            f"- Age range: {c.age_range or 'unknown'}",
            f"- Household size: {c.house_hold_size}",
            f"- Has children: {'yes' if c.has_children else 'no'}",
            f"- Has pets: {'yes' if c.has_pets else 'no'}",
            f"- Intolerances/allergies: {', '.join(c.intolerances) if c.intolerances else 'none'}",
            f"- Location: {c.location or 'unknown'}",
        ]
        if c.weekly_budget:
            lines.append(f"- Estimated weekly budget: ~{c.weekly_budget:.0f} EUR")
        return "\n".join(lines) + "\n\n"

    def _new_order_block(self) -> str:
        if not self._new_order:
            return ""
        o = self._new_order
        lines = [
            f"## New Order (trigger) | Date: {o.order_date} | Total: {o.total_price:.2f} EUR",
        ]
        for item in o.items:
            bio = " [Bio]" if item.is_biological else ""
            lines.append(
                f"  - {item.name}{bio} x{item.quantity} "
                f"({item.category}, {item.price:.2f} EUR/unit)"
            )
        return "\n".join(lines) + "\n\n"

    def _history_block(self) -> str:
        if not self._history:
            return ""
        h = self._history
        lines = [
            "## Purchase History (before this order)",
            f"- Total orders: {h.order_count}",
            f"- Average order total: {h.avg_order_total:.2f} EUR",
            f"- Top categories: {', '.join(h.top_categories) or 'none'}",
            f"- Frequently re-ordered SKUs: {', '.join(h.frequent_skus) or 'none'}",
        ]
        if h.recent_items:
            recent_names = list(dict.fromkeys(i.name for i in h.recent_items))
            lines.append(f"- Recent items (last 3 orders): {', '.join(recent_names[:12])}")
        return "\n".join(lines) + "\n\n"

    def _catalog_block(self) -> str:
        if not self._catalog:
            return ""
        return "## Available Products\n" + self._catalog.to_text() + "\n\n"


# -- Output container ---------------------------------------------------------

@dataclass
class BuiltPrompt:
    """Assembled system + user messages ready to send to Claude."""
    system: str
    user: str

    def to_messages(self) -> list[dict]:
        return [{"role": "user", "content": self.user}]
