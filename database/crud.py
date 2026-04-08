from sqlalchemy.orm import Session
from sqlalchemy import func
try:
    from database.database import SessionLocal, Customer, Article, Order, Orderline, Stock, Package
except ModuleNotFoundError:
    from database import SessionLocal, Customer, Article, Order, Orderline, Stock, Package


