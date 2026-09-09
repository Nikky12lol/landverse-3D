"""Rule-based property validation."""


def validate_building(building: dict) -> dict:
    checks: dict = {}
    warnings: list[str] = []
    score = 100.0

    height = building.get("height") or 0
    floors = building.get("floors") or 0
    area = None
    parcel = building.get("parcel") or {}
    if isinstance(parcel, dict):
        area = parcel.get("area")
    confidence = building.get("ai_confidence") or 0
    btype = (building.get("building_type") or "").lower()

    # 1. height vs floors consistency (expect ~2.8–4.2 m / floor)
    if height and floors:
        per_floor = height / max(1, floors)
        checks["height_per_floor"] = round(per_floor, 2)
        if 2.8 <= per_floor <= 4.2:
            checks["height_floor_consistency"] = "pass"
        else:
            checks["height_floor_consistency"] = "fail"
            warnings.append(f"Height/floor ratio {per_floor:.1f} m is outside 2.8–4.2 m range")
            score -= 20
    else:
        checks["height_floor_consistency"] = "missing_data"
        warnings.append("Missing height or floor count")
        score -= 15

    # 2. AI confidence
    checks["ai_confidence"] = confidence
    if confidence >= 90:
        checks["ai_confidence_check"] = "pass"
    elif confidence >= 75:
        checks["ai_confidence_check"] = "review"
        warnings.append(f"AI confidence {confidence}% is moderate — manual review advised")
        score -= 10
    else:
        checks["ai_confidence_check"] = "fail"
        warnings.append(f"AI confidence {confidence}% is low — re-run analysis")
        score -= 25

    # 3. Parcel area present
    if area:
        checks["parcel_area"] = "pass"
    else:
        checks["parcel_area"] = "missing"
        warnings.append("Parcel area missing")
        score -= 10

    # 4. Building type known
    if btype:
        checks["building_type"] = "pass"
    else:
        checks["building_type"] = "missing"
        warnings.append("Building type not classified")
        score -= 10

    # 5. Floor count sanity
    if floors and 1 <= floors <= 60:
        checks["floor_count"] = "pass"
    else:
        checks["floor_count"] = "fail"
        warnings.append(f"Floor count {floors} looks unrealistic")
        score -= 15

    # 6. Height sanity
    if height and 3 <= height <= 300:
        checks["height_range"] = "pass"
    else:
        checks["height_range"] = "fail"
        warnings.append(f"Height {height} m looks unrealistic")
        score -= 15

    score = max(0.0, round(score, 1))
    if score >= 85:
        status = "valid"
    elif score >= 60:
        status = "review"
    else:
        status = "invalid"

    return {"score": score, "status": status, "warnings": warnings, "checks": checks}
