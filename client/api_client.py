import requests

BASE_URL = "http://localhost:5000"


def setup_database() -> dict:
    """POST /setup — initialise and seed the database if it does not exist yet."""
    response = requests.post(f"{BASE_URL}/setup")
    response.raise_for_status()
    return response.json()


def get_categories() -> list[str]:
    """GET /articles/categories — return all distinct product categories."""
    response = requests.get(f"{BASE_URL}/articles/categories")
    response.raise_for_status()
    return response.json()


def add_customer(
    name: str,
    email: str,
    date_of_birth: str | None = None,
    phone_number: str | None = None,
    address: str | None = None,
    country: str | None = None,
    house_hold_size: int = 1,
    has_children: bool = False,
    diet: str = "omni",
    age_range: str | None = None,
    location: str | None = None,
    tech_savviness: str = "medium",
    has_pets: bool = False,
    intolerances: str = "",
    co2: float = 0.00,
    persona_id: str | None = None,
) -> dict:
    """POST /customers — create a new customer and return {id, name, email}."""
    payload = {
        "name": name,
        "email": email,
        "date_of_birth": date_of_birth,
        "phone_number": phone_number,
        "address": address,
        "country": country,
        "house_hold_size": house_hold_size,
        "has_children": has_children,
        "diet": diet,
        "age_range": age_range,
        "location": location,
        "tech_savviness": tech_savviness,
        "has_pets": has_pets,
        "intolerances": intolerances,
        "co2": co2,
        "persona_id": persona_id,
    }
    response = requests.post(f"{BASE_URL}/customers", json=payload)
    response.raise_for_status()
    return response.json()


def get_customer_orders(customer_id: str) -> list[dict]:
    """GET /customers/<customer_id>/orders — return the last 10 orders for a customer."""
    response = requests.get(f"{BASE_URL}/customers/{customer_id}/orders")
    response.raise_for_status()
    return response.json()


def recommend_by_persona(persona: str) -> dict:
    """POST /recommendations/persona — return top products for similar personas.

    Args:
        persona: name of an existing persona (e.g. "fitness", "seniors")

    Returns:
        {
            "input_persona": str,
            "similar_customers": [{"name": str, "persona": str}, ...],
            "top_products": [{"product": str, "total_ordered": int}, ...]
        }
    """
    response = requests.post(
        f"{BASE_URL}/recommendations/persona",
        json={"persona": persona},
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    print("=== Setup ===")
    print(setup_database())

    print("\n=== Categories ===")
    print(get_categories())

    print("\n=== Add customer ===")
    customer = add_customer(
        name="Test User",
        email="test@example.com",
        diet="vegan",
        age_range="26-35",
        location="Amsterdam",
    )
    print(customer)

    print("\n=== Orders ===")
    print(get_customer_orders(customer["id"]))

    print("\n=== Persona recommendation ===")
    print(recommend_by_persona("fitness"))
