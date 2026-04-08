import sys
import os
sys.path.append(os.path.dirname(__file__))

from flask import Flask, request, jsonify
from database.crud import CRUDRepository
from database.database import init_db, _DB_PATH

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


if __name__ == "__main__":
    setup_database()
    app.run(debug=True, port=5000)
