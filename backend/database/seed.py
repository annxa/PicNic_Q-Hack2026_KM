from datetime import datetime, timedelta
try:
    from backend.database.database import SessionLocal, Customer, Article, Stock, FC, Hub, Ingredient, Package, Persona, Level, Order, Orderline
except ModuleNotFoundError:
    from database import SessionLocal, Customer, Article, Stock, FC, Hub, Ingredient, Package, Persona, Level, Order, Orderline


class Seeder:
    """Inserts initial demo data into the database."""

    def __init__(self):
        self.db = SessionLocal()

    def run(self):
        self._seed_fcs()
        self._seed_hubs()
        self._seed_personas()
        self._seed_customers()
        self._seed_articles()
        self._seed_ingredients()
        self._seed_packages()
        self._seed_orders()
        self.db.commit()
        self.db.close()
        print("Seeding complete.")

    def _seed_personas(self):
        self.db.add_all([
            Persona(name="seniors",         tag="routine",  price_sensitivity=Level.medium,    eco_awareness=Level.low,       brand_loyalty=Level.high,    novelty_interest=Level.low,       recipe_interest=Level.medium),
            Persona(name="students",        tag="budget",   price_sensitivity=Level.very_high, eco_awareness=Level.medium,    brand_loyalty=Level.low,     novelty_interest=Level.high,      recipe_interest=Level.low),
            Persona(name="biological",      tag="quality",  price_sensitivity=Level.low,       eco_awareness=Level.very_high, brand_loyalty=Level.medium,  novelty_interest=Level.medium,    recipe_interest=Level.high),
            Persona(name="regional",        tag="quality",  price_sensitivity=Level.medium,    eco_awareness=Level.high,      brand_loyalty=Level.high,    novelty_interest=Level.low,       recipe_interest=Level.high),
            Persona(name="bargain_hunters", tag="budget",   price_sensitivity=Level.very_high, eco_awareness=Level.low,       brand_loyalty=Level.none,    novelty_interest=Level.medium,    recipe_interest=Level.low),
            Persona(name="gourmet",         tag="premium",  price_sensitivity=Level.very_low,  eco_awareness=Level.medium,    brand_loyalty=Level.low,     novelty_interest=Level.very_high, recipe_interest=Level.very_high),
            Persona(name="pet_owners",      tag="mixed",    price_sensitivity=Level.medium,    eco_awareness=Level.medium,    brand_loyalty=Level.high,    novelty_interest=Level.low,       recipe_interest=Level.low),
            Persona(name="plant_based",     tag="quality",  price_sensitivity=Level.medium,    eco_awareness=Level.high,      brand_loyalty=Level.medium,  novelty_interest=Level.high,      recipe_interest=Level.high),
            Persona(name="fitness",         tag="quality",  price_sensitivity=Level.low,       eco_awareness=Level.medium,    brand_loyalty=Level.medium,  novelty_interest=Level.medium,    recipe_interest=Level.high),
        ])

    def _seed_orders(self):
        self.db.flush()

        # look up customer IDs and article prices by email / SKU
        customers = {c.email: c.id for c in self.db.query(Customer).all()}
        articles  = {a.sku: a.price for a in self.db.query(Article).all()}

        def make_order(email, days_ago, items, status="delivered"):
            """items = list of (sku, quantity)"""
            cid = customers[email]
            order = Order(
                customer_id=cid,
                creation_date=datetime.now() - timedelta(days=days_ago),
                status=status,
                total_price=sum(articles[sku] * qty for sku, qty in items),
            )
            self.db.add(order)
            self.db.flush()
            for sku, qty in items:
                self.db.add(Orderline(order_id=order.id, sku=sku, quantity=qty))

        # ── seniors: Margaret — trusted brands, dairy & bread, small basket ──
        for days, items in [
            (63, [("DAI-MLK-001", 2), ("BAK-BRD-001", 1), ("DAI-BUT-001", 1)]),
            (56, [("DAI-MLK-001", 2), ("DAI-EGG-001", 1), ("BAK-BRD-001", 1)]),
            (49, [("DAI-MLK-001", 2), ("BAK-BRD-001", 2), ("DAI-YOG-001", 1)]),
            (42, [("DAI-MLK-001", 2), ("DAI-BUT-001", 1), ("DAI-EGG-001", 1)]),
            (35, [("DAI-MLK-001", 2), ("BAK-BRD-001", 1), ("DRK-OJC-001", 1)]),
            (28, [("DAI-MLK-001", 2), ("DAI-YOG-001", 2), ("BAK-BRD-001", 1)]),
            (14, [("DAI-MLK-001", 2), ("DAI-EGG-001", 1), ("DAI-BUT-001", 1)]),
            ( 7, [("DAI-MLK-001", 2), ("BAK-BRD-001", 1), ("DAI-YOG-001", 1)]),
        ]:
            make_order("margaret.thompson@example.com", days, items)

        # ── students: Jake — cheap, snacks, instant, own brands ──
        for days, items in [
            (58, [("BAK-BRD-001", 2), ("DAI-MLK-001", 1), ("VEG-TOM-001", 1)]),
            (51, [("BAK-BRD-001", 3), ("DAI-EGG-001", 1)]),
            (44, [("VEG-TOM-001", 2), ("BAK-BRD-001", 2), ("DAI-MLK-001", 1)]),
            (37, [("BAK-BRD-001", 2), ("DAI-YOG-001", 2), ("DRK-OJC-001", 1)]),
            (30, [("BAK-BRD-001", 3), ("DAI-MLK-001", 2)]),
            (23, [("VEG-TOM-001", 1), ("BAK-BRD-001", 2), ("DAI-EGG-001", 1)]),
            (10, [("BAK-BRD-001", 2), ("DAI-MLK-001", 1), ("VEG-LET-001", 1)]),
        ]:
            make_order("jake.mueller@example.com", days, items)

        # ── biological: Sophie — bio, low footprint, vegetables ──
        for days, items in [
            (60, [("VEG-BRC-001", 2), ("VEG-LET-001", 2), ("DAI-EGG-001", 1)]),
            (53, [("VEG-BRC-001", 2), ("VEG-TOM-001", 2), ("DAI-YOG-001", 1)]),
            (46, [("VEG-LET-001", 3), ("VEG-BRC-001", 2), ("DRK-OJC-001", 1)]),
            (39, [("DAI-EGG-001", 2), ("VEG-BRC-001", 2), ("VEG-TOM-001", 1)]),
            (32, [("VEG-LET-001", 2), ("VEG-BRC-001", 3), ("DAI-YOG-001", 2)]),
            (25, [("VEG-TOM-001", 2), ("VEG-LET-001", 2), ("DAI-EGG-001", 1)]),
            (18, [("VEG-BRC-001", 3), ("VEG-LET-001", 2), ("DRK-OJC-001", 1)]),
            (11, [("DAI-EGG-001", 2), ("VEG-BRC-001", 2), ("VEG-TOM-001", 2)]),
            ( 4, [("VEG-LET-001", 3), ("VEG-BRC-001", 2), ("DAI-YOG-001", 1)]),
        ]:
            make_order("sophie.green@example.com", days, items)

        # ── regional: Hans — seasonal veg, local produce ──
        for days, items in [
            (55, [("VEG-TOM-001", 2), ("VEG-BRC-001", 2), ("MEA-CHK-001", 1)]),
            (48, [("VEG-TOM-001", 3), ("VEG-LET-001", 2), ("DAI-EGG-001", 1)]),
            (41, [("VEG-BRC-001", 2), ("MEA-CHK-001", 1), ("DAI-MLK-001", 1)]),
            (34, [("VEG-TOM-001", 2), ("VEG-BRC-001", 3), ("DAI-BUT-001", 1)]),
            (27, [("MEA-CHK-001", 2), ("VEG-TOM-001", 2), ("VEG-LET-001", 1)]),
            (20, [("VEG-BRC-001", 3), ("DAI-EGG-001", 2), ("DAI-MLK-001", 1)]),
            (13, [("VEG-TOM-001", 2), ("MEA-CHK-001", 1), ("VEG-LET-001", 2)]),
            ( 6, [("VEG-BRC-001", 2), ("VEG-TOM-001", 2), ("DAI-BUT-001", 1)]),
        ]:
            make_order("hans.bauer@example.com", days, items)

        # ── bargain_hunters: Lisa — near-expiry, bulk bread, cheap items ──
        for days, items in [
            (62, [("BAK-BRD-001", 3), ("DAI-YOG-001", 3), ("VEG-TOM-001", 2)]),
            (54, [("BAK-BRD-001", 4), ("DAI-MLK-001", 2)]),
            (47, [("DAI-YOG-001", 4), ("BAK-BRD-001", 3), ("VEG-LET-001", 2)]),
            (40, [("BAK-BRD-001", 4), ("VEG-TOM-001", 3), ("DAI-YOG-001", 2)]),
            (33, [("DAI-YOG-001", 3), ("BAK-BRD-001", 4)]),
            (26, [("BAK-BRD-001", 3), ("DAI-MLK-001", 2), ("VEG-TOM-001", 2)]),
            (19, [("DAI-YOG-001", 4), ("BAK-BRD-001", 3), ("VEG-LET-001", 1)]),
            (12, [("BAK-BRD-001", 4), ("VEG-TOM-001", 2), ("DAI-YOG-001", 3)]),
            ( 5, [("BAK-BRD-001", 3), ("DAI-MLK-001", 2), ("DAI-YOG-001", 2)]),
        ]:
            make_order("lisa.koch@example.com", days, items)

        # ── gourmet: Antoine — premium, variety, large baskets ──
        for days, items in [
            (59, [("MEA-CHK-001", 2), ("VEG-TOM-001", 2), ("DAI-BUT-001", 2), ("DRK-OJC-001", 2)]),
            (52, [("MEA-CHK-001", 3), ("VEG-BRC-001", 2), ("DAI-EGG-001", 2), ("DAI-BUT-001", 1)]),
            (45, [("MEA-CHK-001", 2), ("VEG-LET-001", 3), ("DAI-BUT-001", 2), ("DRK-OJC-001", 1)]),
            (38, [("MEA-CHK-001", 3), ("VEG-TOM-001", 3), ("DAI-EGG-001", 2), ("VEG-BRC-001", 2)]),
            (31, [("MEA-CHK-001", 2), ("DAI-BUT-001", 2), ("VEG-LET-001", 2), ("DRK-OJC-001", 2)]),
            (24, [("MEA-CHK-001", 3), ("VEG-TOM-001", 2), ("DAI-EGG-001", 2), ("VEG-BRC-001", 2)]),
            (17, [("MEA-CHK-001", 2), ("DAI-BUT-001", 2), ("DRK-OJC-001", 2), ("VEG-LET-001", 2)]),
            (10, [("MEA-CHK-001", 3), ("VEG-TOM-001", 2), ("DAI-EGG-001", 2), ("VEG-BRC-001", 1)]),
            ( 3, [("MEA-CHK-001", 2), ("DAI-BUT-001", 3), ("DRK-OJC-001", 2), ("VEG-TOM-001", 2)]),
        ]:
            make_order("antoine.dubois@example.com", days, items)

        # ── pet_owners: Emma — regular food + pet-adjacent bulk ──
        for days, items in [
            (57, [("MEA-CHK-001", 2), ("DAI-MLK-001", 2), ("VEG-BRC-001", 1)]),
            (50, [("MEA-CHK-001", 2), ("DAI-EGG-001", 1), ("DAI-MLK-001", 2)]),
            (43, [("MEA-CHK-001", 3), ("VEG-TOM-001", 1), ("DAI-MLK-001", 2)]),
            (36, [("MEA-CHK-001", 2), ("DAI-MLK-001", 2), ("VEG-BRC-001", 2)]),
            (29, [("MEA-CHK-001", 2), ("DAI-EGG-001", 2), ("DAI-MLK-001", 1)]),
            (22, [("MEA-CHK-001", 3), ("DAI-MLK-001", 2), ("VEG-TOM-001", 1)]),
            (15, [("MEA-CHK-001", 2), ("VEG-BRC-001", 1), ("DAI-EGG-001", 1)]),
            ( 8, [("MEA-CHK-001", 2), ("DAI-MLK-001", 2), ("VEG-TOM-001", 1)]),
        ]:
            make_order("emma.clarke@example.com", days, items)

        # ── plant_based: Maya — no meat/dairy, veg heavy ──
        for days, items in [
            (61, [("VEG-BRC-001", 3), ("VEG-TOM-001", 2), ("VEG-LET-001", 2), ("DRK-OJC-001", 1)]),
            (54, [("VEG-LET-001", 3), ("VEG-BRC-001", 2), ("VEG-TOM-001", 3)]),
            (47, [("VEG-BRC-001", 3), ("VEG-TOM-001", 2), ("DRK-OJC-001", 2)]),
            (40, [("VEG-LET-001", 4), ("VEG-BRC-001", 3), ("VEG-TOM-001", 2)]),
            (33, [("VEG-TOM-001", 3), ("VEG-BRC-001", 2), ("DRK-OJC-001", 2)]),
            (26, [("VEG-LET-001", 3), ("VEG-BRC-001", 3), ("VEG-TOM-001", 2)]),
            (19, [("VEG-BRC-001", 3), ("DRK-OJC-001", 2), ("VEG-LET-001", 2)]),
            (12, [("VEG-TOM-001", 3), ("VEG-LET-001", 3), ("VEG-BRC-001", 2)]),
            ( 5, [("VEG-BRC-001", 4), ("VEG-TOM-001", 2), ("DRK-OJC-001", 1)]),
        ]:
            make_order("maya.patel@example.com", days, items)

        # ── fitness: Tom — protein, eggs, chicken, meal prep ──
        for days, items in [
            (64, [("MEA-CHK-001", 3), ("DAI-EGG-001", 2), ("VEG-BRC-001", 2), ("DAI-YOG-001", 2)]),
            (57, [("MEA-CHK-001", 4), ("DAI-EGG-001", 3), ("VEG-BRC-001", 2)]),
            (50, [("MEA-CHK-001", 3), ("DAI-EGG-001", 2), ("DAI-YOG-001", 3), ("VEG-TOM-001", 1)]),
            (43, [("MEA-CHK-001", 4), ("DAI-EGG-001", 2), ("VEG-BRC-001", 3)]),
            (36, [("MEA-CHK-001", 3), ("DAI-YOG-001", 3), ("DAI-EGG-001", 2), ("VEG-BRC-001", 2)]),
            (29, [("MEA-CHK-001", 4), ("DAI-EGG-001", 3), ("VEG-TOM-001", 1)]),
            (22, [("MEA-CHK-001", 3), ("DAI-EGG-001", 2), ("DAI-YOG-001", 2), ("VEG-BRC-001", 2)]),
            (15, [("MEA-CHK-001", 4), ("DAI-EGG-001", 3), ("VEG-BRC-001", 2)]),
            ( 8, [("MEA-CHK-001", 3), ("DAI-YOG-001", 3), ("DAI-EGG-001", 2), ("VEG-TOM-001", 1)]),
            ( 1, [("MEA-CHK-001", 4), ("DAI-EGG-001", 2), ("VEG-BRC-001", 3), ("DAI-YOG-001", 2)]),
        ]:
            make_order("tom.fischer@example.com", days, items)

    def _seed_fcs(self):
        self.db.add_all([
            FC(id="FC-FRA-01", address="Am Terminal 1, Frankfurt", country="Germany"),
            FC(id="FC-BER-01", address="Lagerstraße 12, Berlin",   country="Germany"),
        ])

    def _seed_hubs(self):
        self.db.add_all([
            Hub(id="HUB-VIE-01", address="Industriestraße 5, Viernheim", country="Germany"),
            Hub(id="HUB-BER-01", address="Ringstraße 3, Berlin",         country="Germany"),
        ])

    def _seed_customers(self):
        # look up persona IDs by name after flush
        self.db.flush()
        p = {
            row.name: row.id
            for row in self.db.query(Persona).all()
        }

        self.db.add_all([
            # seniors — Margaret, 72, Berlin, routine shopper
            Customer(
                name="Margaret Thompson",
                date_of_birth="1953-04-18",
                email="margaret.thompson@example.com",
                phone_number="+49 30 111222",
                address="Lindenstraße 4, Berlin",
                country="Germany",
                house_hold_size=2,
                has_children=False,
                diet="omni",
                age_range="51+",
                location="Berlin",
                tech_savviness="low",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["seniors"],
            ),
            # students — Jake, 22, Hamburg, tight budget
            Customer(
                name="Jake Müller",
                date_of_birth="2002-09-03",
                email="jake.mueller@example.com",
                phone_number="+49 40 333444",
                address="Studentenweg 12, Hamburg",
                country="Germany",
                house_hold_size=3,
                has_children=False,
                diet="omni",
                age_range="18-25",
                location="Hamburg",
                tech_savviness="high",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["students"],
            ),
            # biological — Sophie, 34, Munich, eco-conscious family
            Customer(
                name="Sophie Green",
                date_of_birth="1990-06-21",
                email="sophie.green@example.com",
                phone_number="+49 89 555666",
                address="Ökoweg 7, Munich",
                country="Germany",
                house_hold_size=4,
                has_children=True,
                diet="vegetarian",
                age_range="26-35",
                location="Munich",
                tech_savviness="medium",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["biological"],
            ),
            # regional — Hans, 45, Frankfurt, locally sourced food
            Customer(
                name="Hans Bauer",
                date_of_birth="1979-11-30",
                email="hans.bauer@example.com",
                phone_number="+49 69 777888",
                address="Marktplatz 2, Frankfurt",
                country="Germany",
                house_hold_size=3,
                has_children=True,
                diet="omni",
                age_range="36-50",
                location="Frankfurt",
                tech_savviness="medium",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["regional"],
            ),
            # bargain_hunters — Lisa, 29, Cologne, always hunting deals
            Customer(
                name="Lisa Koch",
                date_of_birth="1995-02-14",
                email="lisa.koch@example.com",
                phone_number="+49 221 999000",
                address="Sparstraße 18, Cologne",
                country="Germany",
                house_hold_size=1,
                has_children=False,
                diet="omni",
                age_range="26-35",
                location="Cologne",
                tech_savviness="high",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["bargain_hunters"],
            ),
            # gourmet — Antoine, 41, Düsseldorf, premium food lover
            Customer(
                name="Antoine Dubois",
                date_of_birth="1983-07-09",
                email="antoine.dubois@example.com",
                phone_number="+49 211 123123",
                address="Feinschmeckerweg 5, Düsseldorf",
                country="Germany",
                house_hold_size=2,
                has_children=False,
                diet="omni",
                age_range="36-50",
                location="Düsseldorf",
                tech_savviness="medium",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["gourmet"],
            ),
            # pet_owners — Emma, 37, Stuttgart, two dogs at home
            Customer(
                name="Emma Clarke",
                date_of_birth="1987-03-25",
                email="emma.clarke@example.com",
                phone_number="+49 711 456456",
                address="Tiergartenstraße 9, Stuttgart",
                country="Germany",
                house_hold_size=2,
                has_children=False,
                diet="omni",
                age_range="36-50",
                location="Stuttgart",
                tech_savviness="medium",
                has_pets=True,
                intolerances="",
                co2=0.00,
                persona_id=p["pet_owners"],
            ),
            # plant_based — Maya, 26, Leipzig, strict plant-based diet
            Customer(
                name="Maya Patel",
                date_of_birth="1998-12-01",
                email="maya.patel@example.com",
                phone_number="+49 341 789789",
                address="Grünstraße 3, Leipzig",
                country="Germany",
                house_hold_size=1,
                has_children=False,
                diet="vegan",
                age_range="18-25",
                location="Leipzig",
                tech_savviness="high",
                has_pets=False,
                intolerances="lactose",
                co2=0.00,
                persona_id=p["plant_based"],
            ),
            # fitness — Tom, 31, Nuremberg, meal prep every Sunday
            Customer(
                name="Tom Fischer",
                date_of_birth="1993-08-17",
                email="tom.fischer@example.com",
                phone_number="+49 911 321321",
                address="Sportstraße 22, Nuremberg",
                country="Germany",
                house_hold_size=1,
                has_children=False,
                diet="omni",
                age_range="26-35",
                location="Nuremberg",
                tech_savviness="high",
                has_pets=False,
                intolerances="",
                co2=0.00,
                persona_id=p["fitness"],
            ),
        ])

    def _seed_articles(self):
        articles = [
            Article(name="Whole Milk 1L",       sku="DAI-MLK-001", category="Dairy",      price=1.09, nutriscore="C", carbon_footprint=3.2,  is_biological=False, allergy_labels=["milk"],        is_available=True),
            Article(name="Butter 250g",          sku="DAI-BUT-001", category="Dairy",      price=1.79, nutriscore="D", carbon_footprint=5.6,  is_biological=False, allergy_labels=["milk"],        is_available=True),
            Article(name="Eggs 10 pack",         sku="DAI-EGG-001", category="Dairy",      price=2.49, nutriscore="B", carbon_footprint=2.1,  is_biological=True,  allergy_labels=["eggs"],        is_available=True),
            Article(name="White Bread 500g",     sku="BAK-BRD-001", category="Bakery",     price=1.29, nutriscore="C", carbon_footprint=0.9,  is_biological=False, allergy_labels=["gluten"],      is_available=True),
            Article(name="Broccoli 500g",        sku="VEG-BRC-001", category="Vegetables", price=0.99, nutriscore="A", carbon_footprint=0.4,  is_biological=True,  allergy_labels=[],              is_available=True),
            Article(name="Tomatoes 1kg",         sku="VEG-TOM-001", category="Vegetables", price=1.49, nutriscore="A", carbon_footprint=0.5,  is_biological=False, allergy_labels=[],              is_available=True),
            Article(name="Chicken Breast 500g",  sku="MEA-CHK-001", category="Meat",       price=4.99, nutriscore="B", carbon_footprint=6.9,  is_biological=False, allergy_labels=[],              is_available=True),
            Article(name="Orange Juice 1L",      sku="DRK-OJC-001", category="Drinks",     price=1.99, nutriscore="C", carbon_footprint=0.8,  is_biological=False, allergy_labels=[],              is_available=True),
            Article(name="Romaine Lettuce",      sku="VEG-LET-001", category="Vegetables", price=0.75, nutriscore="A", carbon_footprint=0.5,  is_biological=True,  allergy_labels=[],              is_available=True),
            Article(name="Plain Yoghurt 500g",   sku="DAI-YOG-001", category="Dairy",      price=0.89, nutriscore="B", carbon_footprint=2.4,  is_biological=False, allergy_labels=["milk"],        is_available=True),
        ]
        self.db.add_all(articles)
        self.db.flush()

        stock_entries = [
            Stock(sku=a.sku, fc_id="FC-FRA-01", stock_location=loc, quantity=qty)
            for a, loc, qty in zip(
                articles,
                ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3", "A4"],
                [50, 30, 40, 8, 60, 45, 20, 70, 35, 5],
            )
        ]
        self.db.add_all(stock_entries)

    def _seed_ingredients(self):
        self.db.add_all([
            Ingredient(name="Lettuce",  description="Fresh green leafy vegetable."),
            Ingredient(name="Tomato",   description="Red, juicy fruit used as a vegetable."),
            Ingredient(name="Chicken",  description="Lean white meat, high in protein."),
            Ingredient(name="Milk",     description="Dairy liquid from cows."),
        ])

    def _seed_packages(self):
        self.db.add_all([
            Package(
                name="Simple Salad Box",
                description="A fresh and crunchy starter kit.",
                cook_time="PT15M",
                portion_quantity=2,
                quantified_ingredients={},  # can be filled with ingredient IDs later
                instructions=["Wash vegetables.", "Chop vegetables.", "Mix in a bowl."],
            ),
            Package(
                name="Weekly Breakfast Bundle",
                description="Everything you need for a full week of breakfasts.",
                cook_time="PT10M",
                portion_quantity=2,
                quantified_ingredients={},
                instructions=["Boil eggs.", "Toast bread.", "Pour milk."],
            ),
        ])


if __name__ == "__main__":
    try:
        from database import reset_db
    except ModuleNotFoundError:
        from backend.database.database import reset_db
    reset_db()
    Seeder().run()
