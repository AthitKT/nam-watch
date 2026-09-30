
-- 0002_fix_areas_and_dedup.sql
BEGIN;

-- 1. Enable RLS and add Policies
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access on areas" ON areas FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access on readings" ON readings FOR SELECT USING (true);

-- Update view to use security_invoker
DROP VIEW IF EXISTS latest_readings;
CREATE VIEW latest_readings WITH (security_invoker = true) AS
SELECT DISTINCT ON (station_id) * FROM readings ORDER BY station_id, ts DESC;

REVOKE INSERT, UPDATE, DELETE ON latest_readings FROM anon, authenticated, public;

-- 2. Seed Reference Areas (50 BKK Khets, 7 PTT Amphoes)
INSERT INTO areas (id, name_th, name_en, province, type) VALUES
('คลองเตย', 'คลองเตย', 'Khlong Toei', 'BKK', 'khet'),
('คลองสาน', 'คลองสาน', 'Khlong San', 'BKK', 'khet'),
('คลองสามวา', 'คลองสามวา', 'Khlong Sam Wa', 'BKK', 'khet'),
('คันนายาว', 'คันนายาว', 'Khan Na Yao', 'BKK', 'khet'),
('จตุจักร', 'จตุจักร', 'Chatuchak', 'BKK', 'khet'),
('จอมทอง', 'จอมทอง', 'Chom Thong', 'BKK', 'khet'),
('ดอนเมือง', 'ดอนเมือง', 'Don Mueang', 'BKK', 'khet'),
('ดินแดง', 'ดินแดง', 'Din Daeng', 'BKK', 'khet'),
('ดุสิต', 'ดุสิต', 'Dusit', 'BKK', 'khet'),
('ตลิ่งชัน', 'ตลิ่งชัน', 'Taling Chan', 'BKK', 'khet'),
('ทวีวัฒนา', 'ทวีวัฒนา', 'Thawi Watthana', 'BKK', 'khet'),
('ทุ่งครุ', 'ทุ่งครุ', 'Thung Khru', 'BKK', 'khet'),
('ธนบุรี', 'ธนบุรี', 'Thon Buri', 'BKK', 'khet'),
('บางเขน', 'บางเขน', 'Bang Khen', 'BKK', 'khet'),
('บางแค', 'บางแค', 'Bang Khae', 'BKK', 'khet'),
('บางกอกใหญ่', 'บางกอกใหญ่', 'Bangkok Yai', 'BKK', 'khet'),
('บางกอกน้อย', 'บางกอกน้อย', 'Bangkok Noi', 'BKK', 'khet'),
('บางกะปิ', 'บางกะปิ', 'Bang Kapi', 'BKK', 'khet'),
('บางขุนเทียน', 'บางขุนเทียน', 'Bang Khun Thian', 'BKK', 'khet'),
('บางคอแหลม', 'บางคอแหลม', 'Bang Kho Laem', 'BKK', 'khet'),
('บางซื่อ', 'บางซื่อ', 'Bang Sue', 'BKK', 'khet'),
('บางนา', 'บางนา', 'Bang Na', 'BKK', 'khet'),
('บางบอน', 'บางบอน', 'Bang Bon', 'BKK', 'khet'),
('บางพลัด', 'บางพลัด', 'Bang Phlat', 'BKK', 'khet'),
('บางรัก', 'บางรัก', 'Bang Rak', 'BKK', 'khet'),
('บึงกุ่ม', 'บึงกุ่ม', 'Bueng Kum', 'BKK', 'khet'),
('ปทุมวัน', 'ปทุมวัน', 'Pathum Wan', 'BKK', 'khet'),
('ประเวศ', 'ประเวศ', 'Prawet', 'BKK', 'khet'),
('ป้อมปราบศัตรูพ่าย', 'ป้อมปราบศัตรูพ่าย', 'Pom Prap Sattru Phai', 'BKK', 'khet'),
('พญาไท', 'พญาไท', 'Phaya Thai', 'BKK', 'khet'),
('พระโขนง', 'พระโขนง', 'Phra Khanong', 'BKK', 'khet'),
('พระนคร', 'พระนคร', 'Phra Nakhon', 'BKK', 'khet'),
('ภาษีเจริญ', 'ภาษีเจริญ', 'Phasi Charoen', 'BKK', 'khet'),
('มีนบุรี', 'มีนบุรี', 'Min Buri', 'BKK', 'khet'),
('ยานนาวา', 'ยานนาวา', 'Yan Nawa', 'BKK', 'khet'),
('ราชเทวี', 'ราชเทวี', 'Ratchathewi', 'BKK', 'khet'),
('ราษฎร์บูรณะ', 'ราษฎร์บูรณะ', 'Rat Burana', 'BKK', 'khet'),
('ลาดกระบัง', 'ลาดกระบัง', 'Lat Krabang', 'BKK', 'khet'),
('ลาดพร้าว', 'ลาดพร้าว', 'Lat Phrao', 'BKK', 'khet'),
('วังทองหลาง', 'วังทองหลาง', 'Wang Thonglang', 'BKK', 'khet'),
('วัฒนา', 'วัฒนา', 'Watthana', 'BKK', 'khet'),
('สวนหลวง', 'สวนหลวง', 'Suan Luang', 'BKK', 'khet'),
('สะพานสูง', 'สะพานสูง', 'Saphan Sung', 'BKK', 'khet'),
('สัมพันธวงศ์', 'สัมพันธวงศ์', 'Samphanthawong', 'BKK', 'khet'),
('สาทร', 'สาทร', 'Sathon', 'BKK', 'khet'),
('สายไหม', 'สายไหม', 'Sai Mai', 'BKK', 'khet'),
('หนองแขม', 'หนองแขม', 'Nong Khaem', 'BKK', 'khet'),
('หนองจอก', 'หนองจอก', 'Nong Chok', 'BKK', 'khet'),
('หลักสี่', 'หลักสี่', 'Lak Si', 'BKK', 'khet'),
('ห้วยขวาง', 'ห้วยขวาง', 'Huai Khwang', 'BKK', 'khet'),
('เมืองปทุมธานี', 'เมืองปทุมธานี', 'Mueang Pathum Thani', 'PTT', 'amphoe'),
('คลองหลวง', 'คลองหลวง', 'Khlong Luang', 'PTT', 'amphoe'),
('ธัญบุรี', 'ธัญบุรี', 'Thanyaburi', 'PTT', 'amphoe'),
('หนองเสือ', 'หนองเสือ', 'Nong Suea', 'PTT', 'amphoe'),
('ลาดหลุมแก้ว', 'ลาดหลุมแก้ว', 'Lat Lum Kaeo', 'PTT', 'amphoe'),
('ลำลูกกา', 'ลำลูกกา', 'Lam Luk Ka', 'PTT', 'amphoe'),
('สามโคก', 'สามโคก', 'Sam Khok', 'PTT', 'amphoe')
ON CONFLICT (id) DO NOTHING;


