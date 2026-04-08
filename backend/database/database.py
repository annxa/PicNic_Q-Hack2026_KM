import uuid
import enum
import os
from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean,
    DateTime, ForeignKey, Text, Table, Enum, Numeric
)
from sqlalchemy.types import JSON
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
from contextlib import contextmanager
from typing import Generator


class Level(enum.Enum):
    none      = "none"
    very_low  = "very_low"
    low       = "low"
    medium    = "medium"
    high      = "high"
    very_high = "very_high"

_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "picnic.db"))
DATABASE_URL = f"sqlite:///{_DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def new_uuid() -> str:
    return str(uuid.uuid4())


# ── Association tables (many-to-many) ─────────────────────────────────────────

order_package = Table(
    "order_package",
    Base.metadata,
    Column("order_id",   String, ForeignKey("orders.id")),
    Column("package_id", String, ForeignKey("packages.id")),
)

package_ingredient = Table(
    "package_ingredient",
    Base.metadata,
    Column("package_id",    String, ForeignKey("packages.id")),
    Column("ingredient_id", String, ForeignKey("ingredients.id")),
)

ingredient_article = Table(
    "ingredient_article",
    Base.metadata,
    Column("ingredient_id", String, ForeignKey("ingredients.id")),
    Column("article_sku",   String, ForeignKey("articles.sku")),
)


# ── Models ────────────────────────────────────────────────────────────────────

class Persona(Base):
    """Predefined customer personas used for personalization and recommendations."""
    __tablename__ = "personas"

    id                  = Column(String, primary_key=True, default=new_uuid)
    name                = Column(String, unique=True, nullable=False)   # e.g. "seniors", "students"
    tag                 = Column(String)                                 # e.g. "budget", "premium", "quality"

    price_sensitivity   = Column(Enum(Level))    # how much price drives decisions
    eco_awareness       = Column(Enum(Level))    # preference for sustainable/bio products
    brand_loyalty       = Column(Enum(Level))    # tendency to stick to known brands
    novelty_interest    = Column(Enum(Level))    # openness to new or unknown products
    recipe_interest     = Column(Enum(Level))    # interest in recipe-based shopping

    customers = relationship("Customer", back_populates="persona")


class Customer(Base):
    __tablename__ = "customers"

    id              = Column(String, primary_key=True, default=new_uuid)
    name            = Column(String, nullable=False)
    date_of_birth   = Column(String)                        # ISO date string, e.g. "1990-05-15"
    email           = Column(String, unique=True)
    phone_number    = Column(String)
    address         = Column(String)
    country         = Column(String)
    house_hold_size = Column(Integer, default=1)

    # --- personalization fields ---
    has_children    = Column(Boolean, default=False)        # children in household
    diet            = Column(String, default="omni")        # "vegan" | "vegetarian" | "omni"
    age_range       = Column(String)                        # e.g. "18-25", "26-35", "36-50", "51+"
    location        = Column(String)                        # city or postal code
    tech_savviness  = Column(String, default="medium")      # "low" | "medium" | "high"
    has_pets        = Column(Boolean, default=False)
    intolerances    = Column(String)                        # comma-separated, e.g. "gluten,lactose"
    co2             = Column(Numeric(precision=10, scale=2), default=0.00)  # total CO2 footprint in kg
    persona_id      = Column(String, ForeignKey("personas.id"), nullable=True)

    persona = relationship("Persona", back_populates="customers")
    orders  = relationship("Order",   back_populates="customer")


class Package(Base):
    __tablename__ = "packages"

    id                      = Column(String, primary_key=True, default=new_uuid)
    name                    = Column(String, nullable=False)
    quantified_ingredients  = Column(JSON)                  # {ingredient_id: quantity}
    portion_quantity        = Column(Integer)               # e.g. serves 2 persons
    cook_time               = Column(String)                # ISO 8601 duration, e.g. "PT15M"
    description             = Column(Text)
    instructions            = Column(JSON)                  # list of step strings

    ingredients = relationship("Ingredient", secondary=package_ingredient, back_populates="packages")
    orders      = relationship("Order", secondary=order_package, back_populates="packages")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id          = Column(String, primary_key=True, default=new_uuid)
    name        = Column(String, nullable=False)
    description = Column(Text)

    packages  = relationship("Package",  secondary=package_ingredient,  back_populates="ingredients")
    articles  = relationship("Article",  secondary=ingredient_article,  back_populates="ingredients")


