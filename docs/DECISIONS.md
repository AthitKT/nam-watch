# DECISIONS.md — Nam-Watch Architecture Decisions

> This document records significant technical decisions made during the Nam-Watch project.
> Format: ADR-style (date, context, decision, consequences).

---

## Phase 0 (Research)

### DEC-001: Primary data source = ThaiWater `api-v3.thaiwater.net` (no-auth public API)

**Date:** 2026-09-30  
**Context:** The project brief names ThaiWater/HII as primary source. Two API tiers exist:
1. `api-v3.thaiwater.net` — public, no authentication, v3 format
2. `api.thaiwater.net` (standard.thaiwater.net) — requires API key registration

**Decision:** Use `api-v3.thaiwater.net` as primary source.  
**Rationale:** Live testing confirmed the v3 API is accessible without auth, returns real-time data, and covers Bangkok + Pathum Thani with all necessary fields (`situation_level`, `diff_wl_bank_text`, `canal_value`, threshold levels for canals). No registration delay blocks development.  
**Consequences:** API is undocumented and unofficial (the official developer-facing API is standard.thaiwater.net). If HII changes the v3 API without notice, we must adapt. The adapter layer (`/lib/water-sources/thaiwater.ts`) isolates this dependency.

---

### DEC-002: Station type priority — Canal > River for Bangkok

**Date:** 2026-09-30  
**Context:** Bangkok coverage in ThaiWater:
- River/tele stations: 9 (low count, some have no thresholds)
- Canal stations: 272 (operated by BMA สำนักการระบายน้ำ กทม., 242 have warning/critical thresholds)

**Decision:** Use canal stations as the primary data type for Bangkok. River stations are also included but treated as secondary.  
**Rationale:** 272 canal stations with thresholds gives much richer coverage and better represents the flooding risk Bangkok residents actually experience (canal overflow, not just Chao Phraya river level).  
**Consequences:** The `Station.type` field will include `'canal'` as a primary type, not just river/watergate.

---

### DEC-003: Pathum Thani — tele_waterlevel + watergate only

**Date:** 2026-09-30  
**Context:** Pathum Thani has:
- tele_waterlevel stations: 4
- watergate stations: 13
- canal stations: 0 (not in ThaiWater canal endpoint)

**Decision:** Use both tele_waterlevel and watergate stations for Pathum Thani. Show watergate in/out levels where available.  
**Rationale:** This is the complete coverage available. We must NOT invent coverage.  
**Consequences:** Pathum Thani will have fewer stations than Bangkok. The UI must handle sparse data gracefully. Water gate stations show `watergate_in`/`watergate_out` rather than a single water level — normalization layer must handle this.

---

### DEC-004: District grouping via `geocode.amphoe_name` (API field, not geometry)

**Date:** 2026-09-30  
**Context:** The brief mentions point-in-polygon with official district boundaries. However, the ThaiWater API already provides `geocode.amphoe_name` (district name) and `geocode.province_code` for every station.  
**Decision:** Use `geocode.amphoe_name` and `geocode.province_code` from the API to group stations into areas. Skip point-in-polygon for now.  
**Rationale:** Simpler, no need for GeoJSON boundary files, and the API data already has the assignment. This avoids a complex dependency.  
**Consequences:** Areas are defined by the API's district assignment, not official geometry. If a station's assignment is wrong in the API, it will be wrong in our app too. We can add geometry later if needed.  
**Owner must confirm this approach.**

---

### DEC-005: `situation_level` mapping to our 3-tier status

**Date:** 2026-09-30  
**Context:** ThaiWater's `situation_level` has 5 values (1–5). Our status model has 3: normal / watch / critical.  
**Proposed mapping:**

| ThaiWater `situation_level` | Thai label | Our status |
|---|---|---|
| 1 | ปกติ | `normal` |
| 2 | เฝ้าระวัง | `watch` |
| 3 | เตือนภัย | `watch` |
| 4 | วิกฤต | `critical` |
| 5 | ล้นตลิ่ง (over-bank) | `critical` |
| null | ไม่มีข้อมูล | trend-only (show `"ไม่มีเกณฑ์อ้างอิง"`) |

**Decision:** **APPROVED by owner 2026-09-30.** Levels 2 and 3 are both mapped to `watch` because they represent different severity within the same actionable tier.  
Documented in `DATA_SOURCES.md` as "Nam-Watch's own interpretation". Implemented in `/lib/status.ts`.

---

### DEC-006: GitHub Actions ingestion every **30 minutes** (not 15)

**Date:** 2026-09-30 (revised from initial 15-min proposal)  
**Context:** GitHub bills per-job minutes rounded up. 15-min schedule = ~2,880 runs/month. With overhead, this risks exceeding the 2,000 free-tier minutes.  
**Decision:** Use `*/30 * * * *` cron. This stays well within the free tier (1,440 runs/month).  
**Rationale:** ThaiWater updates every ~15 min but our app doesn't need sub-30-min freshness. The 60-min staleness warning gives a comfortable buffer.  
**Consequences:** Data in Supabase is at most 30 min behind the source. Combined with the staleness policy (warn at 60 min), users will always see fresh data under normal conditions.

---

### DEC-007: Store readings with 30-day retention + prune on ingest

**Date:** 2026-09-30  
**Context:** Brief requires pruning readings older than 30 days.  
**Decision:** The ingest script runs `DELETE FROM readings WHERE ts < NOW() - INTERVAL '30 days'` after each successful ingest cycle.  
**Rationale:** Keeps Supabase free tier storage manageable while providing 30 days of chart history.

---

### DEC-008: Do NOT use RID telerid for live readings (auth required)

**Date:** 2026-09-30  
**Context:** RID's telerid.rid.go.th requires Bearer token for `GET main/station/{id}/` (live readings). The station list is public but useless without readings.  
**Decision:** RID telerid is excluded from Phase 1–2. Bangkok/PTT stations that appear in RID are also exposed in ThaiWater's aggregated API.  
**Rationale:** Avoid auth complexity. ThaiWater already aggregates RID station data.

---

### DEC-009: BMA flood.bangkok.go.th — use for district metadata only

**Date:** 2026-09-30  
**Context:** `flood.bangkok.go.th/api/district/all` is public and returns all 50 Bangkok districts with English names, zone_id, and coordinates. However, the BMA canal water level data already appears in ThaiWater's `canal_waterlevel` endpoint.  
**Decision:** Use `flood.bangkok.go.th` only for district reference data (seed table). Do not use it for live water level readings (those come from ThaiWater).  
**Rationale:** Avoid duplicating the same data from two sources.
