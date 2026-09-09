"""Seed LANDVERSE 3D with demo parcels, buildings, floors, units, infra + ULPIN."""
from sqlalchemy.orm import Session

from . import models


def seed_db(db: Session) -> dict:
    if db.query(models.Parcel).count() > 0:
        return {"seeded": False, "reason": "parcels already exist"}

    parcels_data = [
        {"parcel_number": "PRC-01928", "location": "Hyderabad, Telangana", "latitude": 17.3850, "longitude": 78.4867, "area": 2500.5, "status": "active"},
        {"parcel_number": "PRC-01929", "location": "Hyderabad, Telangana", "latitude": 17.3950, "longitude": 78.4967, "area": 1800.0, "status": "active"},
        {"parcel_number": "PRC-01930", "location": "Hyderabad, Telangana", "latitude": 17.3750, "longitude": 78.4767, "area": 3200.75, "status": "active"},
        {"parcel_number": "PRC-01931", "location": "Hyderabad, Telangana", "latitude": 17.4050, "longitude": 78.5067, "area": 1500.25, "status": "active"},
        {"parcel_number": "PRC-01932", "location": "Hyderabad, Telangana", "latitude": 17.3650, "longitude": 78.4667, "area": 2800.0, "status": "active"},
    ]
    parcels = []
    for p in parcels_data:
        obj = models.Parcel(**p)
        db.add(obj)
        parcels.append(obj)
    db.flush()

    buildings_data = [
        {"parcel_id": parcels[0].id, "building_code": "BLD-2041", "height": 42.6, "floors": 12, "building_type": "Residential - High Rise", "ai_confidence": 94.2, "status": "valid"},
        {"parcel_id": parcels[0].id, "building_code": "BLD-2042", "height": 21.0, "floors": 6, "building_type": "Residential - Mid Rise", "ai_confidence": 91.5, "status": "valid"},
        {"parcel_id": parcels[1].id, "building_code": "BLD-2043", "height": 70.0, "floors": 20, "building_type": "Commercial - Tower", "ai_confidence": 96.8, "status": "valid"},
        {"parcel_id": parcels[2].id, "building_code": "BLD-2044", "height": 15.5, "floors": 4, "building_type": "Residential - Low Rise", "ai_confidence": 89.3, "status": "valid"},
        {"parcel_id": parcels[2].id, "building_code": "BLD-2045", "height": 35.0, "floors": 10, "building_type": "Residential - High Rise", "ai_confidence": 93.1, "status": "valid"},
        {"parcel_id": parcels[3].id, "building_code": "BLD-2046", "height": 28.0, "floors": 8, "building_type": "Mixed Use", "ai_confidence": 90.7, "status": "valid"},
        {"parcel_id": parcels[4].id, "building_code": "BLD-2047", "height": 50.0, "floors": 15, "building_type": "Commercial - Tower", "ai_confidence": 95.0, "status": "valid"},
        {"parcel_id": parcels[4].id, "building_code": "BLD-2048", "height": 18.0, "floors": 5, "building_type": "Residential - Mid Rise", "ai_confidence": 88.9, "status": "valid"},
    ]
    buildings = []
    for b in buildings_data:
        obj = models.Building(**b)
        db.add(obj)
        buildings.append(obj)
    db.flush()

    # 12 floors for BLD-2041 + 4 units on floor 4
    floor_objs = []
    for n in range(1, 13):
        f = models.Floor(building_id=buildings[0].id, floor_number=n, height=3.5, units_count=4 if n == 4 else 2)
        db.add(f)
        floor_objs.append(f)
    db.flush()

    # Generic floors for other buildings (2 sample floors each so hierarchy works)
    for b in buildings[1:]:
        for n in range(1, min(4, (b.floors or 3) + 1)):
            db.add(models.Floor(building_id=b.id, floor_number=n, height=3.4, units_count=2))
    db.flush()

    floor4 = floor_objs[3]
    for num, area, ptype, own in [
        ("401", 1250.0, "Residential", "Owned"),
        ("402", 1100.5, "Residential", "Owned"),
        ("403", 1350.75, "Residential", "Rented"),
        ("404", 980.25, "Residential", "Owned"),
    ]:
        db.add(models.PropertyUnit(floor_id=floor4.id, unit_number=num, area=area, property_type=ptype, owner_status=own))

    infra_data = [
        {"infrastructure_id": "INF-0293", "type": "Water Pipeline", "depth": 8.4, "status": "active", "owner": "Municipal Authority"},
        {"infrastructure_id": "INF-0294", "type": "Electric Cable", "depth": 5.0, "status": "active", "owner": "Power Corporation"},
        {"infrastructure_id": "INF-0295", "type": "Sewer", "depth": 10.2, "status": "active", "owner": "Municipal Authority"},
        {"infrastructure_id": "INF-0296", "type": "Metro Tunnel", "depth": 25.0, "status": "active", "owner": "Metro Rail"},
        {"infrastructure_id": "INF-0297", "type": "Fiber Cable", "depth": 3.5, "status": "active", "owner": "Telecom Provider"},
    ]
    for i in infra_data:
        db.add(models.Infrastructure(**i))
    db.flush()

    db.add(
        models.UlpinRecord(
            parcel_id=parcels[0].id,
            building_id=buildings[0].id,
            floor_id=floor4.id,
            ulpin_code="IND-TG-HYD-01928-B01-F04-U01",
            country="IND",
            state="TG",
            city="HYD",
        )
    )
    db.commit()
    return {"seeded": True, "parcels": len(parcels_data), "buildings": len(buildings_data)}
