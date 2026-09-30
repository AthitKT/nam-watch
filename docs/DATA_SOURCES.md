# DATA_SOURCES.md — Nam-Watch Phase 0 Research

> Last updated: 2026-09-30  
> Status legend: **[VERIFIED]** = live API call confirmed working | **[UNVERIFIED]** = inferred from docs/search results

---

## Primary Source: ThaiWater / คลังข้อมูลน้ำแห่งชาติ (HII / สสน.)

### Overview
- **Operator:** Hydro and Agro Informatics Institute (สถาบันสารสนเทศทรัพยากรน้ำ — สสน.)
- **Portal:** https://www.thaiwater.net
- **Standard docs:** https://standard.thaiwater.net
- **API base (v3, no auth):** `https://api-v3.thaiwater.net/api/v1/thaiwater30/`
- **Attribution string:** `"คลังข้อมูลน้ำแห่งชาติ (สสน.)"`
- **License:** No explicit open-data license published; public-interest non-commercial use assumed. All fetching must be server-side; never expose to browser.

---

### 3a. Endpoint: Water Level Stations (River/Tele) — [VERIFIED]

```
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load?province_code=10
```

**Authentication:** None (public)  
**Format:** JSON  
**Update frequency:** ~15 minutes (data shows timestamps current to the minute)

**Response structure (trimmed sample):**
```json
{
  "waterlevel_data": {
    "data": [
      {
        "id": 1315757355,
        "waterlevel_datetime": "2026-09-30 16:10",
        "waterlevel_m": null,
        "waterlevel_msl": "2.15",
        "waterlevel_msl_previous": "2.16",
        "storage_percent": "106.17",
        "situation_level": 5,
        "station_type": "tele_waterlevel",
        "diff_wl_bank": "0.18",
        "diff_wl_bank_text": "ล้นตลิ่ง (ม.)",
        "agency": {
          "id": 9,
          "agency_name": { "th": "สถาบันสารสนเทศทรัพยากรน้ำ (องค์การมหาชน)", "en": "HII" },
          "agency_shortname": { "th": "สสน.", "en": "HII" }
        },
        "basin": { "basin_code": 15, "basin_name": { "th": "ลุ่มน้ำบางปะกง", "en": "Bang Pakong Basin" } },
        "station": {
          "id": 8,
          "tele_station_name": { "th": "คลองลาดพร้าว ปากคลอง2ใต้", "en": "Klong Ladprao Klong 2 Sai Tai" },
          "tele_station_lat": 13.93183,
          "tele_station_long": 100.63952,
          "tele_station_oldcode": "BKK020",
          "left_bank": 1.97,
          "right_bank": 1.97,
          "min_bank": 1.97,
          "ground_level": -1.01,
          "is_key_station": false,
          "warning_level_m": null,
          "critical_level_m": null,
          "critical_level_msl": null
        },
        "geocode": {
          "area_code": "1",
          "area_name": { "th": "กรุงเทพมหานคร", "en": "Bangkok" },
          "amphoe_code": "38",
          "amphoe_name": { "th": "ลาดพร้าว", "en": "Lat Phrao District" },
          "province_code": "10",
          "province_name": { "th": "กรุงเทพมหานคร", "en": "Bangkok" }
        }
      }
    ]
  }
}
```

**Key fields:**

| Field | Type | Notes |
|---|---|---|
| `situation_level` | int | **1**=ปกติ, **2**=เฝ้าระวัง, **3**=เตือนภัย, **4**=วิกฤต, **5**=ล้นตลิ่ง |
| `waterlevel_m` | float\|null | Water level above gauge zero (m); **null for some stations** |
| `waterlevel_msl` | string(float) | Water level above mean sea level (m MSL); **more reliable** |
| `waterlevel_msl_previous` | string(float) | Previous reading — use for trend calculation |
| `diff_wl_bank` | string(float) | Magnitude of difference from bank level (always positive) |
| `diff_wl_bank_text` | string | `"ล้นตลิ่ง (ม.)"` or `"ต่ำกว่าตลิ่ง (ม.)"` |
| `station.left_bank` / `right_bank` / `min_bank` | float | Bank elevation (m MSL) |
| `station.warning_level_m` | float\|null | Warning threshold (often null — use trend-only mode) |
| `station.critical_level_m` | float\|null | Critical threshold (often null) |
| `station_type` | string | `"tele_waterlevel"` |

**Bangkok/Pathum Thani coverage (live count, 2026-09-30):**
- Bangkok (`province_code=10`): **9 stations** (tele_waterlevel type)
- Pathum Thani (`province_code=13`): **4 stations** (tele_waterlevel type)

