import sys
import os
sys.path.append(os.path.dirname(__file__))

from flask import Flask, request, jsonify
from database.crud import CRUDRepository
from database.database import init_db, _DB_PATH, SessionLocal, Persona, Customer, Order, Orderline, Article, Level

app = Flask(__name__)


def setup_database():
    if not os.path.exists(_DB_PATH):
        print("No database found — initialising and seeding...")
        init_db()
        from database.seed import Seeder
        Seeder().run()
    else:
        print("Database found — skipping seed.")


@app.route("/setup", methods=["POST"])
def setup():
    if not os.path.exists(_DB_PATH):
        init_db()
        from database.seed import Seeder
        Seeder().run()
        return jsonify({"status": "Database initialised and seeded."}), 201
    return jsonify({"status": "Database already exists — skipped."}), 200


@app.route("/articles/categories", methods=["GET"])
def get_categories():
    with CRUDRepository() as repo:
        return jsonify(repo.get_all_categories()), 200


@app.route("/customers", methods=["POST"])
def add_customer():
    data = request.get_json()

    required = ["name", "email"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 400

    with CRUDRepository() as repo:
        customer = repo.add_customer(
            name=data["name"],
            email=data["email"],
            date_of_birth=data.get("date_of_birth"),
            phone_number=data.get("phone_number"),
            address=data.get("address"),
            country=data.get("country"),
            house_hold_size=data.get("house_hold_size", 1),
            has_children=data.get("has_children", False),
            diet=data.get("diet", "omni"),
            age_range=data.get("age_range"),
            location=data.get("location"),
            tech_savviness=data.get("tech_savviness", "medium"),
            has_pets=data.get("has_pets", False),
            intolerances=data.get("intolerances", ""),
            co2=data.get("co2", 0.00),
            persona_id=data.get("persona_id"),
        )
        return jsonify({"id": customer.id, "name": customer.name, "email": customer.email}), 201


@app.route("/customers/<customer_id>/orders", methods=["GET"])
def get_last_orders(customer_id: str):
    with CRUDRepository() as repo:
        if not repo.get_customer(customer_id):
            return jsonify({"error": "Customer not found."}), 404
        orders = repo.get_last_orders(customer_id)
        return jsonify(orders), 200


_LEVEL_SCORE = {
    Level.none:      0,
    Level.very_low:  1,
    Level.low:       2,
    Level.medium:    3,
    Level.high:      4,
    Level.very_high: 5,
}


def _persona_vector(persona: Persona) -> list[int]:
    return [
        _LEVEL_SCORE.get(persona.price_sensitivity, 0),
        _LEVEL_SCORE.get(persona.eco_awareness,     0),
        _LEVEL_SCORE.get(persona.brand_loyalty,     0),
        _LEVEL_SCORE.get(persona.novelty_interest,  0),
        _LEVEL_SCORE.get(persona.recipe_interest,   0),
    ]


def _euclidean(a: list[int], b: list[int]) -> float:
    return sum((x - y) ** 2 for x, y in zip(a, b)) ** 0.5


@app.route("/recommendations/persona", methods=["POST"])
def recommend_by_persona():
    data = request.get_json()
    persona_name = data.get("persona")
    if not persona_name:
        return jsonify({"error": "Field 'persona' is required."}), 400

    db = SessionLocal()
    try:
        # 1. find the input persona
        input_persona = db.query(Persona).filter(Persona.name == persona_name).first()
        if not input_persona:
            return jsonify({"error": f"Persona '{persona_name}' not found."}), 404

        input_vec = _persona_vector(input_persona)

        # 2. rank all other personas by euclidean distance
        all_personas = db.query(Persona).filter(Persona.id != input_persona.id).all()
        ranked = sorted(all_personas, key=lambda p: _euclidean(input_vec, _persona_vector(p)))

        # 3. pick one customer per closest persona (up to 3 customers total)
        customers = []
        for persona in ranked:
            if len(customers) == 3:
                break
            customer = db.query(Customer).filter(Customer.persona_id == persona.id).first()
            if customer:
                customers.append(customer)

        # 4. collect product purchase counts from last 10 orders per customer
        product_counts: dict[str, dict] = {}
        for customer in customers:
            orders = (
                db.query(Order)
                .filter(Order.customer_id == customer.id)
                .order_by(Order.creation_date.desc())
                .limit(10)
                .all()
            )
            for order in orders:
                for line in order.orderlines:
                    sku = line.sku
                    if sku not in product_counts:
                        product_counts[sku] = {"name": line.article.name, "total": 0}
                    product_counts[sku]["total"] += line.quantity

        # 5. return top 2 products
        top2 = sorted(product_counts.values(), key=lambda x: x["total"], reverse=True)[:2]
        return jsonify({
            "input_persona": persona_name,
            "similar_customers": [
                {"name": c.name, "persona": c.persona.name} for c in customers
            ],
            "top_products": [
                {"product": p["name"], "total_ordered": p["total"]} for p in top2
            ],
        }), 200
    finally:
        db.close()


if __name__ == "__main__":
    setup_database()
    app.run(debug=True, port=5000)
