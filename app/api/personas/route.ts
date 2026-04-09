import { NextResponse } from "next/server";
import db from "@/lib/db";
import { articleToProduct, CATEGORY_MAP } from "@/lib/articles";
import type {
  Persona,
  Product,
  CartItem,
  PantryItem,
  OrderHistoryEntry,
  Household,
  Restriction,
  CO2Score,
  MealSuggestion,
  Bundle,
} from "@/types";

// ── Enrichment lookup tables ──────────────────────────────────────────────────

type SpendingBehavior = "frugal" | "moderate" | "lavish";
type Frequency = "daily" | "weekly" | "bi-weekly" | "monthly";
type Level = "low" | "medium" | "high";

const PERSONA_META: Record<
  string,
  {
    avatar: string;
    color: string;
    description: string;
    spendingBehavior: SpendingBehavior;
    shoppingFrequency: Frequency;
    priceSensitivity: Level;
    environmentalAwareness: Level;
    brandLoyalty: Level;
    noveltyOrientation: Level;
    recipeInterest: Level;
  }
> = {
  seniors: {
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
  },
};

const DELIVERY_SLOTS: Record<string, string> = {
  seniors: "Di 10–12 Uhr",
  students: "Fr 14–16 Uhr",
  biological: "Mi 17–18 Uhr",
  regional: "Do 16–18 Uhr",
  bargain_hunters: "Sa 10–12 Uhr",
  gourmet: "Mi 18–20 Uhr",
  pet_owners: "Do 17–19 Uhr",
  plant_based: "Di 16–18 Uhr",
  fitness: "Mo 18–20 Uhr",
};

const DIET_MAP: Record<string, string> = {
  omni: "omnivor",
  vegetarian: "vegetarisch",
  vegan: "vegan",
};

// shelf life in days after delivery
const SHELF_LIFE: Record<string, number> = {
  "DAI-MLK-001": 7,
  "DAI-BUT-001": 21,
  "DAI-EGG-001": 14,
  "BAK-BRD-001": 5,
  "VEG-BRC-001": 5,
  "VEG-TOM-001": 6,
  "MEA-CHK-001": 3,
  "DRK-OJC-001": 14,
  "VEG-LET-001": 5,
  "DAI-YOG-001": 14,
};

// typical consumption rate (units per day)
const CONSUMPTION_RATE: Record<string, number> = {
  "DAI-MLK-001": 0.5,
  "DAI-BUT-001": 0.05,
  "DAI-EGG-001": 2.0,
  "BAK-BRD-001": 0.25,
  "VEG-BRC-001": 0.2,
  "VEG-TOM-001": 0.3,
  "MEA-CHK-001": 0.5,
  "DRK-OJC-001": 0.15,
  "VEG-LET-001": 0.3,
  "DAI-YOG-001": 0.1,
};

const SKU_UNIT: Record<string, string> = {
  "DAI-MLK-001": "l",
  "DAI-BUT-001": "g",
  "DAI-EGG-001": "Stk.",
  "BAK-BRD-001": "g",
  "VEG-BRC-001": "g",
  "VEG-TOM-001": "kg",
  "MEA-CHK-001": "g",
  "DRK-OJC-001": "l",
  "VEG-LET-001": "Stk.",
  "DAI-YOG-001": "g",
};

// ── DB row types ──────────────────────────────────────────────────────────────

interface DbCustomer {
  id: string;
  name: string;
  email: string;
  house_hold_size: number;
  has_children: number;
  diet: string;
  age_range: string;
  location: string;
  has_pets: number;
  intolerances: string | null;
  persona_name: string | null;
  co2: number | null; // accumulated OSRM-based delivery CO₂ savings
}

interface DbOrderRow {
  order_id: string;
  customer_id: string;
  creation_date: string;
  total_price: number;
  sku: string;
  quantity: number;
  // article fields
  article_id: string;
  article_name: string;
  article_category: string;
  carbon_footprint: number | null;
  article_price: number;
  nutriscore: string | null;
  is_biological: number;
  is_available: number;
  allergy_labels: string | null;
}

