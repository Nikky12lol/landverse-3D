-- LANDVERSE 3D Database Schema (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS parcels (
    id SERIAL PRIMARY KEY,
    parcel_number VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area DOUBLE PRECISION,
    geometry JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    building_code VARCHAR(50) UNIQUE NOT NULL,
    height DOUBLE PRECISION,
    floors INTEGER,
    building_type VARCHAR(100),
    ai_confidence DOUBLE PRECISION,
    footprint JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS floors (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    height DOUBLE PRECISION,
    units_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_units (
    id SERIAL PRIMARY KEY,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    unit_number VARCHAR(50) NOT NULL,
    area DOUBLE PRECISION,
    property_type VARCHAR(100),
    owner_status VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ulpin_records (
    id SERIAL PRIMARY KEY,
    parcel_id INTEGER REFERENCES parcels(id) ON DELETE CASCADE,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    floor_id INTEGER REFERENCES floors(id) ON DELETE CASCADE,
    unit_id INTEGER REFERENCES property_units(id) ON DELETE CASCADE,
    ulpin_code VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(10),
    state VARCHAR(10),
    city VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS infrastructure (
    id SERIAL PRIMARY KEY,
    infrastructure_id VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50),
    depth DOUBLE PRECISION,
    geometry JSONB,
    status VARCHAR(50) DEFAULT 'active',
    owner VARCHAR(100),
    conflict_status VARCHAR(50) DEFAULT 'no_conflict',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_analysis_jobs (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    confidence DOUBLE PRECISION,
    height DOUBLE PRECISION,
    floors INTEGER,
    building_type VARCHAR(100),
    footprint JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS validation_results (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    score DOUBLE PRECISION,
    status VARCHAR(50),
    warnings JSONB,
    checks JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcels_number ON parcels(parcel_number);
CREATE INDEX IF NOT EXISTS idx_buildings_code ON buildings(building_code);
CREATE INDEX IF NOT EXISTS idx_ulpin_code ON ulpin_records(ulpin_code);
CREATE INDEX IF NOT EXISTS idx_infrastructure_type ON infrastructure(type);
