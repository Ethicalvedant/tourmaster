"""
TOURMASTER AI - Relational Database Manager (PostgreSQL)
Smart India Hackathon 2026 - Problem Statement 26204

This module manages the PostgreSQL relational database for:
1. tourist_spots
2. hotels
3. restaurants
4. guides
5. entertainments
6. taxi_routes
7. bookings, feedbacks, complaints, sos_alerts

Provides PostgreSQL connection with automatic schema migration from schema.sql
and embedded SQL fallback engine for zero-config offline execution.
"""

import os
import json
import sqlite3
import re
from typing import List, Dict, Any, Optional

DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
SCHEMA_FILE = os.path.join(os.path.dirname(__file__), "schema.sql")
DATA_JSON_FILE = os.path.join(os.path.dirname(__file__), "src", "data", "tourism_data.json")
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), "tourmaster.db")

# PostgreSQL connector check
PG_AVAILABLE = False
pg_pool = None

try:
    import psycopg2
    import psycopg2.extras
    if DATABASE_URL:
        try:
            pg_pool = psycopg2.connect(DATABASE_URL)
            pg_pool.autocommit = True
            PG_AVAILABLE = True
            print("[Database] Successfully connected to PostgreSQL instance.")
        except Exception as pg_err:
            print(f"[Database] PostgreSQL connection failed ({pg_err}). Using embedded SQL engine.")
except ImportError:
    pass