interface DbPackage {
  id: string;
  name: string;
  description: string | null;
  cook_time: string | null;
  portion_quantity: number | null;
  instructions: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDate(raw: string): Date {
  return new Date(raw.replace(" ", "T"));
}

function parseIntolerances(raw: string | null): Restriction[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Restriction[];
}

function orderlineToProduct(row: DbOrderRow): Product {
  return articleToProduct({
    id: row.article_id,
    name: row.article_name,
    sku: row.sku,
    category: row.article_category,
    nutriscore: row.nutriscore,
    carbon_footprint: row.carbon_footprint,
    is_biological: row.is_biological,
    is_available: row.is_available,
    price: row.article_price,
    allergy_labels: row.allergy_labels,
  } as never);
}

// ── Derivation helpers ────────────────────────────────────────────────────────

// Delivery-based CO₂ fallback for legacy seeded orders (same as OSRM fallback)
const DELIVERY_CO2_FALLBACK = parseFloat(((3.5 * 2 * 150) / 1000).toFixed(3)); // 1.05 kg

type OrderGroup = {
  orderId: string;
  creationDate: string;
  totalPrice: number;
  co2Saved: number; // delivery-based; fallback for legacy orders
  lines: DbOrderRow[];
};

function groupOrders(rows: DbOrderRow[]): OrderGroup[] {
  const map = new Map<string, OrderGroup>();
  for (const row of rows) {
    if (!map.has(row.order_id)) {
      map.set(row.order_id, {
        orderId: row.order_id,
        creationDate: row.creation_date,
        totalPrice: row.total_price,
        // Use stored delivery CO₂; fall back to delivery-distance estimate for legacy rows
        co2Saved: DELIVERY_CO2_FALLBACK,
        lines: [],
      });
    }
    map.get(row.order_id)!.lines.push(row);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      parseDate(b.creationDate).getTime() -
      parseDate(a.creationDate).getTime()
  );
}

function buildOrderHistory(orders: OrderGroup[]): OrderHistoryEntry[] {
  return orders.map((o) => ({
    id: o.orderId,
    date: o.creationDate.split("T")[0].replace(" ", "-").slice(0, 10),
    items: o.lines.map((l) => ({ productId: l.article_id, quantity: l.quantity })),
    total: o.totalPrice,
    co2Saved: parseFloat(o.co2Saved.toFixed(2)),
  }));
}

function buildDefaultCart(lastOrder: OrderGroup | undefined): CartItem[] {
  if (!lastOrder) return [];
  return lastOrder.lines.map((l) => ({
    product: orderlineToProduct(l),
    quantity: l.quantity,
    addedReason: "Ordered last week as well",
  }));
}

function buildPantry(orders: OrderGroup[]): PantryItem[] {
  const now = new Date();
  // Track the most recent order each article appeared in
  const seen = new Map<string, { line: DbOrderRow; orderDate: Date }>();
  for (const order of orders.slice(0, 5)) {
    const orderDate = parseDate(order.creationDate);
    for (const line of order.lines) {
      if (!seen.has(line.article_id)) {
        seen.set(line.article_id, { line, orderDate });
      }
    }
  }

  const items: PantryItem[] = [];
  for (const { line, orderDate } of Array.from(seen.values())) {
    const daysSince = Math.floor(
      (now.getTime() - orderDate.getTime()) / 86_400_000
    );
    const shelfLife = SHELF_LIFE[line.sku] ?? 7;
    const daysRemaining = Math.max(0, shelfLife - daysSince);
    if (daysRemaining === 0) continue;

    const rate = CONSUMPTION_RATE[line.sku] ?? 0.2;
    const quantity = parseFloat(Math.max(0.1, daysRemaining * rate).toFixed(1));

    items.push({
      product: orderlineToProduct(line),
      quantity,
      unit: SKU_UNIT[line.sku] ?? "Stk.",
      daysRemaining,
      consumptionRate: rate,
      lastRestocked: orderDate.toISOString().slice(0, 10),
    });
  }
  return items.sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 8);
}

function buildMealSuggestions(
  orders: OrderGroup[],
  packages: DbPackage[]
): MealSuggestion[] {
  // Collect unique products from order history
  const seen = new Map<string, { product: Product; count: number }>();
  for (const order of orders) {
    for (const line of order.lines) {
      const id = line.article_id;
      if (seen.has(id)) {
        seen.get(id)!.count++;
      } else {
        seen.set(id, { product: orderlineToProduct(line), count: 1 });
      }
    }
  }
  const topProducts = [...Array.from(seen.values())]
    .sort((a, b) => b.count - a.count)
    .map((v) => v.product);

  // Use packages as recipe templates; fill ingredients with top customer products
  const MEAL_EMOJIS = ["🍳", "🥗", "🍛", "🥦", "🥩"];
  return packages.slice(0, 3).map((pkg, i) => {
    const ingredients = topProducts.slice(i * 2, i * 2 + 3);
    const totalPrice = ingredients.reduce((s, p) => s + p.price, 0);
    const co2Scores = ingredients.map((p) => p.co2Score);
    const avgScore =
      co2Scores.length === 0
        ? "B"
        : (["A", "B", "C", "D", "E"] as CO2Score[]).reduce((best, s) =>
            co2Scores.includes(s) ? s : best
          );
    return {
      id: `meal-${pkg.id}`,
      name: pkg.name,
      emoji: MEAL_EMOJIS[i % MEAL_EMOJIS.length],
      reason: pkg.description ?? "Close to your preferences",
      ingredients,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      co2Score: avgScore as CO2Score,
    } satisfies MealSuggestion;
  });
}

