import hashlib
import os
import sqlite3
from pathlib import Path


DB_PATH = Path(os.getenv("STREAMFORGE_DB", "./data/streamforge.db"))


def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def password_hash(password, salt):
    return hashlib.scrypt(password.encode(), salt=salt.encode(), n=16384, r=8, p=1).hex()


def initialize():
    with connect() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS plans (
          id TEXT PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL,
          quality TEXT NOT NULL, stream_limit INTEGER NOT NULL,
          tier INTEGER NOT NULL UNIQUE, features TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
          salt TEXT NOT NULL, role TEXT NOT NULL, plan_id TEXT REFERENCES plans(id)
        );
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS profiles (
          id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), name TEXT NOT NULL,
          avatar TEXT NOT NULL, maturity_limit INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 0,
          UNIQUE(user_id, name)
        );
        CREATE TABLE IF NOT EXISTS titles (
          id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, synopsis TEXT NOT NULL,
          type TEXT NOT NULL, genres TEXT NOT NULL, maturity_rating INTEGER NOT NULL,
          release_year INTEGER NOT NULL, media_meta TEXT NOT NULL, image TEXT NOT NULL,
          available INTEGER NOT NULL, tier INTEGER NOT NULL, published INTEGER NOT NULL,
          keywords TEXT NOT NULL, created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS watchlist (
          user_id TEXT NOT NULL REFERENCES users(id), title_id TEXT NOT NULL REFERENCES titles(id),
          PRIMARY KEY(user_id, title_id)
        );
        CREATE TABLE IF NOT EXISTS faults (
          endpoint TEXT PRIMARY KEY, mode TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0
        );
        """)
        if db.execute("SELECT 1 FROM plans LIMIT 1").fetchone():
            return
        plans = [
            ("plan-spark", "Spark", 7.99, "HD", 1, 1, "1 stream, HD, full catalog"),
            ("plan-flare", "Flare", 12.99, "Full HD", 2, 2, "2 streams, Full HD, premium titles"),
            ("plan-nova", "Nova", 18.99, "4K", 4, 3, "4 streams, 4K, complete catalog"),
        ]
        db.executemany("INSERT INTO plans VALUES (?, ?, ?, ?, ?, ?, ?)", plans)
        users = [
            ("user-river", "river@streamforge.test", "stream123", "subscriber", "plan-spark"),
            ("user-sage", "sage@streamforge.test", "stream123", "subscriber", "plan-nova"),
            ("user-admin", "admin@streamforge.test", "admin123", "admin", "plan-nova"),
        ]
        for user_id, email, password, role, plan_id in users:
            salt = user_id
            db.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", (user_id, email, password_hash(password, salt), salt, role, plan_id))
        db.executemany("INSERT INTO profiles VALUES (?, ?, ?, ?, ?, ?)", [
            ("profile-river", "user-river", "River", "ember", 18, 1),
            ("profile-sage", "user-sage", "Sage", "lumen", 18, 1),
        ])
        names = [
            "Afterlight", "Signal Bloom", "Northstar", "Glass Harbor", "Quiet Orbit",
            "Copper Sky", "The Last Frequency", "Paper Kingdom", "Velvet Current", "Static Hearts",
            "Moonline", "Wild Meridian", "Echo District", "Second Sunrise", "Neon Orchard",
            "The Long Return", "Parallel Summer", "Firewatch Bay", "Blue Hour", "Faultline",
            "Hidden Atlas", "Night Assembly", "Soft Collision", "Borrowed Weather", "Deep Field",
            "Winter Signal", "Open Circuit", "The Memory Coast", "Golden Static", "Terminal Garden",
        ]
        genres = ["Drama", "Sci-Fi", "Thriller", "Comedy", "Documentary", "Adventure"]
        for index, name in enumerate(names, 1):
            db.execute(
                "INSERT INTO titles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (f"title-{index:02}", name, f"A bold journey through {name.lower()}, where every choice changes what comes next.",
                 "series" if index % 3 == 0 else "movie", f"{genres[index % 6]},{genres[(index + 2) % 6]}",
                 [7, 13, 16, 18][index % 4], 2000 + index % 25, f"{88 + index} min" if index % 3 else f"{6 + index % 5} episodes",
                 f"/posters/title-{index:02}.jpg", 0 if index in (11, 24) else 1, 1 + index % 3,
                 0 if index in (29, 30) else 1, f"{name.lower()} original journey", f"2026-01-{index:02}T00:00:00Z")
            )
        db.executemany("INSERT INTO watchlist VALUES (?, ?)", [("user-river", "title-02"), ("user-sage", "title-05")])


def reset():
    if DB_PATH.exists():
        DB_PATH.unlink()
    initialize()
