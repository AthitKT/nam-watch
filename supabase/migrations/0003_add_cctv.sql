-- Add cctv_url to stations
ALTER TABLE stations ADD COLUMN cctv_url TEXT;

-- Seed some mock CCTV snapshot URLs for key canal stations
UPDATE stations 
SET cctv_url = 'https://images.unsplash.com/photo-1582035889700-0e1ce8e76e5d?w=800&q=80' 
WHERE name LIKE '%แสนแสบ%' OR name LIKE '%ผดุงกรุงเกษม%';

UPDATE stations 
SET cctv_url = 'https://images.unsplash.com/photo-1614995779774-7294ed05f8bc?w=800&q=80' 
WHERE name LIKE '%ลาดพร้าว%' OR name LIKE '%เปรมประชากร%';