function buildBundles(orders: OrderGroup[]): Bundle[] {
  if (orders.length === 0) return [];

  // reorder bundle: last order
  const last = orders[0];
  const reorderItems = last.lines.slice(0, 5).map((l) => ({
    product: orderlineToProduct(l),
    quantity: l.quantity,
  }));
  const reorderTotal = reorderItems.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );

  // topup bundle: most frequently ordered single items (unique products across all orders)
  const freq = new Map<string, { product: Product; count: number }>();
  for (const order of orders) {
    for (const line of order.lines) {
      const id = line.article_id;
      if (freq.has(id)) freq.get(id)!.count++;
      else freq.set(id, { product: orderlineToProduct(line), count: 1 });
    }
  }
  const topupProducts = [...Array.from(freq.values())]
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map((v) => ({ product: v.product, quantity: 1 }));
  const topupTotal = topupProducts.reduce((s, i) => s + i.product.price, 0);

  return [
    {
      id: "bundle-reorder",
      name: "Order again",
      description: "Your last order - order again",
      items: reorderItems,
      totalPrice: parseFloat(reorderTotal.toFixed(2)),
      savings: parseFloat((reorderTotal * 0.05).toFixed(2)),
      category: "reorder",
    },
    {
      id: "bundle-topup",
      name: "Top up",
      description: "Your most frequently ordered products at a click",
      items: topupProducts,
      totalPrice: parseFloat(topupTotal.toFixed(2)),
      category: "topup",
    },
  ] satisfies Bundle[];
}

