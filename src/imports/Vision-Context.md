# Vision — Product Context

Cross-platform (Web + App) e-commerce analytics tool with Persona-based
segmentation and Decision Tracking, positioned as a smarter alternative
to Google Analytics.

---

## 1. Product Summary

**Problem:** Google Analytics and similar tools treat web and app as
separate properties, offer generic demographic segments, and give no way
to connect a business decision to its actual impact on metrics.

**Solution:** Vision unifies web + app user data into a single
view, classifies every user into one of 5 fixed **Personas**, and lets
teams log decisions and auto-track before/after impact.

---

## 2. Persona System

Every user is auto-classified into exactly one Persona based on login
state and order history. Personas are **rule-based**, not manually
created segments.

| # | Persona | Color | Icon | Description | Criteria |
|---|---------|-------|------|--------------|----------|
| 1 | **Loyal Users** | Indigo | Star / Crown | Regular buyer familiar with the brand | Logged in **+** completed 2+ buy/sell orders |
| 2 | **Collector** | Violet | Gem / Tag | Passionate about specific categories — gaming, smartphones, luxury handbags, watches, designer fashion | Logged in **+** purchased at least 1 retro/rare item |
| 3 | **First Time Users** | Teal | Sparkle / New badge | New user exploring the site for the first time | Logged in **+** this is their first-ever session |
| 4 | **Active Users** | Amber | Activity / Pulse | Relatively new user still exploring the site | Logged in **+** completed a maximum of 2 orders |
| 5 | **Guest Users** | Gray | Incognito / User outline | User exploring the site without logging in | Not logged in |

> **Open item — classification priority:** Loyal Users (2+ orders) and
> Collector (1+ rare item) are not mutually exclusive, and Active Users
> (max 2 orders) overlaps Loyal Users at exactly 2 orders. Before this
> becomes a live classification engine, define a priority order — e.g.
> `Collector > Loyal Users > Active Users > First Time Users > Guest Users`
> — so every user lands in exactly one bucket.

---

## 3. Core Differentiators

1. **True Web + App unity** — one user, one journey, stitched across
   platforms via a unified user ID, not a bolted-on "combined property."
2. **Persona-first design** — every metric, chart, and table is
   sliceable by Persona natively.
3. **Decision Layer** — log a business decision (e.g. "raised free
   shipping threshold"), pin it to a date and target Persona(s), and the
   tool auto-tracks before/after impact.
4. **Actionable, not just descriptive** — plain-language insight cards
   and anomaly alerts, not raw charts only.

---

## 4. Information Architecture

```
├── Home (Overview)
├── Acquisition
│   ├── Channels
│   ├── Campaigns
│   └── Platform Split
├── Engagement
│   ├── Sessions
│   ├── Retention
│   └── Feature Usage
├── Conversion
│   ├── Funnels
│   ├── Cart & Checkout
│   └── Cross-Platform Journeys
├── Revenue
│   ├── By Product
│   ├── By Persona
│   └── LTV / Cohorts
├── Personas
│   ├── Explorer (5 fixed personas)
│   ├── Detail View (criteria, metrics, platform split)
│   └── Comparison Mode
├── Decisions
│   ├── Log
│   ├── Impact Tracker
│   └── Timeline View
├── Alerts & Insights
└── Settings
    ├── Data Sources (Web SDK, App SDK, API)
    ├── Identity Resolution Rules
    ├── Persona Threshold Settings
    └── Team & Sharing
```

**Global controls** persist across every screen: date range picker,
Platform Toggle (Web / App / Combined), and Persona Filter (multi-select).

---

## 5. Screen-by-Screen Feature List

### Home / Overview
- KPI strip: Revenue, Users, Conversion Rate, AOV (reflects Platform Toggle)
- Trend chart with Decision markers overlaid on the timeline
- Persona Distribution donut chart (% breakdown, persona colors)
- Top 3 auto-generated insight cards referencing Personas by name
- Persona Leaderboard (Revenue, Conversion Rate, trend arrow per persona)

### Cross-Platform Funnel
- Funnel: Product Viewed → Add to Cart → Checkout Started → Purchase
- Web vs App vs Combined split per step, with drop-off %
- Persona filter to isolate funnel for a single persona
- Cross-Device Journeys view (Sankey diagram, e.g. App → Web conversions)

### Personas Explorer
- 5 fixed persona cards with live count + sparkline
- Detail view per persona: criteria rule chip, key metrics, platform split
- Comparison mode: 2–3 personas side-by-side
- Criteria info panel + link to adjust thresholds (e.g. order count cutoffs)

### Decisions
- Chronological log: title, date, owner, hypothesis, metric, target
  persona(s), outcome tag (Success / Neutral / Failed)
- Expandable before/after comparison chart, filterable by target persona
- "+ Log New Decision" modal: name, date, hypothesis, metric, personas, owner

### Revenue by Persona
- Sortable table: Persona, Platform, Revenue, Orders, AOV, % of Total, trend
- Stacked bar chart of revenue contribution by persona over time

### Alerts & Insights
- Anomaly feed: severity icon, metric, persona chip, timestamp
- "View Details" / "Dismiss" actions per alert

---

*Context document for Vision — cross-platform e-commerce analytics
tool concept. Pair with the Figma Make prompt to generate the prototype.*