class Article(Base):
    """A single sellable item in the store."""
    __tablename__ = "articles"

    id               = Column(String, primary_key=True, default=new_uuid)
    name             = Column(String, nullable=False)
    sku              = Column(String, unique=True, nullable=False)   # links to physical warehouse item
    category         = Column(String)
    nutrition_table  = Column(Text)
    nutriscore       = Column(String)                                # "A" – "E"
    carbon_footprint = Column(Float)                                 # kg CO2e
    is_biological    = Column(Boolean, default=False)
    description      = Column(Text)
    allergy_labels   = Column(JSON)                                  # list of strings
    image_url        = Column(String)
    is_available     = Column(Boolean, default=True)
    price            = Column(Float, nullable=False)

    ingredients  = relationship("Ingredient", secondary=ingredient_article, back_populates="articles")
    orderlines   = relationship("Orderline",  back_populates="article")
    stock        = relationship("Stock",      back_populates="article")


class Order(Base):
    __tablename__ = "orders"

    id            = Column(String, primary_key=True, default=new_uuid)
    customer_id   = Column(String, ForeignKey("customers.id"), nullable=False)
    creation_date = Column(DateTime)
    delivery_id   = Column(String, ForeignKey("deliveries.id"))
    status        = Column(String, default="paid")                  # paid | fulfilled | in transit | delivered
    total_price   = Column(Float, default=0.0)

    customer   = relationship("Customer",  back_populates="orders")
    delivery   = relationship("Delivery",  back_populates="orders")
    orderlines = relationship("Orderline", back_populates="order")
    packages   = relationship("Package",   secondary=order_package,  back_populates="orders")


class Orderline(Base):
    """One line on a receipt — links an order to a specific article + quantity."""
    __tablename__ = "orderlines"

    id       = Column(String, primary_key=True, default=new_uuid)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    sku      = Column(String, ForeignKey("articles.sku"), nullable=False)
    quantity = Column(Integer, nullable=False)

    order   = relationship("Order",   back_populates="orderlines")
    article = relationship("Article", back_populates="orderlines")


class Delivery(Base):
    __tablename__ = "deliveries"

    id               = Column(String, primary_key=True, default=new_uuid)
    timeslot         = Column(String)                               # e.g. "2026-04-08 10:00-12:00"
    delivery_moment  = Column(DateTime)                             # actual moment of delivery
    trip_id          = Column(String)
    hub_id           = Column(String, ForeignKey("hubs.id"))
    fc_id            = Column(String, ForeignKey("fcs.id"))

    orders = relationship("Order", back_populates="delivery")
    hub    = relationship("Hub", back_populates="deliveries")
    fc     = relationship("FC",  back_populates="deliveries")


class Stock(Base):
    """Stock level of an article at a specific fulfillment center."""
    __tablename__ = "stock"

    sku                     = Column(String, ForeignKey("articles.sku"), primary_key=True)
    fc_id                   = Column(String, ForeignKey("fcs.id"),       primary_key=True)
    stock_location          = Column(String)                             # specific location inside FC
    quantity                = Column(Integer, default=0)
    last_delivery_timestamp = Column(DateTime)                           # freshness deadline
    is_marked_imperfect     = Column(Boolean, default=False)             # e.g. dented cans

    article = relationship("Article", back_populates="stock")
    fc      = relationship("FC",      back_populates="stock")


class FC(Base):
    """Fulfillment center — orders are picked here and sent to hubs."""
    __tablename__ = "fcs"

    id      = Column(String, primary_key=True)                          # e.g. "FC-FRA-01"
    address = Column(String)
    country = Column(String)

    deliveries = relationship("Delivery", back_populates="fc")
    stock      = relationship("Stock",    back_populates="fc")


class Hub(Base):
    """Local distribution hub — EPVs depart from here to deliver to neighborhoods."""
    __tablename__ = "hubs"

    id      = Column(String, primary_key=True)                          # e.g. "HUB-VIE-01"
    address = Column(String)
    country = Column(String)

    deliveries = relationship("Delivery", back_populates="hub")


# ── DB helpers ────────────────────────────────────────────────────────────────

def init_db() -> None:
    """Create all tables (skips existing ones)."""
    Base.metadata.create_all(bind=engine)


def drop_db() -> None:
    """Drop ALL tables — all data will be lost."""
    Base.metadata.drop_all(bind=engine)


def reset_db() -> None:
    """Drop and recreate all tables (empty DB)."""
    drop_db()
    init_db()


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Context-manager session for use in scripts."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_session() -> Generator[Session, None, None]:
    """FastAPI-compatible dependency that yields a session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    print("Database initialised — tables created.")