function buildPopularProducts(
  orders: OrderGroup[],
  allCustomerOrders: Map<string, OrderGroup[]>
): { product: Product; percentage: number }[] {
  // Count how many distinct customers ordered each article
  const customerCount = new Map<string, Set<string>>();
  allCustomerOrders.forEach((custOrders, customerId) => {
    for (const order of custOrders) {
      for (const line of order.lines) {
        if (!customerCount.has(line.article_id)) {
          customerCount.set(line.article_id, new Set());
        }
        customerCount.get(line.article_id)!.add(customerId);
      }
    }
  });
  const totalCustomers = allCustomerOrders.size || 1;

  // Collect products from THIS customer's orders
  const myProducts = new Map<string, Product>();
  for (const order of orders) {
    for (const line of order.lines) {
      myProducts.set(line.article_id, orderlineToProduct(line));
    }
  }

  return Array.from(myProducts.entries())
    .map(([id, product]) => ({
      product,
      percentage: Math.round(
        ((customerCount.get(id)?.size ?? 0) / totalCustomers) * 100
      ),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 6);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // 1. All customers + their persona metadata
    const customers = db
      .prepare(
        `SELECT c.id, c.name, c.email, c.house_hold_size, c.has_children,
                c.diet, c.age_range, c.location, c.has_pets, c.intolerances,
                c.co2,
                p.name as persona_name
         FROM customers c
         LEFT JOIN personas p ON c.persona_id = p.id`
      )
      .all() as DbCustomer[];

    // 2. All order rows (orders + orderlines + articles) in one query
    const allOrderRows = db
      .prepare(
        `SELECT o.id         AS order_id,
                o.customer_id,
                o.creation_date,
                o.total_price,
                ol.sku,
                ol.quantity,
                a.id       AS article_id,
                a.name     AS article_name,
                a.category AS article_category,
                a.carbon_footprint,
                a.price    AS article_price,
                a.nutriscore,
                a.is_biological,
                a.is_available,
                a.allergy_labels
         FROM orders o
         JOIN orderlines ol ON ol.order_id = o.id
         JOIN articles  a  ON a.sku        = ol.sku
         ORDER BY o.customer_id, o.creation_date DESC`
      )
      .all() as DbOrderRow[];

    // 3. Packages for meal suggestions
    const packages = db
      .prepare("SELECT id, name, description, cook_time, portion_quantity, instructions FROM packages")
      .all() as DbPackage[];

    // 4. Group order rows by customer
    const rowsByCustomer = new Map<string, DbOrderRow[]>();
    for (const row of allOrderRows) {
      if (!rowsByCustomer.has(row.customer_id)) {
        rowsByCustomer.set(row.customer_id, []);
      }
      rowsByCustomer.get(row.customer_id)!.push(row);
    }

    // 5. Build OrderGroup[] per customer
    const ordersByCustomer = new Map<string, OrderGroup[]>();
    rowsByCustomer.forEach((rows, customerId) => {
      ordersByCustomer.set(customerId, groupOrders(rows));
    });

    // 6. Build full Persona objects
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
    const monthAgo = new Date(now.getTime() - 30 * 86_400_000);

    const personas: (Persona & {
      mealSuggestions: MealSuggestion[];
      bundles: Bundle[];
      popularProducts: { product: Product; percentage: number }[];
    })[] = customers.map((c) => {
      const orders = ordersByCustomer.get(c.id) ?? [];
      const orderHistory = buildOrderHistory(orders);

      // CO₂ stats — all derived from orderHistory so week ≤ month ≤ total always holds
      const co2Total = orderHistory.reduce((s, o) => s + o.co2Saved, 0);
      const co2Week = orderHistory
        .filter((o) => new Date(o.date) >= weekAgo)
        .reduce((s, o) => s + o.co2Saved, 0);
      const co2Month = orderHistory
        .filter((o) => new Date(o.date) >= monthAgo)
        .reduce((s, o) => s + o.co2Saved, 0);

      // Preferred categories (by order volume)
      const catCounts: Record<string, number> = {};
      for (const order of orders) {
        for (const line of order.lines) {
          const cat = CATEGORY_MAP[line.article_category] ?? line.article_category;
          catCounts[cat] = (catCounts[cat] ?? 0) + line.quantity;
        }
      }
      const preferredCategories = Object.entries(catCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([cat]) => cat);

      // Avg weekly spend
      const avgOrderTotal =
        orders.length > 0
          ? orders.reduce((s, o) => s + o.totalPrice, 0) / orders.length
          : 80;
      const weeklyBudget = Math.round(avgOrderTotal / 5) * 5;

      const defaultRestrictions = parseIntolerances(c.intolerances);
      const dietStyle = (DIET_MAP[c.diet] ?? "omnivor") as Household["dietStyle"];

      const household: Household = {
        size: c.house_hold_size,
        weeklyBudget,
        dietStyle,
        restrictions: defaultRestrictions,
        hasKids: c.has_children === 1,
      };

      const meta = PERSONA_META[c.persona_name ?? ""] ?? {
        avatar: "👤",
        color: "#E1141C",
        description: "",
      };
      const deliverySlot = DELIVERY_SLOTS[c.persona_name ?? ""] ?? "Mi 17–18 Uhr";

      const taglineParts = [
        `${c.house_hold_size} ${c.house_hold_size === 1 ? "Person" : "Personen"}`,
        dietStyle.charAt(0).toUpperCase() + dietStyle.slice(1),
        `~${weeklyBudget} €/Woche`,
      ];

      return {
        id: c.id,
        name: c.name,
        avatar: meta.avatar,
        tagline: taglineParts.join(" · "),
        description: meta.description,
        household,
        defaultRestrictions,
        pantry: buildPantry(orders),
        orderHistory,
        defaultCart: buildDefaultCart(orders[0]),
        co2SavedTotal: parseFloat(co2Total.toFixed(1)),
        co2SavedThisWeek: parseFloat(co2Week.toFixed(2)),
        co2MonthlyGoal: 5.0,
        co2SavedThisMonth: parseFloat(co2Month.toFixed(1)),
        deliverySlot,
        preferredCategories,
        color: meta.color,
        // Extended suggestion fields
        mealSuggestions: buildMealSuggestions(orders, packages),
        bundles: buildBundles(orders),
        popularProducts: buildPopularProducts(orders, ordersByCustomer),
      };
    });

    return NextResponse.json(personas);
  } catch (err) {
    console.error("[/api/personas]", err);
    return NextResponse.json(
      { error: "Failed to fetch personas" },
      { status: 500 }
    );
  }
}
