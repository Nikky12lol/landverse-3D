-- LANDVERSE 3D Seed Data (PostgreSQL)
INSERT INTO parcels (parcel_number, location, latitude, longitude, area, status) VALUES
('PRC-01928', 'Hyderabad, Telangana', 17.3850, 78.4867, 2500.5, 'active'),
('PRC-01929', 'Hyderabad, Telangana', 17.3950, 78.4967, 1800.0, 'active'),
('PRC-01930', 'Hyderabad, Telangana', 17.3750, 78.4767, 3200.75, 'active'),
('PRC-01931', 'Hyderabad, Telangana', 17.4050, 78.5067, 1500.25, 'active'),
('PRC-01932', 'Hyderabad, Telangana', 17.3650, 78.4667, 2800.0, 'active')
ON CONFLICT (parcel_number) DO NOTHING;

INSERT INTO buildings (parcel_id, building_code, height, floors, building_type, ai_confidence, status) VALUES
(1, 'BLD-2041', 42.6, 12, 'Residential - High Rise', 94.2, 'valid'),
(1, 'BLD-2042', 21.0, 6, 'Residential - Mid Rise', 91.5, 'valid'),
(2, 'BLD-2043', 70.0, 20, 'Commercial - Tower', 96.8, 'valid'),
(3, 'BLD-2044', 15.5, 4, 'Residential - Low Rise', 89.3, 'valid'),
(3, 'BLD-2045', 35.0, 10, 'Residential - High Rise', 93.1, 'valid'),
(4, 'BLD-2046', 28.0, 8, 'Mixed Use', 90.7, 'valid'),
(5, 'BLD-2047', 50.0, 15, 'Commercial - Tower', 95.0, 'valid'),
(5, 'BLD-2048', 18.0, 5, 'Residential - Mid Rise', 88.9, 'valid')
ON CONFLICT (building_code) DO NOTHING;