> ⚠️ **Warning level & critical level are frequently null** for Bangkok/PTT stations in this endpoint.  
> `situation_level` is computed by the upstream system and is reliable.  
> `diff_wl_bank_text` must be used (not the sign of `diff_wl_bank`) to determine over-bank status.

#### `situation_level` Interpretation (VERIFIED source values; our 3-tier mapping is our own interpretation)

ThaiWater's official labels from the source system:

| `situation_level` | Thai label | Our app status | Notes |
|---|---|---|---|
| `1` | ปกติ | `normal` | Below watch threshold |
| `2` | เฝ้าระวัง | `watch` | Watch level; monitor closely |
| `3` | เตือนภัย | `watch` | Alert level; still mapped to watch |
| `4` | วิกฤต | `critical` | Critical; approaching bank |
| `5` | ล้นตลิ่ง | `critical` | Over-bank — confirmed by `diff_wl_bank_text` |
| `null` | — | trend-only | No threshold; show `"ไม่มีเกณฑ์อ้างอิง"` + trend arrow |

> This 3-tier mapping (normal / watch / critical) is **Nam-Watch's own interpretation**.  
> The original 5-tier system is preserved in the DB `situation_level` column.  
> Mapping is implemented in `/lib/status.ts` with full unit tests.

#### Data Staleness Policy (owner-confirmed)

| Age of latest reading | UI behaviour |
|---|---|
| < 60 min | Normal display |
| 60 min – 24 h | Show warning: "ข้อมูลอาจล้าสมัย" (data may be outdated) |
| ≥ 24 h | Show "ไม่มีข้อมูล" — station considered inactive |

---

### 3b. Endpoint: Canal Water Level — [VERIFIED]

```
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/canal_waterlevel
```

**Authentication:** None (public)  
**Format:** JSON  
**Update frequency:** Variable (some stations updated every 15 min, some stale)

**Response structure (trimmed):**
```json
{
  "result": "OK",
  "data": [
    {
      "canal_datetime": "2026-09-28 13:20",
      "canal_value": 0.95,
      "canal_out": 0,
      "agency": { "agency_name": { "th": "สำนักการระบายน้ำ กรุงเทพมหานคร", "en": "Department of Bangkok" } },
      "geocode": { "province_code": "10", "amphoe_name": { "th": "สะพานสูง", "en": "Saphan Sung District" } },
      "station": {
        "id": 218,
        "canal_name": { "th": "ค.ลาดกระบังน้ำ ม.ต" },
        "canal_lat": 13.76991,
        "canal_long": 100.71494,
        "canal_oldcode": "WL.LBK.02",
        "bank": 1.0,
        "warning_level": 0.3,
        "critical_level": 0.4
      }
    }
  ]
}
```

**Key fields:**

| Field | Type | Notes |
|---|---|---|
| `canal_value` | float | Current water level (m); reference datum is gauge-relative |
| `canal_out` | float | Outflow reading |
| `station.bank` | float\|null | Bank level threshold |
| `station.warning_level` | float\|null | Warning threshold (many stations have values here!) |
| `station.critical_level` | float\|null | Critical threshold |
| `station.canal_oldcode` | string | Old station code (e.g., `WL.LBK.02`) |

**Bangkok/Pathum Thani coverage:**
- Bangkok (`province_code=10`): **272 canal stations** (large volume from BMA/สำนักการระบายน้ำ)
- Pathum Thani (`province_code=13`): **0 canal stations** in this endpoint
- **242 of the 272 Bangkok stations** have `warning_level` set ✅

> **Key insight:** The `canal_waterlevel` endpoint is vastly richer for Bangkok than `waterlevel_load`.  
> It's operated by BMA (สำนักการระบายน้ำ กทม.) and has thresholds populated.

---

### 3c. Endpoint: Water Gate (ประตูน้ำ / Floodgate) — [VERIFIED]

```
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/watergate_load
```

**Authentication:** None (public)  
**Format:** JSON

**Response structure (trimmed):**
```json
{
  "watergate_data": {
    "data": [
      {
        "watergate_datetime_in": "2023-07-17 08:49",
        "watergate_in": null,
        "watergate_out": null,
        "pump_on": null,
        "floodgate_open": null,
        "floodgate_height": null,
        "station": {
          "tele_station_name": { "th": "คลองสำปะทาว ลาดกระบัง", "en": "Krung Thep 9" },
          "tele_station_lat": 13.7407,
          "tele_station_long": 100.79468,
          "tele_station_oldcode": "BKK009"
        },
        "geocode": { "province_code": "10", "amphoe_name": { "th": "ลาดกระบัง", "en": "Lat Krabang District" } }
      }
    ]
  }
}
```

