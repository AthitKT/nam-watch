import fs from 'fs';

async function generateMigration() {
  // Fetch BKK districts
  const res = await fetch('https://flood.bangkok.go.th/api/district/all', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const bkk = await res.json();
  
  // PTT list
  const pttAmphoes = [
    { name: 'เมืองปทุมธานี', name_en: 'Mueang Pathum Thani' },
    { name: 'คลองหลวง', name_en: 'Khlong Luang' },
    { name: 'ธัญบุรี', name_en: 'Thanyaburi' },
    { name: 'หนองเสือ', name_en: 'Nong Suea' },
    { name: 'ลาดหลุมแก้ว', name_en: 'Lat Lum Kaeo' },
    { name: 'ลำลูกกา', name_en: 'Lam Luk Ka' },
    { name: 'สามโคก', name_en: 'Sam Khok' }
  ];

  let sql = `
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
`;
  
  const bkkVals = bkk.map((d: { name: string, name_en: string }) => `('${d.name}', '${d.name}', '${d.name_en}', 'BKK', 'khet')`);
  const pttVals = pttAmphoes.map(d => `('${d.name}', '${d.name}', '${d.name_en}', 'PTT', 'amphoe')`);
  
  sql += [...bkkVals, ...pttVals].join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
  
  sql += `
-- 3. Reassign stations to normalized areas
-- E.g. 'เขต บางกะปิ' -> 'บางกะปิ', 'อำเภอคลองหลวง' -> 'คลองหลวง'
UPDATE stations SET area_id = TRIM(REPLACE(REPLACE(area_id, 'เขต', ''), 'อำเภอ', ''));
-- Handle any stray spaces if there were "เขต บางกะปิ"
UPDATE stations SET area_id = TRIM(area_id);

-- 4. Delete the orphaned dynamically created areas (those with prefixes or BKK Amphoes)
-- Delete areas that are not in the seeded 57 ids
DELETE FROM areas WHERE id NOT IN (
`;
  sql += [...bkk.map((d: { name: string }) => `'${d.name}'`), ...pttAmphoes.map(d => `'${d.name}'`)].join(',\n') + '\n);\n\n';

  sql += `
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
`;

  fs.writeFileSync('supabase/migrations/0002_fix_areas_and_dedup.sql', sql, 'utf8');
  console.log('Migration generated.');
}

generateMigration().catch(console.error);
