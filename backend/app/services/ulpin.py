"""ULPIN generation / validation service."""
import re

ULPIN_RE = re.compile(r"^[A-Z]{2,3}-[A-Z]{2}-[A-Z]{2,3}-\d{4,5}-B\d{2}-F\d{2}-U\d{2}$")


def generate_ulpin(
    country: str = "IND",
    state: str = "TG",
    city: str = "HYD",
    parcel: str | int = "0000",
    building: int = 1,
    floor: int = 1,
    unit: int = 1,
) -> str:
    c = (country or "IND").upper()[:3].ljust(3, "X")
    s = (state or "TG").upper()[:2].ljust(2, "X")
    ci = (city or "HYD").upper()[:3].ljust(3, "X")
    p = str(parcel).zfill(4)[-5:]
    if len(p) < 4:
        p = p.zfill(4)
    b = f"B{int(building):02d}"
    f = f"F{int(floor):02d}"
    u = f"U{int(unit):02d}"
    return f"{c}-{s}-{ci}-{p}-{b}-{f}-{u}"


def validate_ulpin(code: str) -> dict:
    code = (code or "").strip().upper()
    if ULPIN_RE.match(code):
        parts = code.split("-")
        return {
            "valid": True,
            "code": code,
            "parts": {
                "country": parts[0],
                "state": parts[1],
                "city": parts[2],
                "parcel": parts[3],
                "building": parts[4],
                "floor": parts[5],
                "unit": parts[6],
            },
        }
    return {
        "valid": False,
        "code": code,
        "error": "ULPIN must match COUNTRY-STATE-CITY-PARCEL-Bxx-Fxx-Uxx (e.g. IND-TG-HYD-01928-B01-F04-U01)",
    }