> **Note (Verified 2026-09-30):** The `station` object for watergates uses `tele_station_name`, `tele_station_lat`, and `tele_station_long` instead of `watergate_` prefixes.

**Bangkok/Pathum Thani coverage:**
- Bangkok (`province_code=10`): **84 watergate stations**
- Pathum Thani (`province_code=13`): **13 watergate stations**

> ⚠️ Many watergate readings are null (stale data). `watergate_in`/`watergate_out` reflect gate levels in meters.

---

### 3d. Endpoint: Historical Graph — [VERIFIED (canal type)]

```
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_graph
    ?station_type=canal
    &station_id={id}
    &start_date=YYYY-MM-DD
    &end_date=YYYY-MM-DD
```

Also: `station_type=tele_waterlevel` and `station_type=watergate`

**Response (trimmed):**
```json
{
  "result": "OK",
  "data": {
    "graph_data": [
      { "datetime": "2026-09-25 00:00", "value": 0.12, "value_out": 0, "discharge": null },
      { "datetime": "2026-09-25 00:15", "value": 0.12, "value_out": 0, "discharge": null }
    ]
  }
}
```

**Data frequency:** ~15-minute intervals  
**5-day query:** ~547 data points for a single station  
**Note:** `tele_waterlevel` graph can return 500 DB errors under load; `canal` graph worked reliably.

---

### 3e. Endpoint: Province-filtered Chao Phraya Region — [UNVERIFIED exact behavior, but documented]

```
GET https://api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel?province_code=10,11,12,13,73,74
```

This returns river water level stations for the Chao Phraya basin region including Bangkok (10) and Pathum Thani (13). May duplicate stations from `waterlevel_load`.

---

## Secondary Source: BMA Flood Monitoring — flood.bangkok.go.th

### Overview
- **Operator:** สำนักการระบายน้ำ กรุงเทพมหานคร (BMA Department of Drainage and Sewerage)
- **Portal:** https://flood.bangkok.go.th
- **API base:** `https://flood.bangkok.go.th/api/`
- **Attribution string:** `"สำนักการระบายน้ำ กรุงเทพมหานคร"`
- **Authentication:** None required for listed endpoints
- **Coverage:** Bangkok only (not Pathum Thani)

> **Note:** The canal water level data from BMA also appears in ThaiWater's `canal_waterlevel` endpoint (same stations, `agency_name = "สำนักการระบายน้ำ กรุงเทพมหานคร"`). The flood.bangkok.go.th API provides additional district-level metadata.

### Endpoint: District list — [VERIFIED]

```
GET https://flood.bangkok.go.th/api/district/all
```

Returns 50 Bangkok districts with id, Thai/English names, zone_id, area (km²), lat/lon.

**Sample:**
```json
{ "id": 1033, "name": "คลองเตย", "name_en": "Khlong Toei", "zone_id": 9992, "area": 13.396, "latitude": 13.71618, "longitude": 100.5722 }
```

### Endpoint: Alert thresholds — [UNVERIFIED, documented in gain9999/thaiwater skill]

```
GET https://flood.bangkok.go.th/api/water/threshold
```
Returns: `[{"value":"ปกติ","value_en":"Normal","color":"#0BC100"}, {"value":"เตือนภัย","value_en":"Warning","color":"#FFAA00"}, {"value":"วิกฤต","value_en":"Critical","color":"#FF0000"}]`

---

## Secondary Source: RID Telemetry — telerid.rid.go.th

### Overview
- **Operator:** กรมชลประทาน (Royal Irrigation Department)
- **Portal:** https://wmsc.rid.go.th / https://telerid.rid.go.th
- **API base:** `https://telerid.rid.go.th/restapi/`
- **Authentication:** Station list = public (no auth); live readings = auth required

### Endpoint: Station list — [UNVERIFIED live, documented in gain9999/thaiwater skill]

```
GET https://telerid.rid.go.th/restapi/main/station_list/
```

Returns 921 telemetry stations with: `id`, `code`, `name` (Thai), `basin_name`, `province_name`, `amphur_name`, `geom` (GeoJSON Point).

**Bangkok/PTT coverage:** YES (filter by `province_name`)  
**Auth for live readings:** Yes — `GET main/station/{id}/` requires Bearer token

> ⚠️ **Decision:** RID live readings require auth. We will NOT use telerid as primary source.  
> The stations that overlap Bangkok/PTT already appear in ThaiWater's `waterlevel_load`.

---

## NOT Used (rationale)