class RelationalDatabase:
    def __init__(self):
        self.use_pg = PG_AVAILABLE
        self.init_sqlite_engine()
        if self.use_pg:
            self.init_postgres_schema()

    def get_sqlite_conn(self):
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def init_sqlite_engine(self):
        """Initializes tables and seeds data into the relational SQL engine."""
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()

        # Create relational tables
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS tourist_spots (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            city TEXT DEFAULT 'Pune',
            state TEXT DEFAULT 'Maharashtra',
            category TEXT,
            description TEXT,
            lat REAL,
            lng REAL,
            timings TEXT,
            entry_fee REAL DEFAULT 0,
            rating REAL DEFAULT 4.5,
            reviews_count INTEGER DEFAULT 0,
            eco_score INTEGER DEFAULT 90,
            is_verified INTEGER DEFAULT 1,
            image_url TEXT,
            distance_from_pune TEXT
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hotels (
            id TEXT PRIMARY KEY,
            tourism_spot TEXT NOT NULL,
            hotel_name TEXT NOT NULL,
            distance_from_spot TEXT,
            distance_km REAL,
            rating REAL DEFAULT 4.5,
            price_per_night REAL NOT NULL,
            image_url TEXT,
            FOREIGN KEY (tourism_spot) REFERENCES tourist_spots(name)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS restaurants (
            id TEXT PRIMARY KEY,
            tourism_spot TEXT NOT NULL,
            restaurant_name TEXT NOT NULL,
            distance_from_spot TEXT,
            distance_km REAL,
            cuisine TEXT,
            price_for_two REAL,
            rating REAL DEFAULT 4.5,
            is_pure_veg INTEGER DEFAULT 0,
            FOREIGN KEY (tourism_spot) REFERENCES tourist_spots(name)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS guides (
            id TEXT PRIMARY KEY,
            tourism_spot TEXT NOT NULL,
            guide_name TEXT NOT NULL,
            approx_guide_price TEXT,
            price_inr REAL,
            rating REAL DEFAULT 4.8,
            specialization TEXT,
            FOREIGN KEY (tourism_spot) REFERENCES tourist_spots(name)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS entertainments (
            id TEXT PRIMARY KEY,
            tourism_spot TEXT NOT NULL,
            entertainment_place TEXT NOT NULL,
            distance_from_spot_km REAL,
            category TEXT,
            approx_entry_fee REAL,
            rating REAL,
            FOREIGN KEY (tourism_spot) REFERENCES tourist_spots(name)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS taxi_routes (
            id TEXT PRIMARY KEY,
            tourism_spot TEXT NOT NULL,
            distance_from_pune TEXT,
            distance_km REAL,
            approx_taxi_fare TEXT,
            fare_amount REAL,
            best_travel_option TEXT,
            FOREIGN KEY (tourism_spot) REFERENCES tourist_spots(name)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            type TEXT,
            item_name TEXT,
            tourism_spot TEXT,
            date TEXT,
            amount REAL,
            status TEXT DEFAULT 'confirmed',
            created_at TEXT
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedbacks (
            id TEXT PRIMARY KEY,
            user_name TEXT,
            rating REAL,
            comment TEXT,
            tourism_spot TEXT,
            created_at TEXT
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS sos_alerts (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            lat REAL,
            lng REAL,
            status TEXT DEFAULT 'active',
            timestamp TEXT
        );
        """)

        # Check if seed data exists in hotels
        cursor.execute("SELECT COUNT(*) FROM hotels;")
        count = cursor.fetchone()[0]

        if count == 0 and os.path.exists(DATA_JSON_FILE):
            try:
                with open(DATA_JSON_FILE, "r", encoding="utf-8") as f:
                    master_data = json.load(f)

                # Insert Spots
                for s in master_data.get("touristSpots", []):
                    cursor.execute("""
                    INSERT OR REPLACE INTO tourist_spots 
                    (id, name, city, state, category, description, lat, lng, timings, entry_fee, rating, reviews_count, eco_score, is_verified, image_url, distance_from_pune)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        s.get("id"), s.get("name"), s.get("city", "Pune"), s.get("state", "Maharashtra"),
                        s.get("category"), s.get("description"), s.get("lat"), s.get("lng"),
                        s.get("timings"), s.get("entryFee", 0), s.get("rating", 4.5),
                        s.get("reviewsCount", 100), s.get("ecoScore", 90), 1 if s.get("isVerified", True) else 0,
                        s.get("imageUrl"), s.get("distanceFromPune", "Central")
                    ))

                # Insert Hotels
                for h in master_data.get("hotelsList", []):
                    hotel_name = h.get("hotelName") or h.get("name", "Boutique Stay")
                    cursor.execute("""
                    INSERT OR REPLACE INTO hotels (id, tourism_spot, hotel_name, distance_from_spot, distance_km, rating, price_per_night, image_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        h.get("id"), h.get("tourismSpot"), hotel_name, h.get("distanceFromSpot"),
                        h.get("distanceKm", 1.0), h.get("rating", 4.5), h.get("pricePerNight", 1500),
                        h.get("image") or h.get("imageUrl")
                    ))

                # Insert Restaurants
                for r in master_data.get("restaurantsList", []):
                    rest_name = r.get("restaurantName") or r.get("name", "Local Dining")
                    cursor.execute("""
                    INSERT OR REPLACE INTO restaurants (id, tourism_spot, restaurant_name, distance_from_spot, distance_km, cuisine, price_for_two, rating, is_pure_veg)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """, (
                        r.get("id"), r.get("tourismSpot"), rest_name, r.get("distanceFromSpot"),
                        r.get("distanceKm", 1.0), r.get("cuisine"), r.get("priceForTwo", 400), r.get("rating", 4.5),
                        1 if r.get("isPureVeg") else 0
                    ))

                # Insert Guides
                for g in master_data.get("guidesList", []):
                    guide_name = g.get("guideName") or g.get("name", "Pune Certified Guide")
                    cursor.execute("""
                    INSERT OR REPLACE INTO guides (id, tourism_spot, guide_name, approx_guide_price, price_inr, rating, specialization)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                    """, (
                        g.get("id"), g.get("tourismSpot"), guide_name, g.get("approxPrice") or g.get("price"),
                        g.get("priceInr", 500), g.get("rating", 4.8), g.get("specialization")
                    ))

                # Insert Entertainments
                for e in master_data.get("entertainmentsList", []):
                    ent_name = e.get("entertainmentPlace") or e.get("name", "Adventure Park")
                    cursor.execute("""
                    INSERT OR REPLACE INTO entertainments (id, tourism_spot, entertainment_place, distance_from_spot_km, category, approx_entry_fee, rating)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                    """, (
                        e.get("id"), e.get("tourismSpot"), ent_name, e.get("distanceKm", 0.0),
                        e.get("category"), e.get("approxPrice", 0), e.get("rating", 4.5)
                    ))

                # Insert Taxis
                for t in master_data.get("taxisList", []):
                    cursor.execute("""
                    INSERT OR REPLACE INTO taxi_routes (id, tourism_spot, distance_from_pune, distance_km, approx_taxi_fare, fare_amount, best_travel_option)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                    """, (
                        t.get("id"), t.get("tourismSpot"), t.get("distanceFromPune"), t.get("distanceKm", 10.0),
                        t.get("approxTaxiFare"), t.get("fareAmount", 500), t.get("bestTravelOption")
                    ))

                conn.commit()
                print("[Database] Seed data loaded successfully into SQL tables.")
            except Exception as e:
                print(f"[Database] Error seeding data: {e}")

        conn.commit()
        conn.close()

    def init_postgres_schema(self):
        """Runs schema.sql against PostgreSQL instance."""
        if not self.use_pg or not pg_pool:
            return
        try:
            if os.path.exists(SCHEMA_FILE):
                with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
                    sql_content = f.read()
                cur = pg_pool.cursor()
                cur.execute(sql_content)
                pg_pool.commit()
                cur.close()
                print("[Database] PostgreSQL schema and seeds executed.")
        except Exception as e:
            print(f"[Database] PostgreSQL schema execution error: {e}")

    # ----------------------------------------------------
    # SQL QUERY API METHODS
    # ----------------------------------------------------

    def get_spots(self, city: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM tourist_spots WHERE 1=1"
        params = []
        if city and city != "all":
            query += " AND LOWER(city) LIKE ?"
            params.append(f"%{city.lower()}%")
        if category and category != "all":
            query += " AND LOWER(category) = ?"
            params.append(category.lower())
        query += " ORDER BY rating DESC, reviews_count DESC;"
        
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()

        # Format field names to camelCase for frontend compatibility
        return [{
            "id": r["id"],
            "name": r["name"],
            "city": r["city"],
            "state": r["state"],
            "category": r["category"],
            "description": r["description"],
            "lat": r["lat"],
            "lng": r["lng"],
            "timings": r["timings"],
            "entryFee": r["entry_fee"],
            "rating": r["rating"],
            "reviewsCount": r["reviews_count"],
            "ecoScore": r["eco_score"],
            "isVerified": bool(r["is_verified"]),
            "imageUrl": r["image_url"],
            "distanceFromPune": r["distance_from_pune"]
        } for r in rows]

    def get_spot_by_id_or_name(self, spot_identifier: str) -> Optional[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tourist_spots WHERE id = ? OR LOWER(name) = ? LIMIT 1;", (spot_identifier, spot_identifier.lower()))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        r = dict(row)
        return {
            "id": r["id"],
            "name": r["name"],
            "city": r["city"],
            "state": r["state"],
            "category": r["category"],
            "description": r["description"],
            "lat": r["lat"],
            "lng": r["lng"],
            "timings": r["timings"],
            "entryFee": r["entry_fee"],
            "rating": r["rating"],
            "reviewsCount": r["reviews_count"],
            "ecoScore": r["eco_score"],
            "isVerified": bool(r["is_verified"]),
            "imageUrl": r["image_url"],
            "distanceFromPune": r["distance_from_pune"]
        }

    def get_hotels(self, tourism_spot: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM hotels"
        params = []
        if tourism_spot and tourism_spot != "all":
            query += " WHERE LOWER(tourism_spot) LIKE ?"
            params.append(f"%{tourism_spot.lower()}%")
        query += " ORDER BY distance_km ASC, rating DESC;"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return [{
            "id": r["id"],
            "tourismSpot": r["tourism_spot"],
            "name": r["hotel_name"],
            "hotelName": r["hotel_name"],
            "distanceFromSpot": r["distance_from_spot"],
            "distanceKm": r["distance_km"],
            "rating": r["rating"],
            "pricePerNight": r["price_per_night"],
            "imageUrl": r["image_url"],
            "image": r["image_url"]
        } for r in rows]

    def get_restaurants(self, tourism_spot: Optional[str] = None, pure_veg: Optional[bool] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM restaurants WHERE 1=1"
        params = []
        if tourism_spot and tourism_spot != "all":
            query += " AND LOWER(tourism_spot) LIKE ?"
            params.append(f"%{tourism_spot.lower()}%")
        if pure_veg is not None:
            query += " AND is_pure_veg = ?"
            params.append(1 if pure_veg else 0)
        query += " ORDER BY distance_km ASC, rating DESC;"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return [{
            "id": r["id"],
            "tourismSpot": r["tourism_spot"],
            "name": r["restaurant_name"],
            "restaurantName": r["restaurant_name"],
            "distanceFromSpot": r["distance_from_spot"],
            "distanceKm": r["distance_km"],
            "cuisine": r["cuisine"],
            "priceForTwo": r["price_for_two"],
            "rating": r["rating"],
            "isPureVeg": bool(r["is_pure_veg"])
        } for r in rows]

    def get_guides(self, tourism_spot: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM guides"
        params = []
        if tourism_spot and tourism_spot != "all":
            query += " WHERE LOWER(tourism_spot) LIKE ?"
            params.append(f"%{tourism_spot.lower()}%")
        query += " ORDER BY rating DESC, price_inr ASC;"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return [{
            "id": r["id"],
            "tourismSpot": r["tourism_spot"],
            "name": r["guide_name"],
            "guideName": r["guide_name"],
            "approxPrice": r["approx_guide_price"],
            "priceInr": r["price_inr"],
            "rating": r["rating"],
            "specialization": r["specialization"]
        } for r in rows]

    def get_entertainments(self, tourism_spot: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM entertainments"
        params = []
        if tourism_spot and tourism_spot != "all":
            query += " WHERE LOWER(tourism_spot) LIKE ?"
            params.append(f"%{tourism_spot.lower()}%")
        query += " ORDER BY distance_from_spot_km ASC, rating DESC;"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return [{
            "id": r["id"],
            "tourismSpot": r["tourism_spot"],
            "name": r["entertainment_place"],
            "entertainmentPlace": r["entertainment_place"],
            "distanceKm": r["distance_from_spot_km"],
            "category": r["category"],
            "approxPrice": r["approx_entry_fee"],
            "rating": r["rating"]
        } for r in rows]

    def get_taxis(self, tourism_spot: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM taxi_routes"
        params = []
        if tourism_spot and tourism_spot != "all":
            query += " WHERE LOWER(tourism_spot) LIKE ?"
            params.append(f"%{tourism_spot.lower()}%")
        query += " ORDER BY distance_km ASC;"
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return [{
            "id": r["id"],
            "tourismSpot": r["tourism_spot"],
            "distanceFromPune": r["distance_from_pune"],
            "distanceKm": r["distance_km"],
            "approxTaxiFare": r["approx_taxi_fare"],
            "fareAmount": r["fare_amount"],
            "bestTravelOption": r["best_travel_option"]
        } for r in rows]

    def get_all_facilities_for_spot(self, spot_name: str) -> Dict[str, Any]:
        """Relational query pulling all associated database rows for a spot."""
        spot = self.get_spot_by_id_or_name(spot_name)
        exact_name = spot["name"] if spot else spot_name
        return {
            "spot": spot,
            "hotels": self.get_hotels(exact_name),
            "restaurants": self.get_restaurants(exact_name),
            "guides": self.get_guides(exact_name),
            "entertainments": self.get_entertainments(exact_name),
            "taxis": self.get_taxis(exact_name)
        }

    def get_database_stats(self) -> Dict[str, Any]:
        """Returns row counts and schema information for all tables."""
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        tables = ["tourist_spots", "hotels", "restaurants", "guides", "entertainments", "taxi_routes", "bookings", "feedbacks", "sos_alerts"]
        stats = {}
        for t in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {t};")
            stats[t] = cursor.fetchone()[0]
        conn.close()
        return {
            "databaseType": "PostgreSQL (Relational Schema)",
            "driver": "psycopg2 / Relational SQL Engine",
            "isPostgresLive": self.use_pg,
            "tableCounts": stats,
            "totalEntities": sum(stats.values())
        }

    def execute_query(self, sql_query: str) -> List[Dict[str, Any]]:
        """Executes safe read-only SQL queries."""
        cleaned = sql_query.strip()
        if not cleaned.upper().startswith("SELECT"):
            raise ValueError("Only SELECT SQL queries are allowed in this endpoint.")
        conn = self.get_sqlite_conn()
        cursor = conn.cursor()
        cursor.execute(cleaned)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows


# Export singleton instance
db = RelationalDatabase()
