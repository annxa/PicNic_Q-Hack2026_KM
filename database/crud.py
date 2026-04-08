from sqlalchemy.orm import Session
from sqlalchemy import func
try:
    from database.database import SessionLocal, Customer, Article, Order, Orderline, Stock, Package
except ModuleNotFoundError:
    from database import SessionLocal, Customer, Article, Order, Orderline, Stock, Package


class CRUDRepository:

    def __init__(self):
        self.db: Session = SessionLocal()

    def close(self):
        self.db.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.db.close()

    def get_all_customers(self) -> list[Customer]:
        return self.db.query(Customer).all()

    def get_customer(self, customer_id: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_customer_by_email(self, email: str) -> Customer | None:
        return self.db.query(Customer).filter(Customer.email == email).first()

    def get_customers_by_diet(self, diet: str) -> list[Customer]:
        return self.db.query(Customer).filter(Customer.diet == diet).all()

    def add_customer(self, name: str, email: str, **kwargs) -> Customer:
        customer = Customer(name=name, email=email, **kwargs)
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def update_customer(self, customer_id: str, **fields) -> Customer | None:
        customer = self.get_customer(customer_id)
        if customer:
            for key, value in fields.items():
                setattr(customer, key, value)
            self.db.commit()
            self.db.refresh(customer)
        return customer

    def delete_customer(self, customer_id: str) -> bool:
        customer = self.get_customer(customer_id)
        if customer:
            self.db.delete(customer)
            self.db.commit()
            return True
        return False

    def get_all_articles(self) -> list[Article]:
        return self.db.query(Article).all()

    def get_article_by_sku(self, sku: str) -> Article | None:
        return self.db.query(Article).filter(Article.sku == sku).first()

    def get_articles_by_category(self, category: str) -> list[Article]:
        return self.db.query(Article).filter(Article.category == category).all()

    def add_article(self, name: str, sku: str, price: float, **kwargs) -> Article:
        article = Article(name=name, sku=sku, price=price, **kwargs)
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def update_article(self, sku: str, **fields) -> Article | None:
        article = self.get_article_by_sku(sku)
        if article:
            for key, value in fields.items():
                setattr(article, key, value)
            self.db.commit()
            self.db.refresh(article)
        return article

    def get_orders_for_customer(self, customer_id: str) -> list[Order]:
        return (
            self.db.query(Order)
            .filter(Order.customer_id == customer_id)
            .order_by(Order.creation_date.desc())
            .all()
        )

    def create_order(self, customer_id: str, items: list[dict]) -> Order:
        order = Order(customer_id=customer_id)
        self.db.add(order)
        self.db.flush()
        total = 0.0
        for item in items:
            article = self.get_article_by_sku(item["sku"])
            self.db.add(Orderline(order_id=order.id, sku=item["sku"], quantity=item["quantity"]))
            total += article.price * item["quantity"]
        order.total_price = total
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_order_status(self, order_id: str, status: str) -> Order | None:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            self.db.commit()
        return order

    def get_stock(self, sku: str, fc_id: str) -> Stock | None:
        return self.db.query(Stock).filter(Stock.sku == sku, Stock.fc_id == fc_id).first()

    def get_low_stock(self, fc_id: str, threshold: int = 10) -> list[Stock]:
        return (
            self.db.query(Stock)
            .filter(Stock.fc_id == fc_id, Stock.quantity <= threshold)
            .all()
        )

    def update_stock_quantity(self, sku: str, fc_id: str, quantity: int) -> Stock | None:
        stock = self.get_stock(sku, fc_id)
        if stock:
            stock.quantity = quantity
            self.db.commit()
        return stock

    def get_all_packages(self) -> list[Package]:
        return self.db.query(Package).all()

    def get_package(self, package_id: str) -> Package | None:
        return self.db.query(Package).filter(Package.id == package_id).first()

    def add_package(self, name: str, **kwargs) -> Package:
        package = Package(name=name, **kwargs)
        self.db.add(package)
        self.db.commit()
        self.db.refresh(package)
        return package

    def get_top_articles_for_customer(self, customer_id: str, limit: int = 10) -> list[tuple[Article, int]]:
        return (
            self.db.query(Article, func.sum(Orderline.quantity).label("total"))
            .join(Orderline, Orderline.sku == Article.sku)
            .join(Order, Order.id == Orderline.order_id)
            .filter(Order.customer_id == customer_id)
            .group_by(Article.sku)
            .order_by(func.sum(Orderline.quantity).desc())
            .limit(limit)
            .all()
        )