| Source | Reason |
|---|---|
| RID large dam API (`app.rid.go.th/reservoir/api/dam/public`) | Dams are upstream; no direct Bangkok/PTT gauge coverage |
| standard.thaiwater.net interchange API | Requires API key registration; the public `api-v3.thaiwater.net` API provides same data without auth |
| data.go.th | No stable Bangkok water level resource_id found; data links back to ThaiWater anyway |
| weather.bangkok.go.th | No public JSON API; JS-rendered dashboard only |
| RainViewer | Explicitly excluded by project owner |

---

## Recommended Station Shortlist (Phase 0 — Candidates)

### Bangkok River Stations (tele_waterlevel, 9 stations)

| Station (English) | Code | District | Bank Level (m MSL) | situation_level (as of 2026-09-30) |
|---|---|---|---|---|
| Klong Ladprao Klong 2 Sai Tai | BKK020 | Lat Phrao | 1.97 | 5 (ล้นตลิ่ง) |
| Klong Ladprao Wat Chang | BKK021 | (TBD) | 2.20 | 5 |
| Klong Saensab Bang-Nakorn | BKK022 | (TBD) | 2.069 | 5 |
| Klong Samrong Lat Krabang | BKK023 | (TBD) | 0.623 | 5 |
| Khlong Phra Tahan Soen | — | (TBD) | 2.264 | 4 |
| Khlong Phanomyong | — | (TBD) | 2.201 | 4 |
| Klong Ladprao (อปภ.คลอง 2) | — | (TBD) | 2.563 | 4 |
| Chao Phraya River at Pak Kret | — | (TBD) | 2.39 | 3 |
| Klong Chin Phaet 69 | — | (TBD) | 1.637 | 1 |

### Bangkok Canal Stations (272 stations from BMA)
- Huge set — need amphoe-based grouping for UI
- 242 stations have `warning_level` populated ✅
- See `/public/canal_waterlevel` for full list

### Pathum Thani Stations (tele_waterlevel + watergate, 17 stations total)

| Type | Count |
|---|---|
| tele_waterlevel | 4 |
| watergate | 13 |

> ⚠️ Pathum Thani has **no canal stations** in ThaiWater's system as of 2026-09-30.  
> The 4 tele_waterlevel + 13 watergate stations are the full PTT coverage.

---

## Open Questions for Owner

1. **Situation levels:** ThaiWater's `situation_level` values are 1–5 but the brief mentions 3 states (normal/watch/critical). Proposed mapping: 1=normal, 2-3=watch, 4-5=critical. **Confirm?**

2. **Canal vs river UI:** Bangkok has 272 canal stations + 9 river stations. Should the UI show all 281 or only a curated subset (e.g., only stations with thresholds set)?

3. **Pathum Thani coverage:** Only 4 river + 13 watergate stations (no canals). The watergate stations show `watergate_in`/`watergate_out` levels, not a simple water level. **Is this acceptable?**

4. **Stale data:** The watergate endpoint showed some Bangkok stations with data from 2023. **Should we apply a staleness filter (e.g., >24h = mark as no-data)?**

5. **Station-to-district mapping:** `geocode.amphoe_name` is available in the API response. We can use it directly to group stations by district. **Can we use this instead of point-in-polygon (which would require geometry data)?**

6. **Upstream ThaiWater API rate limits:** No documented rate limit found. We'll poll every 15 minutes from GitHub Actions. Is this acceptable?

---

## Verification Status Summary

| Item | Status |
|---|---|
| ThaiWater `api-v3` base URL | **VERIFIED (live)** |
| `waterlevel_load` endpoint | **VERIFIED (live)** — 806 stations nationwide |
| `canal_waterlevel` endpoint | **VERIFIED (live)** — 282 canal stations |
| `watergate_load` endpoint | **VERIFIED (live)** — watergate stations |
| `waterlevel_graph` (canal type) | **VERIFIED (live)** — 15-min intervals, 5d history OK |
| Bangkok stations count (river) | **VERIFIED** — 9 stations |
| Pathum Thani stations (river) | **VERIFIED** — 4 stations |
| Bangkok canal stations | **VERIFIED** — 272 stations, 242 with thresholds |
| Pathum Thani watergate count | **VERIFIED** — 13 stations |
| No auth required for above | **VERIFIED** |
| `situation_level` field (1-5) | **VERIFIED** |
| `diff_wl_bank_text` for over-bank | **VERIFIED** |
| BMA flood.bangkok.go.th district API | **VERIFIED** — 50 districts returned |
| ThaiWater standard API (api.thaiwater.net) | **UNVERIFIED** — requires API key |
| RID telerid station list | **UNVERIFIED** (documented, not live-tested) |
| `waterlevel_graph` (tele type) | **UNVERIFIED** — returned 500 DB error in test |
