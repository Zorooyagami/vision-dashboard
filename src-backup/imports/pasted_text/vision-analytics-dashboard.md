Design a web-based analytics dashboard called "Vision" — a cross-platform 
(Web + App) analytics tool for e-commerce businesses, positioned as a smarter 
alternative to Google Analytics. Focus on unifying web and app user data into 
one view, Persona-based user segmentation, and a unique "Decision Tracking" 
feature that lets users log business decisions and see their before/after 
impact on metrics.

PERSONA SYSTEM (core concept — use throughout, not generic "segments")
The tool auto-classifies every user into one of 5 Personas based on login 
and order-history rules. Use these exact names, short descriptions, and 
criteria tags wherever personas are displayed (cards, filters, tables, 
legends). Each Persona should have a distinct color/icon used consistently 
across all screens:

1. Loyal Users (color: indigo) — icon: star/crown
   "Regular buyer familiar with the brand"
   Criteria: Logged in + Completed 2+ buy/sell orders

2. Collector (color: violet/purple) — icon: gem/tag
   "Passionate about specific categories — gaming, smartphones, luxury 
   handbags, watches, designer fashion"
   Criteria: Logged in + Purchased at least 1 retro/rare item

3. First Time Users (color: teal) — icon: sparkle/new-badge
   "New user exploring the website for the first time"
   Criteria: Logged in + This is their first-ever session

4. Active Users (color: amber) — icon: activity/pulse
   "A relatively new user still exploring the website"
   Criteria: Logged in + Completed a maximum of 2 orders

5. Guest Users (color: gray) — icon: incognito/user-outline
   "A user exploring the website without logging in"
   Criteria: Not logged in

Personas should feel like a proprietary framework — give them a dedicated 
"Persona" chip/badge component (colored pill with icon) reused everywhere 
a user or user-group is referenced.

STYLE
Clean, modern SaaS dashboard aesthetic. Dark sidebar navigation, light 
content area. Primary accent color: indigo/violet (#6366F1). Use card-based 
layouts with soft shadows, rounded corners (8-12px radius), generous 
whitespace, and clear data hierarchy. Typography: Inter or similar, bold 
large numbers for KPIs, muted gray labels. Charts use each Persona's 
assigned color consistently across every visualization for instant 
recognition.

GLOBAL LAYOUT
- Left sidebar navigation (collapsible) with sections: Home, Acquisition, 
  Engagement, Conversion, Revenue, Personas, Decisions, Alerts, Settings
- Top bar present on every screen with: date range picker, a Platform 
  Toggle (Web / App / Combined) as a segmented control, an active Persona 
  Filter dropdown (multi-select, showing colored persona chips), search 
  icon, and user avatar/profile menu

SCREENS TO DESIGN

1. HOME / OVERVIEW DASHBOARD
   - Top KPI row: 4 cards (Revenue, Total Users, Conversion Rate, Avg Order 
     Value), each with current value, % change vs previous period, mini 
     sparkline. Values should reflect the active Platform Toggle state.
   - Persona Distribution widget: a donut chart showing % breakdown of 
     current users across the 5 Personas, using their assigned colors, 
     with a legend listing counts
   - Large trend chart (Revenue or Users over time) with small vertical 
     marker icons on the timeline representing logged "Decisions" — hover 
     shows tooltip with decision name
   - "Top Insights" row: 3 auto-generated insight cards referencing 
     Personas by name (e.g., "Collectors spend 3.1x more per order than 
     Active Users this month," "Guest Users convert 40% less than Loyal 
     Users on App")
   - "Persona Leaderboard" widget: table of all 5 personas showing Revenue, 
     Conversion Rate, and Trend arrow, sortable, each row prefixed with 
     its colored persona chip

2. CROSS-PLATFORM FUNNEL (Conversion section)
   - Funnel steps: Product Viewed → Add to Cart → Checkout Started → 
     Purchase, each step split by Web vs App vs Combined with drop-off %
   - A Persona filter above the funnel lets the user isolate the funnel 
     for a single Persona (e.g., "show funnel for Guest Users only" to 
     spot where anonymous users drop off before ever logging in)
   - Toggle for "Cross-Device Journeys" — Sankey-style diagram of users 
     who started on App and converted on Web (and vice versa), with node 
     colors reflecting Persona where applicable

3. PERSONAS EXPLORER
   - Left panel: 5 fixed Persona cards (Loyal Users, Collector, First Time 
     Users, Active Users, Guest Users) — NOT user-created, but the system's 
     built-in classification. Each card shows: colored icon/chip, one-line 
     description, live user count, and a small trend sparkline
   - Clicking a Persona card opens a detail view: criteria definition 
     shown as a rule chip (e.g., "Logged in + 2+ orders completed"), key 
     metrics (Revenue, AOV, Retention, Sessions), and a breakdown by 
     Platform (Web/App split for that Persona)
   - Comparison mode: multi-select 2-3 Personas to view side-by-side 
     metric cards and overlaid trend lines (e.g., compare Collector vs 
     Loyal Users spending behavior)
   - Note: since Personas are rule-based (not custom filters), there is 
     no "Persona Builder" — instead show a small "Criteria" info panel 
     explaining how each Persona is auto-calculated, with a settings link 
     to adjust thresholds (e.g., change "2 orders" threshold for Active Users)

4. DECISION TRACKING (the key differentiator screen)
   - Chronological timeline/log of decisions, each card showing: decision 
     title, date, owner avatar, hypothesis text, affected metric, target 
     Persona(s) tag, and outcome tag (Success / Neutral / Failed) with 
     color coding (green/gray/red)
   - Clicking a decision expands to a before/after comparison chart of the 
     affected metric, filterable by which Persona was targeted (e.g., 
     "Free shipping for Loyal Users" decision shows impact isolated to 
     that Persona's conversion rate)
   - Prominent "+ Log New Decision" button opening a form modal: Decision 
     name, Date, Hypothesis, Metric to track, Target Persona(s) 
     multi-select, Owner

5. REVENUE BY PERSONA
   - Data table: Persona (with colored chip), Platform, Revenue, Orders, 
     AOV, % of Total, Trend sparkline — sortable columns, all 5 personas 
     always listed
   - Stacked bar chart above showing revenue contribution by Persona over 
     time, using consistent persona colors in the stack

6. ALERTS & INSIGHTS PANEL
   - Feed-style list of auto-detected anomalies with severity icons, 
     affected metric, the Persona involved (as a colored chip), and 
     timestamp (e.g., "⚠ Collector purchase rate dropped 18% this week")
   - Each alert card has "View Details" and "Dismiss" actions

INTERACTIONS TO SHOW
- Hover states on chart data points showing tooltips
- The Platform Toggle (Web/App/Combined) visibly changing KPI values 
  across at least 2 screens
- The Persona Filter dropdown shown open at least once, displaying all 
  5 colored persona chips as selectable options
- Empty/loading state for the Decisions log when no decisions are logged yet

Generate this as a connected multi-screen prototype with consistent 
navigation and persona color-coding, so I can click through 
Home → Personas Explorer → Decisions → Revenue by Persona.