from __future__ import annotations
from sqlalchemy.orm import Session
try:
    from database.database import SessionLocal, Customer, Order, Article
except ModuleNotFoundError:
    from database import SessionLocal, Customer, Order, Article


class CRUDRepository:

    def __init__(self):
        self.db: Session = SessionLocal()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.db.close()

    def add_customer(
        self,
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
        goals: str = "",
        co2: float = 0.00,
        persona_id: str | None = None,
    ) -> Customer:
        customer = Customer(
            name=name,
            email=email,
            date_of_birth=date_of_birth,
            phone_number=phone_number,
            address=address,
            country=country,
            house_hold_size=house_hold_size,
            has_children=has_children,
            diet=diet,
            age_range=age_range,
            location=location,
            tech_savviness=tech_savviness,
            has_pets=has_pets,
            intolerances=intolerances,
            goals=goals,
            co2=co2,
            persona_id=persona_id,
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def get_customer(self, customer_id: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_all_categories(self) -> list[str]:
        rows = self.db.query(Article.category).distinct().all()
        return sorted([r[0] for r in rows if r[0] is not None])

    def get_last_orders(self, customer_id: str, limit: int = 10) -> list[dict]:
        orders = (
            self.db.query(Order)
            .filter(Order.customer_id == customer_id)
            .order_by(Order.creation_date.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "packages": [p.name for p in order.packages],
                "items":    [
                    {"product": line.article.name, "quantity": line.quantity}
                    for line in order.orderlines
                ],
            }
            for order in orders
        ]
