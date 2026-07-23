import json
import os
import secrets
import time
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

from .db import connect, initialize, password_hash, reset
from .models import FaultInput, PlanChange, ProfileInput, SignIn, TitleInput


app = FastAPI(title="StreamForge API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[os.getenv("WEB_ORIGIN", "http://localhost:3000")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup():
    initialize()


@app.middleware("http")
async def correlation(request: Request, call_next):
    correlation_id = request.headers.get("x-correlation-id", secrets.token_hex(8))
    request.state.correlation_id = correlation_id
    response = await call_next(request)
    response.headers["x-correlation-id"] = correlation_id
    return response


@app.exception_handler(HTTPException)
async def api_error(request: Request, error: HTTPException):
    detail = error.detail if isinstance(error.detail, dict) else {"code": "request_failed", "message": str(error.detail)}
    return JSONResponse({**detail, "correlationId": request.state.correlation_id}, status_code=error.status_code)


def current_user(session: str | None = Cookie(default=None)):
    if not session:
        raise HTTPException(401, {"code": "authentication_required", "message": "Sign in to continue."})
    with connect() as db:
        user = db.execute("SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.id=? AND expires_at>?", (session, datetime.now(timezone.utc).isoformat())).fetchone()
    if not user:
        raise HTTPException(401, {"code": "session_expired", "message": "Your session has expired."})
    return dict(user)


def admin(user=Depends(current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, {"code": "forbidden", "message": "Administrator access is required."})
    return user


def title_dict(row):
    item = dict(row)
    item["genres"] = item["genres"].split(",")
    item["available"] = bool(item["available"])
    item["published"] = bool(item["published"])
    return item


def apply_fault(endpoint):
    with connect() as db:
        fault = db.execute("SELECT * FROM faults WHERE endpoint=?", (endpoint,)).fetchone()
    if not fault:
        return None
    if fault["mode"] == "latency":
        time.sleep(fault["value"] / 1000)
    if fault["mode"] == "error":
        raise HTTPException(503, {"code": "simulated_failure", "message": "The service is temporarily unavailable. Please retry."})
    return fault["mode"]


@app.get("/health/live")
def live():
    return {"status": "alive"}


@app.get("/health/ready")
def ready():
    with connect() as db:
        db.execute("SELECT 1").fetchone()
    return {"status": "ready"}


@app.post("/api/v1/auth/sign-in")
def sign_in(data: SignIn, response: Response):
    with connect() as db:
        user = db.execute("SELECT * FROM users WHERE email=?", (data.email.lower(),)).fetchone()
        if not user or password_hash(data.password, user["salt"]) != user["password_hash"]:
            raise HTTPException(401, {"code": "invalid_credentials", "message": "Email or password is incorrect."})
        session_id = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(hours=12)
        db.execute("INSERT INTO sessions VALUES (?, ?, ?)", (session_id, user["id"], expires.isoformat()))
    response.set_cookie("session", session_id, httponly=True, samesite="lax", secure=os.getenv("STREAMFORGE_ENV") == "production-like", max_age=43200)
    return {"id": user["id"], "email": user["email"], "role": user["role"]}


@app.post("/api/v1/auth/sign-out", status_code=204)
def sign_out(response: Response, session: str | None = Cookie(default=None)):
    if session:
        with connect() as db:
            db.execute("DELETE FROM sessions WHERE id=?", (session,))
    response.delete_cookie("session")


@app.get("/api/v1/auth/session")
def session(user=Depends(current_user)):
    return {"id": user["id"], "email": user["email"], "role": user["role"]}


@app.get("/api/v1/plans")
def plans():
    with connect() as db:
        return [dict(row) for row in db.execute("SELECT * FROM plans ORDER BY tier")]


@app.get("/api/v1/account")
def account(user=Depends(current_user)):
    with connect() as db:
        plan = dict(db.execute("SELECT * FROM plans WHERE id=?", (user["plan_id"],)).fetchone())
        profiles = [dict(row) for row in db.execute("SELECT * FROM profiles WHERE user_id=? ORDER BY name", (user["id"],))]
    for profile in profiles:
        profile["active"] = bool(profile["active"])
    return {"id": user["id"], "email": user["email"], "role": user["role"], "plan": plan, "profiles": profiles}


@app.put("/api/v1/account/plan")
def change_plan(data: PlanChange, user=Depends(current_user)):
    with connect() as db:
        plan = db.execute("SELECT * FROM plans WHERE id=?", (data.plan_id,)).fetchone()
        if not plan:
            raise HTTPException(404, {"code": "plan_not_found", "message": "Plan not found."})
        db.execute("UPDATE users SET plan_id=? WHERE id=?", (data.plan_id, user["id"]))
    return dict(plan)


@app.get("/api/v1/profiles")
def profiles(user=Depends(current_user)):
    with connect() as db:
        rows = [dict(row) for row in db.execute("SELECT * FROM profiles WHERE user_id=? ORDER BY name", (user["id"],))]
    for row in rows:
        row["active"] = bool(row["active"])
    return rows


@app.post("/api/v1/profiles", status_code=201)
def create_profile(data: ProfileInput, user=Depends(current_user)):
    name = data.name.strip()
    with connect() as db:
        if db.execute("SELECT COUNT(*) count FROM profiles WHERE user_id=?", (user["id"],)).fetchone()["count"] >= 5:
            raise HTTPException(422, {"code": "profile_limit", "message": "An account can have up to five profiles."})
        if db.execute("SELECT 1 FROM profiles WHERE user_id=? AND lower(name)=lower(?)", (user["id"], name)).fetchone():
            raise HTTPException(409, {"code": "duplicate_profile", "message": "Profile names must be unique."})
        profile_id = f"profile-{secrets.token_hex(6)}"
        db.execute("INSERT INTO profiles VALUES (?, ?, ?, ?, ?, 0)", (profile_id, user["id"], name, data.avatar, data.maturity_limit))
    return {"id": profile_id, **data.model_dump(), "name": name, "active": False}


@app.put("/api/v1/profiles/{profile_id}")
def update_profile(profile_id: str, data: ProfileInput, user=Depends(current_user)):
    name = data.name.strip()
    with connect() as db:
        found = db.execute("SELECT 1 FROM profiles WHERE id=? AND user_id=?", (profile_id, user["id"])).fetchone()
        if not found:
            raise HTTPException(404, {"code": "profile_not_found", "message": "Profile not found."})
        duplicate = db.execute("SELECT 1 FROM profiles WHERE user_id=? AND lower(name)=lower(?) AND id<>?", (user["id"], name, profile_id)).fetchone()
        if duplicate:
            raise HTTPException(409, {"code": "duplicate_profile", "message": "Profile names must be unique."})
        db.execute("UPDATE profiles SET name=?, avatar=?, maturity_limit=? WHERE id=?", (name, data.avatar, data.maturity_limit, profile_id))
    return {"id": profile_id, **data.model_dump(), "name": name}


@app.put("/api/v1/profiles/{profile_id}/select", status_code=204)
def select_profile(profile_id: str, user=Depends(current_user)):
    with connect() as db:
        found = db.execute("SELECT 1 FROM profiles WHERE id=? AND user_id=?", (profile_id, user["id"])).fetchone()
        if not found:
            raise HTTPException(404, {"code": "profile_not_found", "message": "Profile not found."})
        db.execute("UPDATE profiles SET active=0 WHERE user_id=?", (user["id"],))
        db.execute("UPDATE profiles SET active=1 WHERE id=?", (profile_id,))


@app.delete("/api/v1/profiles/{profile_id}", status_code=204)
def delete_profile(profile_id: str, user=Depends(current_user)):
    with connect() as db:
        if db.execute("SELECT COUNT(*) count FROM profiles WHERE user_id=?", (user["id"],)).fetchone()["count"] <= 1:
            raise HTTPException(409, {"code": "final_profile", "message": "The final profile cannot be deleted."})
        result = db.execute("DELETE FROM profiles WHERE id=? AND user_id=?", (profile_id, user["id"]))
        if not result.rowcount:
            raise HTTPException(404, {"code": "profile_not_found", "message": "Profile not found."})


@app.get("/api/v1/titles")
def titles(search: str = "", genre: str = "", type: str = "", availability: str = "", tier: int | None = None, sort: str = "recent", user=Depends(current_user)):
    mode = apply_fault("catalog")
    if mode == "empty":
        return {"items": [], "count": 0}
    if mode == "malformed":
        return PlainTextResponse("not-json", media_type="application/json")
    query = "SELECT * FROM titles WHERE published=1"
    values = []
    if search:
        query += " AND (lower(name) LIKE ? OR lower(keywords) LIKE ?)"
        values.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
    if genre:
        query += " AND genres LIKE ?"
        values.append(f"%{genre}%")
    if type:
        query += " AND type=?"
        values.append(type)
    if availability:
        query += " AND available=?"
        values.append(1 if availability == "available" else 0)
    if tier:
        query += " AND tier=?"
        values.append(tier)
    order = {"title": "name COLLATE NOCASE", "year": "release_year DESC", "recent": "created_at DESC"}.get(sort, "created_at DESC")
    with connect() as db:
        rows = db.execute(f"{query} ORDER BY {order}", values).fetchall()
        watchlist = {row["title_id"] for row in db.execute("SELECT title_id FROM watchlist WHERE user_id=?", (user["id"],))}
    items = [{**title_dict(row), "in_watchlist": row["id"] in watchlist} for row in rows]
    return {"items": items, "count": len(items)}


@app.get("/api/v1/titles/{title_id}")
def title(title_id: str, user=Depends(current_user)):
    with connect() as db:
        row = db.execute("SELECT * FROM titles WHERE id=? AND published=1", (title_id,)).fetchone()
        watching = db.execute("SELECT 1 FROM watchlist WHERE user_id=? AND title_id=?", (user["id"], title_id)).fetchone()
    if not row:
        raise HTTPException(404, {"code": "title_not_found", "message": "Title not found."})
    return {**title_dict(row), "in_watchlist": bool(watching)}


@app.get("/api/v1/watchlist")
def watchlist(user=Depends(current_user)):
    with connect() as db:
        rows = db.execute("SELECT titles.* FROM watchlist JOIN titles ON titles.id=watchlist.title_id WHERE watchlist.user_id=? AND titles.published=1 ORDER BY titles.name", (user["id"],)).fetchall()
    return [title_dict(row) for row in rows]


@app.put("/api/v1/watchlist/{title_id}", status_code=204)
def add_watchlist(title_id: str, user=Depends(current_user)):
    with connect() as db:
        title = db.execute("SELECT 1 FROM titles WHERE id=? AND published=1 AND available=1", (title_id,)).fetchone()
        if not title:
            raise HTTPException(404, {"code": "title_not_found", "message": "Available title not found."})
        db.execute("INSERT OR IGNORE INTO watchlist VALUES (?, ?)", (user["id"], title_id))


@app.delete("/api/v1/watchlist/{title_id}", status_code=204)
def remove_watchlist(title_id: str, user=Depends(current_user)):
    with connect() as db:
        db.execute("DELETE FROM watchlist WHERE user_id=? AND title_id=?", (user["id"], title_id))


@app.post("/api/v1/playback/{title_id}")
def authorize_playback(title_id: str, user=Depends(current_user)):
    if apply_fault("playback") == "playback":
        raise HTTPException(503, {"code": "playback_error", "message": "Playback could not start."})
    with connect() as db:
        title = db.execute("SELECT * FROM titles WHERE id=? AND published=1", (title_id,)).fetchone()
        plan = db.execute("SELECT name, tier FROM plans WHERE id=?", (user["plan_id"],)).fetchone()
        profile = db.execute("SELECT maturity_limit FROM profiles WHERE user_id=? AND active=1", (user["id"],)).fetchone()
    if not title:
        raise HTTPException(404, {"code": "title_not_found", "message": "Title not found."})
    if not title["available"]:
        raise HTTPException(403, {"code": "unavailable", "message": "This title is currently unavailable."})
    if title["tier"] > plan["tier"]:
        with connect() as db:
            required = db.execute("SELECT name FROM plans WHERE tier=?", (title["tier"],)).fetchone()
        raise HTTPException(403, {"code": "upgrade_required", "message": f"This title requires the {required['name']} plan. Your current plan is {plan['name']}."})
    if profile and title["maturity_rating"] > profile["maturity_limit"]:
        raise HTTPException(403, {"code": "maturity_restricted", "message": "This title exceeds the active profile maturity limit."})
    return {"authorized": True, "media": "/media/streamforge.mp4", "captions": "/media/captions.vtt"}


@app.get("/api/v1/admin/titles")
def admin_titles(user=Depends(admin)):
    with connect() as db:
        return [title_dict(row) for row in db.execute("SELECT * FROM titles ORDER BY created_at DESC")]


@app.post("/api/v1/admin/titles", status_code=201)
def create_title(data: TitleInput, user=Depends(admin)):
    with connect() as db:
        if db.execute("SELECT 1 FROM titles WHERE id=? OR lower(name)=lower(?)", (data.id, data.name)).fetchone():
            raise HTTPException(409, {"code": "title_conflict", "message": "Title ID and name must be unique."})
        values = data.model_dump()
        db.execute("INSERT INTO titles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (values["id"], values["name"].strip(), values["synopsis"].strip(), values["type"], ",".join(values["genres"]), values["maturity_rating"], values["release_year"], values["media_meta"], values["image"], int(values["available"]), values["tier"], int(values["published"]), values["keywords"], datetime.now(timezone.utc).isoformat()))
    return {**values, "name": values["name"].strip()}


@app.put("/api/v1/admin/titles/{title_id}")
def update_title(title_id: str, data: TitleInput, user=Depends(admin)):
    if title_id != data.id:
        raise HTTPException(422, {"code": "immutable_id", "message": "Title ID cannot be changed."})
    values = data.model_dump()
    with connect() as db:
        result = db.execute("UPDATE titles SET name=?, synopsis=?, type=?, genres=?, maturity_rating=?, release_year=?, media_meta=?, image=?, available=?, tier=?, published=?, keywords=? WHERE id=?", (values["name"].strip(), values["synopsis"].strip(), values["type"], ",".join(values["genres"]), values["maturity_rating"], values["release_year"], values["media_meta"], values["image"], int(values["available"]), values["tier"], int(values["published"]), values["keywords"], title_id))
        if not result.rowcount:
            raise HTTPException(404, {"code": "title_not_found", "message": "Title not found."})
    return values


@app.put("/api/v1/admin/titles/{title_id}/publish", status_code=204)
def publish_title(title_id: str, published: bool = Query(), user=Depends(admin)):
    with connect() as db:
        result = db.execute("UPDATE titles SET published=? WHERE id=?", (int(published), title_id))
        if not result.rowcount:
            raise HTTPException(404, {"code": "title_not_found", "message": "Title not found."})


@app.post("/api/v1/test/reset", status_code=204)
def reset_data():
    if os.getenv("STREAMFORGE_ENV", "local") == "production-like":
        raise HTTPException(404, {"code": "not_found", "message": "Not found."})
    reset()


@app.put("/api/v1/test/fault", status_code=204)
def set_fault(data: FaultInput):
    if os.getenv("STREAMFORGE_ENV", "local") == "production-like":
        raise HTTPException(404, {"code": "not_found", "message": "Not found."})
    with connect() as db:
        if data.mode == "off":
            db.execute("DELETE FROM faults WHERE endpoint=?", (data.endpoint,))
        else:
            db.execute("INSERT INTO faults VALUES (?, ?, ?) ON CONFLICT(endpoint) DO UPDATE SET mode=excluded.mode, value=excluded.value", (data.endpoint, data.mode, data.value))
