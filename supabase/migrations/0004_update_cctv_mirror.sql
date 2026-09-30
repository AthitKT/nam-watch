-- Update BMA radar/CCTV feeds to the reliable TMD (Thai Meteorological Department) mirror feed
UPDATE stations
SET cctv_url = 'https://weather.tmd.go.th/svp/svp120_latest.png'
WHERE cctv_url LIKE '%weather.bangkok.go.th%' 
   OR cctv_url IS NOT NULL;