-- 3. Reassign stations to normalized areas
-- E.g. 'เขต บางกะปิ' -> 'บางกะปิ', 'อำเภอคลองหลวง' -> 'คลองหลวง'
UPDATE stations SET area_id = TRIM(REPLACE(REPLACE(area_id, 'เขต', ''), 'อำเภอ', ''));
-- Handle any stray spaces if there were "เขต บางกะปิ"
UPDATE stations SET area_id = TRIM(area_id);

-- 4. Delete the orphaned dynamically created areas (those with prefixes or BKK Amphoes)
-- Delete areas that are not in the seeded 57 ids
DELETE FROM areas WHERE id NOT IN (
'คลองเตย',
'คลองสาน',
'คลองสามวา',
'คันนายาว',
'จตุจักร',
'จอมทอง',
'ดอนเมือง',
'ดินแดง',
'ดุสิต',
'ตลิ่งชัน',
'ทวีวัฒนา',
'ทุ่งครุ',
'ธนบุรี',
'บางเขน',
'บางแค',
'บางกอกใหญ่',
'บางกอกน้อย',
'บางกะปิ',
'บางขุนเทียน',
'บางคอแหลม',
'บางซื่อ',
'บางนา',
'บางบอน',
'บางพลัด',
'บางรัก',
'บึงกุ่ม',
'ปทุมวัน',
'ประเวศ',
'ป้อมปราบศัตรูพ่าย',
'พญาไท',
'พระโขนง',
'พระนคร',
'ภาษีเจริญ',
'มีนบุรี',
'ยานนาวา',
'ราชเทวี',
'ราษฎร์บูรณะ',
'ลาดกระบัง',
'ลาดพร้าว',
'วังทองหลาง',
'วัฒนา',
'สวนหลวง',
'สะพานสูง',
'สัมพันธวงศ์',
'สาทร',
'สายไหม',
'หนองแขม',
'หนองจอก',
'หลักสี่',
'ห้วยขวาง',
'เมืองปทุมธานี',
'คลองหลวง',
'ธัญบุรี',
'หนองเสือ',
'ลาดหลุมแก้ว',
'ลำลูกกา',
'สามโคก'
);


-- 5. Deduplicate Stations: Merge watergate copies into river/canal copies
-- For river duplicates:
INSERT INTO readings (station_id, ts, level, level_out, situation_level, unit, quality)
SELECT 
  REPLACE(station_id, 'tw-gate-', 'tw-river-'), ts, level, level_out, situation_level, unit, quality
FROM readings
WHERE station_id LIKE 'tw-gate-%'
  AND REPLACE(station_id, 'tw-gate-', 'tw-river-') IN (SELECT id FROM stations WHERE id LIKE 'tw-river-%')
ON CONFLICT (station_id, ts) DO NOTHING;

DELETE FROM stations 
WHERE id LIKE 'tw-gate-%' 
  AND REPLACE(id, 'tw-gate-', 'tw-river-') IN (SELECT id FROM stations WHERE id LIKE 'tw-river-%');

-- For canal duplicates:
INSERT INTO readings (station_id, ts, level, level_out, situation_level, unit, quality)
SELECT 
  REPLACE(station_id, 'tw-gate-', 'tw-canal-'), ts, level, level_out, situation_level, unit, quality
FROM readings
WHERE station_id LIKE 'tw-gate-%'
  AND REPLACE(station_id, 'tw-gate-', 'tw-canal-') IN (SELECT id FROM stations WHERE id LIKE 'tw-canal-%')
ON CONFLICT (station_id, ts) DO NOTHING;

DELETE FROM stations 
WHERE id LIKE 'tw-gate-%' 
  AND REPLACE(id, 'tw-gate-', 'tw-canal-') IN (SELECT id FROM stations WHERE id LIKE 'tw-canal-%');

COMMIT;
