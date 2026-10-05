Add a new top-level section to the Vision prototype called "Explore" 
(or "Analysis" — use whichever fits the existing sidebar naming best) 
that houses event management, funnel building, ad-hoc querying, and 
customer journey mapping. This is a new menu item in the left sidebar, 
positioned between "Conversion" and "Revenue." Match the existing sidebar 
style, spacing, and icon conventions exactly.

The Explore section has its own sub-navigation (tabs or a secondary 
left rail) with 4 pages: Events, Funnels, Query Builder, Journeys. 
Keep the same top bar (Platform Toggle, Persona Filter, date range) 
visible and functional across all 4 pages.

1. EVENTS PAGE
   Purpose: manage and define the events being tracked (the tracking plan).
   - A table listing all tracked events: Event name, Platform (Web/App/
     Both), Category, Volume (count this period), Last seen timestamp, 
     Status (Active/Inactive)
   - Pre-populate the table with the following sample events, grouped 
     by category exactly as listed (use these as realistic seed data 
     so the page doesn't look empty):

     Category: Browsing & Interaction
     - view_item_list — User views a collection, category page, or list 
       of products
     - select_item — User clicks on a specific product from an item list
     - view_item — User views a detailed product description page
     - add_to_wishlist — User saves an item to their favorites list

     Category: Shopping Cart
     - add_to_cart — User adds a product to their shopping cart
     - remove_from_cart — User removes a specific product from their cart
     - view_cart — User navigates to and opens their shopping cart page

     Category: Checkout & Purchase
     - begin_checkout — User clicks to initiate the checkout flow
     - add_shipping_info — User submits their shipping address or 
       selects a delivery tier
     - add_payment_info — User enters credit card, PayPal, or other 
       billing information
     - purchase — User completes the transaction; triggers the final 
       confirmation page
     - refund — A full or partial monetary refund is processed for an 
       order

     Give each category a small colored label/tag in the table (e.g. 
     Browsing & Interaction = teal, Shopping Cart = amber, Checkout & 
     Purchase = indigo) so the list is scannable at a glance. Assign 
     each event a realistic Platform (Both, unless it's a mobile-only 
     or web-only action), a plausible Volume figure, and a recent Last 
     seen timestamp.
   - Search bar and category filter (using the 3 categories above) 
     above the table
   - "+ Add event" button opening a modal/form: Event name, Description, 
     Platform(s) checkbox, Category dropdown (pre-filled with the 3 
     categories, allow adding new ones), and a Properties section where 
     the user can add key-value property fields expected on that event 
     (e.g. purchase → "order_id," "value," "currency"; add_to_cart → 
     "product_id," "price," "quantity")
   - Clicking an event row opens a detail panel showing a mini trend 
     chart of that event's volume over time, and a breakdown by Persona
   - Each row has a "..." menu with Edit and Deactivate options

2. FUNNELS PAGE
   Purpose: let the user build custom funnels beyond the fixed 
   Product→Cart→Checkout→Purchase funnel already on the Conversion page, 
   using the event list above as building blocks.
   - A list of saved custom funnels as cards (name, number of steps, 
     overall conversion %, last edited). Seed with 1-2 example saved 
     funnels built from the events above, e.g. "Wishlist to purchase" 
     (view_item → add_to_wishlist → add_to_cart → purchase) and 
     "Checkout drop-off" (begin_checkout → add_shipping_info → 
     add_payment_info → purchase)
   - "+ Create funnel" button opening a funnel builder:
     - Add steps by selecting from the Events list above (drag to reorder)
     - Each step shows a live-updating count and drop-off % as steps 
       are added
     - Optional filters per step (e.g. "Platform = App," "Persona = 
       Collector")
     - Time window setting (e.g. "steps must complete within 7 days")
     - Save button with a name field
   - Clicking a saved funnel opens its results view: funnel visualization 
     (matching the visual style of the existing Conversion funnel), 
     segment breakdown toggle, and a "Duplicate" / "Edit" / "Delete" menu

3. QUERY BUILDER PAGE
   Purpose: ad-hoc analysis without needing a saved funnel or report, 
   built on the same event list.
   - A visual query builder (not raw SQL): "Show me [Event] where 
     [conditions] grouped by [Persona/Platform/Property] over [time 
     range]" — the Event dropdown should pull from the events list above 
     (e.g. "Show me purchase where Platform = App grouped by Persona 
     over Last 30 days")
   - Condition rows with AND/OR logic, built on event properties (e.g. 
     purchase's "value" or "currency" properties) with the same 
     structure as the existing Persona filter builder
   - A results panel below that updates live: toggle between table view 
     and chart view (line/bar) as results render
   - "Save as report" button to pin the query to a personal dashboard, 
     and an "Export CSV" action
   - A left panel showing recently run and saved queries for quick re-access

4. JOURNEYS PAGE
   Purpose: visualize the paths users take across web and app, using 
   the events above as journey nodes.
   - A journey map visualization: select a starting event (e.g. 
     view_item_list or "Session start") and see the top next-steps 
     users take, branching outward (Sankey/flow-diagram style, 
     consistent with the existing Cross-Device Journeys visualization 
     on the Conversion page). Example flow to seed: view_item_list → 
     view_item → add_to_cart → begin_checkout → purchase, with a 
     visible branch showing users who add_to_wishlist instead of 
     add_to_cart
   - Toggle to view journeys "backward" from a specific event (e.g. 
     "what did users do before purchase?" — surfacing add_payment_info, 
     add_shipping_info, begin_checkout as the preceding steps)
   - Persona filter to see how journeys differ by persona (e.g. Guest 
     Users dropping off after view_item vs Loyal Users reaching purchase 
     directly)
   - Hovering a path segment shows the % of users who took that step and 
     drop-off at each branch
   - "Save journey view" button to pin it, similar to Funnels

GENERAL
- Reuse the existing card template, color system, persona color rules, 
  and button styles already established — no new visual language
- All "+ Add," "Create," "Save," and "Duplicate" actions should be 
  clickable and functional within the prototype (open modals/forms, 
  update lists)
- Add breadcrumb or tab navigation so the user can move between Events, 
  Funnels, Query Builder, and Journeys without returning to the sidebar
- Ensure this new section links correctly from the sidebar and doesn't 
  break any existing navigation flows

List everything you added — the new sidebar item, all 4 sub-pages, and 
their key interactions — so I can review the full Explore section.