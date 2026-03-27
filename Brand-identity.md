# WHIFF THEORY — Storefront Design Document

> **Source:** Built from [brand-analysis.md](brand-analysis.md) (research) and [brand-strategy.md](brand-strategy.md) (strategy decisions)
>
> **Purpose:** Complete design specification for overhauling the existing Whiff Theory e-commerce storefront — pages, components, features, taglines, design direction, and brand identity system.
>
> **Current state:** The site already exists — built on the **Medusa.js + Next.js starter template**, storefront hosted on **Vercel**, admin/backend on **Railway**. It is currently a designless, bland, default-template site with no brand identity. This document is the overhaul blueprint to transform it into the art-first storefront the brand demands.
>
> **Operating constraint:** All products are clone-oil fragrances marketed as originals. The storefront IS the brand. Every pixel must justify the positioning: *art-first fragrance house with a journey architecture.*

---

## 1. BRAND IDENTITY SYSTEM

### 1A. Tagline System

| Level | Tagline | Usage |
|---|---|---|
| **Primary** | *"Your first real scent.
The end of ordinary."* | Website hero, about page, YouTube intros, WhatsApp header, any single-sentence context |
| **Secondary A** | *"Art you wear. Scent that turns heads."* | Instagram bio, packaging tagline, label backs, short-format contexts, favicon hover text |
| **Secondary B** | *"Your Fragrance journey starts here."* | Product photography captions, display shots, lifestyle content headers, collection banners |
| **Brand Promise** | *"Every fragrance is an experience worth showing off — and there's always a next one waiting."* | About page, brand story section, email footer |
| **Pricing** | *"The price is what it costs. What it costs includes is the art."* | Internal only — guides pricing display decisions |

### 1B. Color Palette

Derived from Vizag's coastal identity — Bay of Bengal meets industrial grit. Not Arabian gold. Not Parisian blush. Not white-label sterile.

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Primary Dark** | Deep Navy / Midnight | `#0A0E1A` | Backgrounds, hero sections, product page base, nav bar |
| **Primary Accent** | Teal / Bay of Bengal | `#00B4A6` | CTAs, active states, journey progression indicators, links |
| **Secondary Accent** | Coral / Sunset | `#FF6B5A` | Highlight badges ("New"), hover states, notification dots |
| **Warm Accent** | Sunset Gold | `#F5A623` | Stars/ratings, premium collection indicators, subtle highlights |
| **Neutral Light** | Off-White / Salt | `#F5F2ED` | Body text backgrounds, card surfaces, product detail areas |
| **Neutral Mid** | Warm Grey | `#8A8680` | Secondary text, borders, subtle dividers |
| **Text Primary** | Almost Black | `#1A1A1A` | Body text on light backgrounds |
| **Text on Dark** | Warm White | `#F0EDE8` | Text on dark backgrounds, hero copy |

#### Palette Rules
- **Dark mode is the default.** Product pages, hero sections, and collection pages use `#0A0E1A` backgrounds. The dark canvas makes label art pop and positions the brand in the "gallery" space, not the "marketplace" space.
- **Light surfaces for reading.** Product descriptions, about page body text, FAQ — anywhere there's a wall of text, use `#F5F2ED` background.
- **Never use pure black (`#000`) or pure white (`#FFF`).** Always warm. The palette has coastal warmth — not cold tech.
- **Teal is the journey color.** Use it for progression indicators, "next step" links, collection navigation breadcrumbs.

### 1C. Typography

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Display / Headings** | **Space Grotesk** | Bold (700), SemiBold (600) | Hero headlines, collection names, product names, section titles |
| **Body** | **Inter** | Regular (400), Medium (500) | Product descriptions, about page, all paragraph text |
| **Accent / Taglines** | **Space Grotesk** | Medium (500), Italic | Taglines, pull quotes, testimonials, "story behind" narrative |
| **Micro / Labels** | **Inter** | Medium (500), All Caps | Note tags, badges ("CROWD PLEASER"), price labels, nav items |

#### Typography Rules
- **Headlines are short.** Max 6–8 words. The Independent Artist doesn't ramble.
- **Body text is 16px minimum** on desktop, 15px on mobile. Readability is "Respect the beginner."
- **Letter-spacing on ALL CAPS micro text:** +0.05em–0.08em. Keeps labels clean.
- **No script/cursive fonts.** Not a luxury brand. Not a wedding invite. This is graphic art.

### 1D. Imagery & Visual Direction

| Element | Direction | What to Avoid |
|---|---|---|
| **Product photography** | Dark backgrounds, dramatic lighting, bottle as art object. Shallow depth of field on label details. Think gallery exhibition, not Amazon listing. | Flat white-background product shots. Generic "bottle floating in space." |
| **Label art** | Bold graphic illustrations — streetwear × fine art. Each fragrance has a unique character/scene. High contrast, saturated color, visible on a shelf or in a scroll. | Plain text labels, white labels, generic floral/abstract patterns, Arabian filigree. |
| **Lifestyle** | The bottle in context: on a bookshelf next to novels, on a desk next to a laptop, in a bag next to keys. The product is a *design object that lives in real life.* | Model shoots with perfume held to neck. "Spraying into the air" stock photography. |
| **Flat-lays** | Curated compositions: bottle + art prints + coffee + headphones. The brand's world, not just the product. | Cluttered, random objects. Overly styled "influencer" flat-lays. |
| **Backgrounds & Textures** | Concrete, raw plywood, slate, dark linen, weathered metal. Textural, gritty, tactile — "Built, not polished." | Marble, rose gold, soft pink velvet — that's luxury fragrance territory, not yours. |

### 1E. Logo & Mark

| Element | Direction |
|---|---|
| **Wordmark** | "WHIFF THEORY" in Space Grotesk Bold, letterspaced. Clean, geometric, no flourishes. Should work at 20px and 200px. |
| **Mark / Icon** | A reduced graphic element from the wordmark or a standalone symbol (e.g., abstracted "W" with a scent wave, or a nose silhouette meets brushstroke). Must work as a favicon, app icon, and label stamp. |
| **Lockup** | Wordmark stacked or horizontal + mark. Primary lockup on dark, secondary on light. |
| **Clear space** | Minimum clear space = height of the "W" on all sides. |
| **Monochrome versions** | Must work in solid white on dark, solid dark on light, and single-color for stamps/embossing on packaging. |

---

## 2. PAGES

### 2A. Page Architecture

```
HOME
├── COLLECTIONS (journey navigation)
│   ├── Crowd Pleasers
│   ├── Intro to Niche
│   ├── Strong / Oud (Coming Soon)
│   └── Polarising Art (Coming Soon)
├── PRODUCT PAGE (per product)
├── MY SCENT JOURNEY (logged-in user)
├── ABOUT
├── CONTACT / FAQ
├── CART → CHECKOUT
└── (Future) JOURNAL / BLOG
```

---

### Page 1: HOME

**Purpose:** First impression. Art-first hook. Establish the brand as "nothing else in Indian fragrance looks like this." Show the journey. Get the first click.

#### Sections (top to bottom)

| # | Section | Content | Design Notes |
|---|---|---|---|
| **1** | **Hero** | Full-bleed dark background. Primary tagline: *"From your first real scent to the one that stops a room."* One CTA: "Start Your Journey" (scrolls to collections or links to Crowd Pleasers). Background: a slow, subtle parallax of label art or a video loop of bottles rotating. | This is the 0.5-second hook. No clutter. No carousel. One line, one button. The art does the talking. |
| **2** | **The Journey Strip** | Horizontal scroll / visual progression showing the 4 collection tiers: Crowd Pleasers → Intro to Niche → Strong/Oud → Polarising Art. Each tier is a card with its illustration style getting bolder as you move right. | This IS the brand differentiator on the homepage. The journey is visible, not buried. Visual escalation left-to-right. Future collections show as "Coming Soon" with teaser art. |
| **3** | **Featured Products** | 3–4 products displayed as art objects. Large label close-ups. Minimal text — product name, one-line descriptor, price. Hover/tap reveals "View" CTA. | Not a product grid. A curated gallery. Each product gets breathing room. Dark background, products lit like gallery pieces. |
| **4** | **"Why This Is Different" Strip** | 3-column icon strip. (1) "Art you wear" — label icon. (2) "Scent that speaks" — wave/bottle icon. (3) "A journey, not a catalog" — progression arrow icon. One line each, no paragraphs. | Trust-building without a wall of text. Visual, scannable, confident. Reinforces key messages #1 and #2. |
| **5** | **Social Proof / Shelfie** | Customer photos or styled "shelfie" shots showing bottles displayed in real spaces. If no UGC yet, use branded lifestyle shots of bottles in context (desk, shelf, bag). Pull quote from a real customer DM if available. | "Fragrance designed to be shown off" — proven. If no real UGC exists yet, use 2–3 curated lifestyle shots with the caption: *"Where does your Whiff Theory live?"* |
| **6** | **Instagram Embed / Grid Preview** | Live feed or curated 4–6 image grid from Instagram. Link to profile. | Social proof + visual consistency. The grid should look like a continuation of the site, not an interruption. |
| **7** | **Footer** | Brand promise, secondary tagline, quick links (Collections, About, Contact, FAQ), social icons, payment trust badges, "Built in Vizag 🌊" as a subtle origin mention. | Warm, not corporate. The footer is the last thing a scrolling visitor sees — it should feel like a closing note, not a legal page. |

#### Home Page Tagline Usage
- Hero: Primary tagline — *"From your first real scent to the one that stops a room."*
- Journey strip heading: *"Start anywhere. Go somewhere."*
- Social proof section: *"Fragrance designed to be shown off."*

---

### Page 2: COLLECTION PAGE (per collection)

**Purpose:** Show all products in a collection with the collection's identity, vibe, and place in the journey. Make the customer understand *where they are* in the progression.

#### Sections

| # | Section | Content | Design Notes |
|---|---|---|---|
| **1** | **Collection Hero** | Collection name + descriptor. E.g., "CROWD PLEASERS — Your first real scent." Dark background, collection-specific accent color, representative label art. | Each collection has a slightly different color accent to signal progression. Crowd Pleasers = warm/approachable tones. Intro to Niche = deeper/richer. Strong/Oud = dark/intense. Polarising Art = high-contrast, provocative. |
| **2** | **Journey Breadcrumb** | A subtle horizontal indicator showing where this collection sits in the 4-tier journey. The current collection is highlighted. Others are clickable. | Always visible. Always reminds the customer: there's more. The journey is the architecture, not just the product. |
| **3** | **Product Grid** | Products in this collection. 2 columns mobile, 3 desktop. Each card: label art image, product name, one-line mood descriptor, price. No clutter. | Cards have generous padding. Label art is the hero of each card, not a tiny thumbnail. Hover state: subtle zoom or shadow lift. |
| **4** | **"Ready for More?"** | At the bottom: a gentle nudge to the next collection. "Explored Crowd Pleasers? Intro to Niche is where things get interesting." Link/card to next collection. | This is the Collection Ladder in action. Every collection page pushes toward the next. The journey never dead-ends. |

#### Collection-Specific Copy

| Collection | Hero Headline | Descriptor |
|---|---|---|
| **Crowd Pleasers** | "Start Here." | "Scents that earn compliments without trying. Your first step into fragrance that's actually worth showing off." |
| **Intro to Niche** | "Go Deeper." | "Complex. Layered. The kind of scent that makes someone lean in and ask. For the curious who are ready for more." |
| **Strong / Oud** | "Turn Heads." | "Depth. Intensity. Presence. This is where fragrance stops being pleasant and starts being powerful." |
| **Polarising Art** | "Make a Statement." | "Not everyone will love this. That's the point. For those who wear fragrance as self-expression, not politeness." |

---

### Page 3: PRODUCT PAGE

**Purpose:** The most important page. This is where the sale happens. Must deliver on the brand promise: art-first experience, scent storytelling, journey integration. Every product page is a mini art exhibition.

#### Sections

| # | Section | Content | Design Notes |
|---|---|---|---|
| **1** | **Product Hero** | Full-width label art image + bottle shot. Product name large. Collection badge (e.g., "CROWD PLEASER"). Price — clean, honest, no crossed-out MRP. | Dark background. The label art should be shot in detail — you should be able to see brush strokes, texture, illustration details. This is "the art is the point." |
| **2** | **Scent Profile — Plain Language** | 3–4 sentence mood description. NO note pyramids, no jargon. Describe the *feeling*, not the chemistry. E.g., "Petalina smells like stepping into a garden at sunset — soft rose, a little warmth, the kind of thing that makes someone lean in." | Written in Independent Artist voice. Short sentences. Evocative. This is where "Respect the beginner" lives. A first-time buyer should read this and *feel* the scent. |
| **3** | **The Story Behind** | 2–3 paragraphs of narrative — the mood, the inspiration, the character this scent embodies. EM5-style storytelling but NEVER referencing any source fragrance. Each product has its own mythology. | Styled differently from the scent profile — larger text, pull-quote treatment, slightly different background shade. This is the magazine editorial section. Not every buyer reads it, but those who do become loyal. |
| **4** | **Scent Details (Expandable)** | Collapsible accordion: Top/Middle/Base notes (described in plain language + proper note names), Size (ml), Concentration (EDP), Longevity estimate, Season / Occasion suggestion. | Beginners ignore this. Explorers and collectors open it. It's there for credibility without cluttering the main experience. Keep note descriptions human: "Bergamot (bright, citrusy)" not just "Bergamot." |
| **5** | **"The Art"** | A dedicated section showing the label illustration in detail — the artist's intent, the visual story. "Every Whiff Theory label is a piece of graphic art designed for your shelf, not your drawer." | This section makes the art a feature, not packaging. It's what separates a ₹249 Whiff Theory from a ₹249 white-label clone. |
| **6** | **Add to Cart** | Sticky/fixed CTA on mobile. Clean button: "Add to Cart — ₹249." Price always visible. No fake urgency ("only 3 left!"), no countdown timers. | Honest pricing philosophy in action. The button is confident, not desperate. Color: Teal accent. |
| **7** | **"Your Next Step"** | One product recommendation from the next collection up. Not a grid of "you may also like" — a single, confident pointer. "Enjoyed Petalina? Your next step is Passion." | This IS the Collection Ladder on the product page. One recommendation. One direction. "Start anywhere, go somewhere" made tangible. |
| **8** | **Reviews / Social Proof** | Customer reviews, star ratings, or curated DM screenshots. If no reviews yet, skip this section — don't fake it. Add it once real reviews exist. | Authenticity > volume. Five real reviews beat fifty fake ones. Consider adding a "Share your shelfie" CTA here to encourage UGC. |

#### Product Page Tagline Usage
- "The Art" section: *"Art you wear. Scent that speaks."*
- "Your Next Step" section: *"There's always a next one waiting."*

---

### Page 4: ABOUT

**Purpose:** Build trust. Tell the brand story. This is where Key Message #4 ("This is real") leads. For Sneha and Vikram, this page is the credibility check. For Arjun, it's the "cool origin story."

#### Sections

| # | Section | Content | Design Notes |
|---|---|---|---|
| **1** | **Hero** | *"From your first real scent to the one that stops a room."* + a visual of the founder or the Vizag coastline (Bay of Bengal, RK Beach, industrial skyline). | If no founder photo, use a styled Vizag coastal shot. The origin is felt, not forced. "Born on India's eastern coast" lives here. |
| **2** | **The Brand Story** | 3–4 paragraphs. Not a corporate bio — a personal narrative. Why this exists. The "I couldn't find a brand I was proud to name" origin. The art-first mission. The journey architecture. Written in Independent Artist voice. | First-person or close to it. This page should read like a conversation, not a press release. "We started because..." not "Whiff Theory was founded in..." |
| **3** | **What We Believe** | The 4 core values presented visually: (1) Art is non-negotiable, (2) Respect the beginner, (3) Earn the next purchase, (4) Built, not polished. Each with a one-line explanation. | Cards or icon-led blocks. Not a bulleted list — each value gets visual weight. These are design objects, not footnotes. |
| **4** | **Vizag Section** | A subtle nod to the city. "Where the Bay of Bengal meets iron and sunrise." A few lines about what Vizag brings to the brand — grit, freshness, first-sunrise energy. A coastal photo or illustration. | This is the Easter egg from the positioning strategy — Cultural Identity as an *undercurrent*. Present but not leading. Discovered by those who look. Never heavy-handed. |
| **5** | **The Pricing Truth** | A short block: "Our prices are real. No inflated MRPs. No perpetual sales. What you see is what it costs. The price includes the scent, the art, and the story." | Reinforces Key Message #4 and the pricing philosophy. Competitive differentiation against EM5/Lattafa pricing games without naming anyone. |
| **6** | **CTA** | "Start the journey" → links to Crowd Pleasers or the Journey Strip. | Every page pushes toward the product. The About page is never a dead end. |

---

### Page 5: CONTACT / FAQ

**Purpose:** Reduce friction for first-time buyers. Answer the questions that stop people from purchasing. Reinforce the "Respect the beginner" value.

#### FAQ Content (Key Questions)

| Question | Answer Direction | Key Message |
|---|---|---|
| "How long does the fragrance last?" | Honest — "4–8 hours depending on skin type and weather. Apply on pulse points for best results." No over-promising. | #4 — This is real |
| "Which one should I start with?" | "If you're new to fragrance: Petalina (soft, crowd-friendly, ₹249) or Aphrodite (warm, confident, ₹399). If you already know your taste: go straight to Intro to Niche." | #2 — Start anywhere, go somewhere |
| "Is this an EDP?" | "Yes. All Whiff Theory fragrances are Eau de Parfum — higher concentration than body sprays or EDT, which means better longevity and projection. In plain English: it lasts longer and people notice it." | #3 — You don't need permission |
| "What makes the labels special?" | "Every Whiff Theory label is an original piece of graphic art. We design each one to look as good on your shelf as the scent smells on your skin. The label is part of the product." | #1 — The art is the point |
| "What's your return/exchange policy?" | Keep it simple and fair. Specific policy TBD, but tone: honest, no fine print. | #4 — This is real |
| "Do you have a physical store?" | "Not yet. We're online-first, shipping across India. For now, you can reach us directly on WhatsApp." | Direct, personal |
| "What do the collection names mean?" | Briefly explain the 4-tier journey. Link to each collection. | #2 — Start anywhere, go somewhere |

#### Contact Section
- **WhatsApp link** (primary contact — personal, warm, aligns with current model)
- **Email** (secondary)
- **Instagram DM link** (social)
- No chatbot. No ticket system. Human responses. "Built, not polished."

---

### Page 6: CART → CHECKOUT

**Purpose:** Frictionless purchase completion. Reinforce the experience at the last touchpoint.

| Element | Design Direction |
|---|---|
| **Cart summary** | Product image (label art, not generic thumbnail), product name, price, quantity. Clean, no distractions. |
| **Bundle suggestion** | "Complete the set" — one bundle recommendation based on cart contents. E.g., if buying a Crowd Pleaser, suggest the Starter Set. Not an upsell grid — one confident recommendation. |
| **Price display** | No crossed-out prices. No "you saved ₹X." Just the price. Honest. |
| **Trust strip** | Below the cart: "Genuine fragrances · Graphic-art packaging · Real prices" — 3 micro-trust signals with icons. |
| **Checkout flow** | Standard: Shipping info → Payment → Confirmation. COD option critical for Indian market. UPI/GPay/Razorpay standard. |
| **Order confirmation** | Styled, branded confirmation page + email. Includes: "Your [product name] is on its way. Here's what to try next: [one recommendation]." The journey starts immediately. |

---

### Page 7: JOURNAL / BLOG (Future)

**Purpose:** SEO + brand voice content. "Scent storytelling" that draws organic traffic and builds authority.

| Content Type | Example | Key Message |
|---|---|---|
| **Fragrance education** | "What Is EDP? A No-Jargon Guide to Perfume Concentration" | #3 — You don't need permission |
| **Behind the label** | "How We Designed Petalina's Label Art" | #1 — The art is the point |
| **Journey stories** | "I Started with Crowd Pleasers. Here's Where I Am Now." | #2 — Start anywhere, go somewhere |
| **Vizag stories** | "The Bay, the Steel, and the Sunrise — What Vizag Put in Our DNA" | Cultural Identity undercurrent |

---

### Page 8: MY SCENT JOURNEY (Logged-In / Post-Purchase)

**Purpose:** A personalized, interactive page that visualizes the customer's fragrance journey — what they've purchased, what they've wishlisted, and the "scent personality" emerging from their choices. This is the Collection Ladder made *visible and alive*. It's the page that makes someone think "I want to fill this in."

**Priority:** P1 — Post-launch (requires user accounts + purchase history)

---

#### The Core Visualization: Journey Constellation

The centerpiece is an **animated constellation map** — a reactive, particle-based graphic where each purchased or wishlisted fragrance becomes a glowing node, and connections form between them based on shared scent notes.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│     ◉ Passion                        ○ Irish Tweed             │
│      ╲ smoky, leather                  / green, fresh          │
│       ╲                               /                        │
│        ╲         ◎ YOUR SCENT        /                         │
│         ╲───── PERSONALITY ────────/                           │
│                 ◈ "Night Owl"                                  │
│                                                                 │
│     ● Petalina          ● Aphrodite                            │
│       floral, soft        warm, confident                      │
│           ╲                  /                                  │
│            ╲────────────────/                                   │
│             shared: musk                                       │
│                                                                 │
│     ○ ○ ○  (empty nodes = future journey)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

● = Purchased    ○ = Wishlisted    ◎ = Personality node
Lines pulse gently between connected notes.
Empty nodes drift slowly, waiting to be "discovered."
```

#### How It Works (Technical Spec)

| Element | Behavior | Implementation |
|---|---|---|
| **Purchased nodes (●)** | Solid, glowing circles. Colored by collection tier (Crowd Pleaser = warm coral, Intro to Niche = teal, Strong/Oud = deep amber, Polarising Art = electric violet). Pulse gently on idle. On hover/tap: expand to show product name, label art thumbnail, purchase date, and note tags. | Canvas-based (HTML5 Canvas or WebGL via Three.js) or SVG with GSAP/Framer Motion animation. Each node = data point from order history. |
| **Wishlisted nodes (○)** | Hollow circles, same tier colors but at 40% opacity. Drift slightly in a slow orbit — they're "out there, waiting." On hover/tap: show product name + "Add to Cart" CTA. | Wishlist data from user account. The hollow-to-solid transition on purchase is a satisfying visual reward. |
| **Connection lines** | Thin lines connect nodes that share scent notes (e.g., Petalina and Aphrodite both have musk → connected). Lines pulse with a subtle traveling-light animation — a particle moving along the connection every few seconds. | Note-tag matching logic. Lines rendered as SVG paths or Canvas strokes with animated dash-offset or particle trail. |
| **Empty future nodes** | Faint, drifting dots representing products not yet explored. Clustered by collection tier. They float in the dark background — the "undiscovered" part of the constellation. On hover: "Something awaits here" + collection name. | Products from the catalog that the user hasn't purchased or wishlisted. Creates a visual "incompleteness" that drives curiosity. |
| **Personality node (◎)** | A larger, centrally-positioned node that represents the customer's emerging scent personality (algorithmically derived from their purchase/wishlist pattern). Radiates soft rings outward. | See Scent Personality section below. |
| **Reactive to scroll/mouse** | The entire constellation has subtle parallax depth — nodes at different "distances" move at different speeds when the user scrolls or moves their cursor. Creates a living, breathing feeling. | CSS `perspective` + `translateZ` layers, or Canvas camera offset tracking mouse position. Not overwhelming — 2-3px of movement, not a video game. |
| **Mobile: gyroscope tilt** | On mobile, the constellation reacts to device tilt (gyroscope API). Tilt your phone and the nodes shift gently. Opt-in ("shake your phone to explore"). | `DeviceOrientationEvent` API. Fallback: touch-drag panning. Battery-conscious — throttled to 30fps. |

#### Sections (top to bottom)

| # | Section | Content | Design Notes |
|---|---|---|---|
| **1** | **Journey Header** | "Your Scent Journey" + the customer's name. Below: a one-line summary — "3 scents discovered. 2 on your radar. Your personality: Night Owl." | Personal, warm. Not "My Account" — this is a *page about them*, not a settings page. Dark background, warm white text. |
| **2** | **The Constellation** | Full-width animated constellation map (described above). Takes up the majority of the viewport. Interactive — nodes are tappable/hoverable. | This is the hero of the page. It should feel like looking at a personal star map. Dark `#0A0E1A` background, glowing nodes, subtle particle effects. Loads with a gentle fade-in, nodes appearing one by one in purchase-date order. |
| **3** | **Scent Personality Card** | A styled card showing the customer's derived scent personality archetype (see below). Includes: archetype name, one-line description, dominant note families, and a radar/petal chart showing their scent profile across 5 axes. | This card is shareable — a "Share Your Scent Personality" button generates an image (or link) for Instagram Stories. This is UGC fuel. |
| **4** | **Journey Timeline** | Below the constellation: a horizontal (desktop) or vertical (mobile) timeline showing purchases in chronological order. Each item = label art + product name + date + collection badge. The line connecting them is animated — it "draws" as the user scrolls, revealing their progression. | The timeline makes the Collection Ladder tangible. If someone went Petalina → Aphrodite → Passion, they can *see* themselves climbing. If they jumped straight to Intro to Niche, the timeline shows their unique path. |
| **5** | **"Your Next Step" (Personalized)** | Based on their purchase pattern: one recommended product from the next collection tier, with a short reason. "You've been drawn to warm, bold scents. Passion would be your next discovery." | Not a generic recommendation grid — one product, one reason, one CTA. The journey page culminates in a *nudge forward*. |
| **6** | **Wishlist Section** | Grid of wishlisted products with label art, name, price, and "Add to Cart" CTA. Wishlisted items also appear as hollow nodes in the constellation above — visual connection between sections. | Clean grid, 2 columns mobile, 3 desktop. Each card matches the standard product card component but with a heart/wishlist icon filled. |

---

#### Scent Personality System

The personality archetype is derived from the customer's purchases + wishlist, mapped across 5 scent axes:

| Axis | Low End | High End | What It Measures |
|---|---|---|---|
| **Warmth** | Fresh / Aquatic / Green | Amber / Vanilla / Oud | Preference for cool vs. warm base notes |
| **Boldness** | Soft / Subtle / Crowd-friendly | Loud / Polarizing / Challenging | How far up the Collection Ladder their choices go |
| **Sweetness** | Dry / Woody / Smoky | Sweet / Fruity / Gourmand | Sugar-forward vs. dry composition preference |
| **Complexity** | Simple / Linear / Clean | Layered / Evolving / "Shapeshifter" | Whether they gravitate toward straightforward or complex scent profiles |
| **Mood** | Daytime / Work / Safe | Night / Date / Provocative | Occasion mapping of their chosen scents |

##### The Radar Chart ("Scent DNA")

A 5-axis petal/radar chart that fills in as the customer buys more. With 1 purchase, it's sparse and unbalanced. With 5+, it forms a distinct shape — their "Scent DNA."

```
            Warmth
              ▲
             ╱|╲
            ╱ | ╲
     Mood ◄───◎───► Boldness
            ╲ | ╱
             ╲|╱
       Sweetness ▼ Complexity

The shape changes with every purchase.
Animates smoothly when a new purchase is added.
Petal area = how developed that axis is.
```

**Implementation:** SVG `<polygon>` with vertices calculated from axis scores. Animated with CSS transitions or Framer Motion `animate` on vertex positions. Each new purchase triggers a smooth morph of the shape.

##### Personality Archetypes

Once the radar chart has enough data (3+ purchases), assign an archetype:

| Archetype | Profile | Trigger |
|---|---|---|
| **The Night Owl** | High warmth, high boldness, high mood (nighttime). Drawn to dark, intense fragrances. | Purchases skew Strong/Oud + warm + evening scents |
| **The Explorer** | Balanced across all axes. Buys from multiple collections. No single dominant note family. | Spread across 2+ collections, no axis dominant |
| **The Romantic** | High sweetness, high warmth, moderate complexity. Gravitates toward soft, enveloping scents. | Rose, vanilla, amber notes dominate purchases |
| **The Minimalist** | Low complexity, low boldness. Prefers clean, crowd-friendly scents. Sticks to what works. | Repeat purchases within Crowd Pleasers, fresh/clean notes |
| **The Provocateur** | High boldness, high complexity, low sweetness. Wants scents that start conversations. | Purchases in Polarising Art / Strong/Oud, smoky/animalic notes |
| **The Curator** | High complexity, moderate everything else. Builds a diverse, intentional collection. | 5+ purchases spanning 3+ collections, deliberate variety |

Archetypes **update dynamically** as the customer buys more. The transition is animated — "Your personality evolved: The Minimalist → The Explorer."

---

#### Interaction Details

| Interaction | Desktop | Mobile |
|---|---|---|
| **Node hover** | Expand with label art + details tooltip. Connected lines brighten. Other nodes dim slightly (focus effect). | Tap to expand. Second tap closes. |
| **Node click** | Opens a mini product card overlay (not a full page nav). CTA: "View Product" or "Add to Cart." | Same — bottom sheet overlay with product details. |
| **Empty node hover** | Faint glow + "Something awaits here" + collection name. | Tap to reveal. |
| **Constellation drag** | Pan the canvas to explore on large collections. Mousewheel = zoom. | Two-finger pinch to zoom. Single finger to pan. |
| **Timeline scroll** | Horizontal scroll with animated line drawing. Mouse-driven. | Vertical scroll, tap milestones to pulse the corresponding constellation node. |
| **Personality card share** | "Share" button → generates a styled card image (archetype name, radar chart, top 3 notes, Whiff Theory branding) for download or direct share. | Same — optimized for Instagram Story dimensions (1080×1920). |

#### Loading & First-Visit States

| State | Behavior |
|---|---|
| **First visit (no purchases)** | The constellation is all empty/future nodes drifting gently. Message: "Your journey starts with your first scent. Every purchase lights up your constellation." CTA → Crowd Pleasers. The page is a teaser — beautiful but empty, making you want to fill it. |
| **After first purchase** | One solid node appears with a gentle "born" animation (expands from center, radiates a ring). The timeline starts with one point. Personality card shows: "Too early to tell — keep exploring." |
| **3+ purchases** | Constellation takes shape. Connection lines appear between shared-note products. Personality archetype assigned with a reveal animation. Radar chart fills in. |
| **Wishlisted but not purchased** | Hollow nodes orbit gently. They're visible in the constellation but unfulfilled — visual incompleteness that drives action. |

#### Technical Implementation Notes

| Concern | Approach |
|---|---|
| **Rendering engine** | **Option A (Recommended):** SVG nodes + GSAP/Framer Motion for animation. Lighter, more accessible, easier to make responsive. Works for <50 nodes. **Option B:** HTML5 Canvas with a lightweight library (e.g., p5.js or custom Canvas API). Better performance at scale but harder to make interactive/accessible. **Option C:** Three.js WebGL for full 3D constellation with depth-of-field. Most impressive but heaviest — reserve for future upgrade. |
| **Data source** | Purchase history + wishlist from Medusa customer/order API. Note-tag matching for connection lines from product metadata (custom fields on Medusa products). |
| **Performance** | Lazy-load the constellation. Show the header + personality card first, constellation animates in as the user scrolls into view. Throttle animation to 30fps on mobile. Reduce particle effects on low-power devices via `prefers-reduced-motion` media query. |
| **Accessibility** | Below the constellation: a plain-text "Journey Summary" fallback listing purchases, wishlist, and personality in readable format. The constellation is the *delight* layer; the data is always accessible. |
| **Shareability** | The personality card generates a static image via `html2canvas` or server-side rendering (Puppeteer). Pre-styled for Instagram Story (1080×1920) with Whiff Theory branding, the user's archetype, radar chart, and top 3 notes. A shareable link also works: `whifftheory.com/journey/[username]` — a public (opt-in) view of someone's constellation. |

---

#### Why This Page Matters Strategically

| Strategy Element | How This Page Delivers |
|---|---|
| **Collection Ladder** | The constellation *is* the ladder, visualized. Empty nodes from higher tiers create aspiration. |
| **Earn the next purchase** | Every visit shows both progress and incompleteness. The "Your Next Step" recommendation is personalized, not generic. |
| **Art is the point** | The page itself is a piece of interactive art. It's the kind of page people screenshot and share. |
| **Shareability = organic growth** | The personality card is designed for Instagram Stories. "I'm a Night Owl. What are you?" — this is free marketing from your most engaged customers. |
| **Respect the beginner** | The first-visit state is inviting, not intimidating. "Your journey starts with your first scent" — no pressure, just a beautiful empty canvas waiting to be filled. |
| **Competitive moat** | No Indian fragrance brand has anything like this. EM5, Lattafa, Projekt Alternative — none of them turn purchase history into an interactive experience. This is the kind of feature that gets shared in fragrance communities. |

---

#### Personalized Suggestions Engine

Every logged-in user gets **tailored product recommendations** across the storefront — not generic "bestsellers" but suggestions driven by their purchase history, wishlist, scent personality archetype, and position on the Collection Ladder.

##### How Suggestions Are Generated

| Signal | Weight | What It Tells Us |
|---|---|---|
| **Purchase history** | Highest | Which note families they actually buy (not just browse). A customer who bought Petalina (rose, musk) and Aphrodite (warm, amber) has a clear warm-floral lean. |
| **Scent personality archetype** | High | The archetype narrows the catalog. A "Night Owl" doesn't get recommended the lightest Crowd Pleaser — they get the darkest thing in their current tier, or a nudge to the next tier up. |
| **Collection tier position** | High | Where they are on the ladder determines *which direction* to push. Crowd Pleaser buyers get Intro to Niche suggestions. Intro to Niche buyers get Strong/Oud teasers. Nobody gets pushed backwards. |
| **Wishlist** | Medium | Wishlisted items = intent. Suggestions complement or contrast wishlisted products: "You wishlisted Passion. You might also be ready for [Strong/Oud product]." |
| **Browse behavior** | Low (future) | Which product pages they visited, time spent on the "Story Behind" section. Requires analytics integration — Phase 2+. |

##### Suggestion Types

| Type | Logic | Where It Appears | Example |
|---|---|---|---|
| **"Your Next Step"** | Next product on the Collection Ladder based on current tier + note preference. Always pushes *forward*. | Product page (bottom), Scent Journey page (section 5), post-purchase email | *"You've explored Crowd Pleasers. Based on your love for warm notes, Passion (Intro to Niche) is your next step."* |
| **"Complete Your Palette"** | Products that fill a *gap* in their Scent DNA radar chart. If their Warmth axis is high but Freshness is zero, suggest a fresh/aquatic scent. | Scent Journey page (below personality card), account dashboard | *"Your scent DNA leans warm and bold. Try [fresh product] to round out your collection — you might surprise yourself."* |
| **"Because You Wear [X]"** | Products sharing 2+ scent notes with a purchased product, from the same or next tier. Classic collaborative-filtering but note-based, not purchase-based. | Product page sidebar, collection page highlights, homepage (logged-in) | *"Because you wear Aphrodite: Passion shares her amber warmth but goes darker."* |
| **"Others Like You Explored"** | Archetype-based. "Night Owls also bought..." — cohort recommendation using the personality system. | Scent Journey page, email campaigns | *"Night Owls like you gravitate toward [product]. See why."* |
| **"Seasonal Shift"** | Time-of-year aware. Summer → suggest lighter scents. Winter → suggest warmer/heavier. Layered on top of personality. | Homepage (logged-in), WhatsApp broadcast, email | *"Summer's here. Even Night Owls need a daytime scent. Try [lighter product]."* |
| **"Bundle for You"** | Personalized bundle suggestion based on what they own + what complements it. Not a generic starter set — a set built *for them*. | Cart page, Scent Journey page, post-purchase email | *"The Night Owl Set: [Product A] + [Product B] — your warmth profile, bundled."* |

##### Where Suggestions Surface (Account-Wide)

| Touchpoint | What the User Sees | Personalization Level |
|---|---|---|
| **Homepage (logged in)** | "Picked for You" section replaces the generic "Featured Products" grid. 2–3 product cards chosen by the engine. | Archetype + purchase history + tier position |
| **Product Page** | "Your Next Step" card at bottom is personalized. If logged in, the recommendation is based on *their* data, not a static default. | Purchase history + note matching |
| **Collection Page** | A subtle "Recommended for You" badge on the 1–2 products in this collection that best match their profile. Not intrusive — just a small teal tag. | Note preference + archetype |
| **Cart Page** | "Complete the experience" — one product suggestion that pairs with what's in the cart, based on their profile. | Cart contents + purchase history |
| **Scent Journey Page** | Multiple suggestion types: "Your Next Step," "Complete Your Palette," "Others Like You." This page is the suggestion hub. | Full engine — all signals |
| **Post-Purchase Email** | 5–7 days after delivery: "How was [product]? Based on your scent DNA, here's what we'd suggest next." One product, one reason. | Purchase history + archetype + note matching |
| **WhatsApp Follow-Up** | Personal DM with recommendation. At current scale, this can be human-curated using the engine's output as a guide. | Same as email, but conversational |
| **Account Dashboard** | Small "Suggested for You" widget — 1 product card + reason. Visible every time they log in. | Archetype + ladder position |

##### Implementation Phases

| Phase | What Ships | Data Required |
|---|---|---|
| **P1 (Manual)** | "Your Next Step" recommendations are hand-curated per product (static mapping: Petalina → Passion, etc.). Personality archetype assigned manually based on purchase count. Suggestions in post-purchase WhatsApp DMs are human-written using the suggestion logic as a guide. | Purchase history (order data) |
| **P2 (Rule-Based)** | Automated note-matching: products tagged with scent notes, engine matches shared notes across purchase history. "Because You Wear [X]" and "Complete Your Palette" suggestions go live. Archetype auto-assigned from radar chart scores. Homepage "Picked for You" section activates for logged-in users. | Product note metadata + purchase history + wishlist |
| **P3 (Cohort + Seasonal)** | "Others Like You" cohort suggestions based on archetype clusters. Seasonal awareness layer. Personalized bundle generation. Browse-behavior signals added (requires analytics). | All above + analytics data + cohort size (needs 300+ users for meaningful patterns) |

##### The Rules (What the Engine Never Does)

| Rule | Why |
|---|---|
| **Never push backwards on the ladder** | A customer who bought Intro to Niche products doesn't get Crowd Pleaser suggestions. The journey goes forward. |
| **Never suggest the same product they already own** | Obvious, but worth stating. The engine deduplicates against purchase history. |
| **Never show more than 3 suggestions at once** | One confident recommendation > a grid of 12 "you might like" products. Curation, not overwhelm. |
| **Always pair a suggestion with a reason** | "Because you wear Aphrodite" / "To complete your palette" / "Night Owls love this." The *why* builds trust. A naked product card is an ad. A product card with a reason is advice. |
| **Never use discount/urgency language** | No "Buy before it's gone!" on personalized suggestions. The tone is guide-like, not salesy. Consistent with the Independent Artist personality. |
| **Degrade gracefully for new users** | No purchase history? Show curated bestsellers. 1 purchase? Show the static "Your Next Step" mapping. The engine gets smarter as the customer gives it more data — but it's never empty. |

---

## 3. COMPONENTS

### 3A. Global Components (Every Page)

| Component | Specs | Behavior |
|---|---|---|
| **Navigation Bar** | Logo (left), collection links as journey sequence (center/horizontal), Cart icon + count (right). Dark background `#0A0E1A`, warm white text `#F0EDE8`. | Sticky on scroll. On mobile: hamburger → full-screen overlay with collection journey visuals. The nav itself communicates the brand — collections displayed as a progression, not a flat list. |
| **Journey Progress Bar** | Thin horizontal bar below nav or integrated into collection pages. 4 segments: Crowd Pleasers → Intro to Niche → Strong/Oud → Polarising Art. Current collection highlighted in Teal. | Clickable navigation. Always shows where the customer "is" in the journey. Subtle animation on load — the progression fills left to right. |
| **Footer** | Brand promise, secondary taglines, quick links: Collections, About, Contact, FAQ. Social icons (Instagram, YouTube, WhatsApp — the real channels). "Crafted in Vizag" subtle note. | Warm tone. Not a legal dump. Include a single email signup line: "Join the journey. New drops in your inbox." |
| **Announcement Bar** | Narrow bar above nav. For shipping updates ("Free shipping above ₹999"), new launches ("Passion just dropped"), or seasonal moments ("Diwali Set available now"). | Teal background, white text. Dismissable. Never "SALE!!!" — always informational or experiential. Max 3–4 times per year for promotional content. |
| **Toast / Notification** | "Added to cart" confirmation with product label art thumbnail. | Brief, styled, not interruptive. Shows label art to reinforce the art-first experience even in micro-interactions. |

### 3B. Product Components

| Component | Specs | Usage |
|---|---|---|
| **Product Card** | Label art image (hero), product name (Space Grotesk Bold), one-line mood descriptor (Inter), price (clean, no strikethrough), collection badge (micro label). Hover: subtle lift/shadow + "View" overlay. | Collection pages, homepage featured grid, "Your Next Step" recommendations. |
| **Note Tags** | Small pills/chips: "Rose · Musk · Amber." Styled in warm grey on light bg or teal outline on dark bg. | Product cards, product page, filter UI. Plain-language note names: "Smoky Leather" not just "Leather." |
| **Collection Badge** | Micro label in ALL CAPS. "CROWD PLEASER" / "INTRO TO NICHE." Background matches collection accent color. | Product cards, product page hero, cart summary. Instantly tells the customer which tier a product belongs to. |
| **"Your Next Step" Card** | Standalone recommendation card. Product image + "Your next step →" + product name + collection name. Teal accent border. | Bottom of product pages. One card, one recommendation. Not "related products" — the journey's next rung. |
| **Price Display** | Large, clean. Space Grotesk SemiBold. No ~~strikethrough~~, no "was/now," no discount percentages. Just the number: "₹249." | Product cards, product page, cart. The pricing philosophy made visual. |
| **Add to Cart Button** | Teal background `#00B4A6`, warm white text, rounded corners. "Add to Cart — ₹[price]." Price inside the button removes friction. | Product page (sticky on mobile), quick-add on product cards. |
| **Scent Profile Block** | 3–4 sentence mood paragraph. Inter Regular, larger size (18px). Evocative, plain-language scent description. No note pyramid. | Product page section 2. The beginner-friendly scent explanation. |
| **Story Behind Block** | Narrative section with pull-quote styling. Slightly different background (`#0F1420` on dark pages). Larger line-height for readability. | Product page section 3. The EM5-style editorial storytelling. |

### 3C. Trust / Proof Components

| Component | Specs | Usage |
|---|---|---|
| **Shelfie Gallery** | Horizontal scroll of customer photos or styled lifestyle shots showing bottles displayed in real spaces. | Homepage, collection pages, about page. Caption prompt: "Where does your Whiff Theory live?" |
| **Review Card** | Star rating, review text, reviewer name (first name only), product purchased, date. Clean, minimal. | Product pages (once real reviews exist). Never fabricated. |
| **Trust Strip** | 3-icon horizontal strip: "Genuine EDP" + "Graphic-Art Packaging" + "Real Prices." | Homepage, cart, checkout. Micro-reassurance at decision points. |
| **DM Screenshot** | Styled screenshot of a real WhatsApp/Instagram DM compliment or testimonial. Blurred name/photo for privacy. | Homepage social proof, product pages. Feels more authentic than polished testimonials. |

### 3D. Journey / Navigation Components

| Component | Specs | Usage |
|---|---|---|
| **Collection Journey Map** | 4-tier horizontal visual: each tier = card with illustration, collection name, price range, and one-line descriptor. Clickable. Visual escalation left-to-right (colors get bolder, art gets more intense). | Homepage section 2, about page, sitemap. THE signature component of the storefront. |
| **"Ready for More?" Block** | End-of-collection nudge. One card pointing to the next collection. "Explored Crowd Pleasers? → Intro to Niche is where things get interesting." | Bottom of collection pages. The ladder in action. |
| **Journey Breadcrumb** | Thin horizontal line with 4 dots/markers, current position highlighted. | Collection pages, product pages. Subtle, persistent context. |

---

## 4. FEATURES

### 4A. Core E-Commerce

| Feature | Specs | Priority |
|---|---|---|
| **Product Catalog** | Organized by collection (4 tiers), not by flat category or alphabetical. The journey IS the navigation. | P0 — Launch |
| **Shopping Cart** | Persistent cart with label art thumbnails, subtotal, simple quantity controls. | P0 — Launch |
| **Checkout** | Guest checkout + optional account creation. COD required (Indian market essential). UPI / GPay / Razorpay via Medusa payment providers. | P0 — Launch |
| **Order Tracking** | Post-purchase tracking page/link. Shiprocket or Delhivery integration. | P0 — Launch |
| **Mobile Responsive** | Mobile-first design. 70%+ traffic will be mobile (Instagram → product page flow). | P0 — Launch |
| **WhatsApp Integration** | Floating WhatsApp button on all pages. Click-to-chat with pre-filled message: "Hey, I'm interested in [product name]." | P0 — Launch |

### 4B. Brand Experience Features

| Feature | Specs | Priority |
|---|---|---|
| **Collection Journey Navigation** | The 4-tier journey is the primary site navigation, not a secondary filter. The customer always sees where they are and where they can go next. | P0 — Launch |
| **"Your Next Step" Recommendations** | Each product page shows one recommendation from the next collection tier. Manual curation, not algorithm. | P0 — Launch |
| **Bundle Builder** | Pre-configured bundles: "The Starter Set" (2 Crowd Pleasers + 1 Intro to Niche). Bundle price = value add, not discount. | P1 — Post-launch |
| **Scent Quiz / Guide** | Simple 3-question quiz: "When do you wear fragrance? → What do you like? → How bold?" → Recommends a specific product + collection tier. | P1 — Post-launch |
| **Post-Purchase Journey Email** | Automated email 5–7 days after delivery: "How was [product]? When you're ready, your next step is [recommendation]." | P1 — Post-launch |
| **Shelfie UGC Gallery** | Customer-submitted photos of their bottles on shelves/desks. Tag-to-submit system via Instagram or upload form. | P2 — Growth phase |
| **Discovery / Sample Sets** | ₹249–₹399 sets: 3–4 small vials spanning collections. Reduce first-purchase risk. | P2 — Growth phase |

### 4C. Trust & Credibility Features

| Feature | Specs | Priority |
|---|---|---|
| **Real Reviews** | Native review system or Yotpo/Judge.me integration. Only display verified purchases. Never seed with fake reviews. | P1 — Post-launch |
| **"Behind the Label" Content** | A mini-section on select product pages showing the label design process — sketches, iterations, final art. Makes the art tangible. | P1 — Post-launch |
| **Instagram Feed Embed** | Live or curated Instagram grid on homepage and about page. Shows the brand is active and real. | P0 — Launch |
| **No Fake Urgency** | No "only 3 left!", no countdown timers, no "X people are viewing this." The pricing philosophy extending to UX. | Always — by omission |

### 4D. Future / Scale Features

| Feature | Specs | Priority |
|---|---|---|
| **Insider Community Signup** | Waitlist / early-access signup for Insider Loop (activate at 300–500 buyers). | P2 — At ~300 buyers |
| **Limited-Edition Drops** | "Drop" page with countdown to launch (not a discount countdown — a launch countdown). Serves Vikram/collector persona. | P2 — Growth phase |
| **Artist Collaboration Pages** | When label artists are featured, a dedicated page per artist showing their work, process, and the products they designed for WT. | P3 — Maturity |
| **Journal / Blog** | SEO + authority content: fragrance education, label art stories, Vizag stories. | P2 — Growth phase |

---

## 5. DESIGN DIRECTION

### 5A. Overall Aesthetic: Gallery, Not Marketplace

The Whiff Theory storefront should feel like walking into a **small, curated art gallery** — not browsing a marketplace. Every element serves the art. White space is generous. The products are displayed, not stacked.

| Principle | Rule | Example |
|---|---|---|
| **Dark canvas, bright art** | Default dark backgrounds make label art pop. The product is the color — the site is the frame. | Product pages on `#0A0E1A` with vibrant label illustrations in the hero. |
| **Generous spacing** | Components breathe. No cramming. No "above the fold" anxiety. If a product needs scroll to see the full story, that's good — it rewards attention. | Product cards with 32–48px padding. Collection pages with 80px between sections. |
| **Minimal UI** | Buttons, icons, and navigation are subtle servants. The UI should be nearly invisible — the products are the interface. | Thin borders, no heavy drop shadows, no gradients on UI elements. Teal accent for interactive elements only. |
| **Intentional asymmetry** | Not everything is centered-and-stacked. Editorial layouts with occasional offset images, full-bleed hero moments, and text wrapping around product shots. | About page with an offset Vizag image. Product page with story text alongside a label detail crop. |
| **Motion as accent** | Subtle animations: fade-in on scroll, gentle hover lifts on cards, smooth transitions between pages. No bouncing, no spinning, no confetti. | Product cards lift 4px with a soft shadow on hover. Page transitions crossfade. |

### 5B. Mobile-First Principles

| Principle | Mobile Application |
|---|---|
| **Dark canvas** | Full dark backgrounds. AMOLED-friendly — true blacks where possible. |
| **Sticky CTA** | "Add to Cart — ₹[price]" sticks to bottom of screen on product pages. Always accessible. |
| **Vertical journey** | Collection journey map stacks vertically on mobile (cards scrolled through, not compressed). |
| **Thumb-friendly** | Tap targets minimum 44px. Collection badges, note tags, and CTAs spaced for thumbs, not cursors. |
| **Image priority** | Label art loads first. Text content loads below. On mobile, the visual hook IS the page. |
| **Bottom navigation** | Consider a bottom nav bar on mobile: Home, Collections, Cart, WhatsApp. Mimics app feel. |

### 5C. Page-Specific Design Signatures

| Page | Design Signature |
|---|---|
| **Home** | Cinematic. Full-bleed hero, then curated gallery scrolling. Feels like a lookbook, not a store. |
| **Collection** | Editorial. Magazine-style layout with collection identity (color, art style) carrying the page. |
| **Product** | Exhibition. The product is the exhibit. Dark walls, spotlight on the art, narrative on a plaque beside it. |
| **About** | Documentary. Personal, warm, slightly raw. Photos with natural light. "Built, not polished" lives here. |
| **Cart/Checkout** | Clean and functional. The one place where UI efficiency beats aesthetics. Fast, honest, frictionless. |

---

## 6. INTERACTION & MICRO-COPY

### 6A. Button Copy

| Action | Standard Copy | Alternative |
|---|---|---|
| **Primary CTA (product)** | "Add to Cart — ₹249" | "Get This — ₹249" |
| **Primary CTA (homepage)** | "Start Your Journey" | "Explore the Collection" |
| **Secondary CTA (collection)** | "View" (on product card hover) | "See the Art" |
| **Next step** | "Your Next Step →" | "Go Deeper →" |
| **Bundle** | "Get the Set" | "Start the Journey" |
| **WhatsApp** | "Chat with Us" | "Ask Us Anything" |

### 6B. Empty / Edge States

| State | Copy |
|---|---|
| **Empty cart** | "Nothing here yet. Every journey starts with a first step." → CTA: "Browse Crowd Pleasers" |
| **Coming Soon collection** | "This collection is still being forged. Drop your email — you'll be the first to know." |
| **No reviews yet** | Section hidden — not "Be the first to review!" which broadcasts zero sales. |
| **Out of stock** | "This one's gone for now. Want to know when it's back?" → Email capture. |
| **404** | "You've wandered off the path. Let's get you back." → CTA: "Return Home" |

### 6C. Loading & Transitions

| Element | Behavior |
|---|---|
| **Page load** | Label art fades in first (0.2s), then text (0.3s). Products appear before navigation is fully rendered — art leads. |
| **Image loading** | Low-res blur-up placeholder → sharp image. Never show empty rectangles or spinners on product images. |
| **Add to cart** | Button text briefly changes to "Added ✓" in warm white, then returns. Subtle cart icon counter animation. |
| **Collection switch** | Crossfade. No hard page refresh. Journey breadcrumb updates with a sliding highlight. |

---

## 7. TECHNICAL STACK — EXISTING INFRASTRUCTURE

### Current Setup

The storefront is **already live** on the following stack. This is not a greenfield build — it's an overhaul of an existing, functional but designless site.

| Layer | Technology | Hosted On | Status |
|---|---|---|---|
| **Storefront (Frontend)** | Next.js (Medusa.js starter template) | Vercel | Live, default template — no brand styling |
| **Backend / Admin** | Medusa.js (headless commerce engine) | Railway | Live, functional — products, orders, payments working |
| **Database** | PostgreSQL (via Medusa) | Railway | Managed by Medusa |
| **Architecture** | Headless commerce — API-driven, decoupled frontend/backend | — | Full design freedom on the frontend |

### Why This Stack Is Actually Perfect

The Medusa + Next.js headless architecture gives **total design freedom** — which is exactly what this brand needs. Unlike Shopify's Liquid templates or theme constraints, there's no template fighting against the gallery aesthetic. Every component, layout, animation, and interaction can be built exactly to spec.

| Advantage | What It Means for the Overhaul |
|---|---|
| **Next.js = React** | Full component-based architecture. Every section in this design doc translates directly to a React component. GSAP, Framer Motion, Three.js — all installable via npm. |
| **App Router / Server Components** | Next.js server components for fast initial loads (product data, collection pages). Client components for interactive elements (constellation map, radar chart, add-to-cart). |
| **Vercel hosting** | Edge-optimized delivery, automatic image optimization via `next/image`, ISR (Incremental Static Regeneration) for product pages that update when Medusa data changes. |
| **Medusa API** | REST + JS SDK for all commerce operations: products, collections, carts, orders, customers, wishlists. The suggestion engine and Scent Journey page read from these APIs. |
| **No theme constraints** | The current bland starter template is being *replaced*, not modified. Build the design system from scratch in Tailwind CSS / CSS Modules — no fighting inherited styles. |

### Overhaul Strategy — What Changes, What Stays

| Layer | Action |
|---|---|
| **Medusa backend (Railway)** | **Keep as-is.** Products, collections, orders, payments — all functional. Add custom fields for scent metadata (note tags, collection tier, season, mood) via Medusa's custom attributes or a `metadata` JSON field on products. |
| **Next.js storefront (Vercel)** | **Full redesign.** Strip the starter template. Rebuild all pages and components from this design doc. Keep the Medusa SDK integration for data fetching. Replace all default UI with the brand design system. |
| **Styling** | **New design system.** Implement the color palette, typography (Space Grotesk + Inter via Google Fonts or `next/font`), and component library from Section 1 of this doc. Tailwind CSS recommended for utility-first styling with custom theme config matching the palette. |
| **Routing** | Map Next.js routes to the page architecture: `/` (home), `/collections/[handle]` (collection pages), `/products/[handle]` (product pages), `/about`, `/faq`, `/journey` (Scent Journey page), `/journal` (future blog). |

### Technical Implementation Guide

| Concern | Approach |
|---|---|
| **Payments** | Razorpay integration via Medusa's payment provider plugins. UPI, GPay, cards, **COD** (critical for Indian market — configure via Medusa's manual payment provider or Razorpay COD). |
| **Shipping** | Shiprocket or Delhivery — integrate via Medusa's fulfillment provider plugins. Pan-India coverage, rate calculation, tracking. |
| **Analytics** | Google Analytics 4 + Meta Pixel. Install via `next/script`. Track: collection-to-collection flow (are people climbing the ladder?), product page scroll depth (are they reading the story?), journey completion (do people progress?). |
| **Email** | Resend, SendGrid, or Mailchimp — via Medusa's notification provider. Post-purchase journey emails: "Your next step" automation triggered by order completion events in Medusa. |
| **Images** | `next/image` with Vercel's built-in image optimization. WebP/AVIF auto-format. Blur-up placeholders via `placeholder="blur"`. Dark product images compress extremely well. |
| **Fonts** | `next/font` for Space Grotesk + Inter. Self-hosted, zero layout shift, optimal loading. |
| **Animations** | Framer Motion (already React-native) for page transitions, component animations, radar chart morphing. GSAP for the constellation canvas if needed. `prefers-reduced-motion` respected globally. |
| **Scent metadata** | Add custom fields to Medusa products: `note_tags` (array), `collection_tier` (enum), `mood` (enum), `season` (array), `story_behind` (rich text), `scent_profile` (text), `next_step_product_id` (relation). These power the suggestion engine, note-tag connections, and product page content. |
| **Customer accounts** | Medusa's built-in customer API. Purchase history, wishlists (via custom or plugin), and scent personality data stored as customer metadata. Powers the Scent Journey page. |
| **Wishlist** | Not built into Medusa by default — implement as a custom entity/table linked to customer ID, or use a community plugin. Expose via custom API route, consume in Next.js. |
| **Scent Journey page** | `/journey` route. Server component fetches customer orders + wishlist + product metadata from Medusa API. Client component renders the constellation (SVG + Framer Motion or Canvas), radar chart (SVG), and timeline. |
| **Suggestion engine** | Server-side logic in Next.js API routes or Medusa custom endpoints. Takes customer's purchase history + wishlist + product note tags → returns ranked suggestions. P1 = static mapping. P2 = note-matching algorithm. P3 = cohort analysis. |

### Key Dependencies to Install

| Package | Purpose |
|---|---|
| `@medusajs/medusa-js` or `@medusajs/js-sdk` | Medusa storefront SDK (likely already installed from starter) |
| `tailwindcss` | Utility-first CSS framework for the design system |
| `framer-motion` | React animation library — page transitions, radar chart, constellation nodes |
| `next/font` | Font optimization (built into Next.js) |
| `gsap` | Advanced animation — constellation particle effects, timeline scroll animation (if Framer Motion isn't sufficient) |
| `html2canvas` | Client-side image generation for shareable personality cards |
| `react-icons` or custom SVG set | Icon system for trust strip, nav, social links |
| `sharp` | Image processing (Vercel uses this automatically with `next/image`) |

---

## 8. LAUNCH CHECKLIST — MVP STOREFRONT

What must exist at launch vs. what can come later:

### Must-Have (P0)

- [ ] Homepage with hero, journey strip, featured products, trust strip, footer
- [ ] Collection pages for Crowd Pleasers and Intro to Niche (with "Coming Soon" teasers for Strong/Oud and Polarising Art)
- [ ] Product pages with label art hero, scent profile, story behind, add-to-cart, and "Your Next Step"
- [ ] About page with brand story, values, Vizag section, pricing truth
- [ ] Contact/FAQ page with WhatsApp integration
- [ ] Cart + Checkout with COD and UPI/Razorpay
- [ ] Mobile-responsive design (dark theme, sticky CTA)
- [ ] Announcement bar
- [ ] Collection journey navigation in header
- [ ] WhatsApp floating button on all pages
- [ ] Instagram feed embed on homepage

### Post-Launch (P1)

- [ ] Review system (verified purchases only)
- [ ] Bundle builder
- [ ] Scent quiz / beginner guide
- [ ] Post-purchase journey email automation
- [ ] "Behind the Label" content on select product pages

### Growth Phase (P2+)

- [ ] Shelfie UGC gallery
- [ ] Discovery / sample sets
- [ ] Insider community signup
- [ ] Limited-edition drop pages
- [ ] Journal / blog
- [ ] Artist collaboration pages

---

*This document is the complete design blueprint. Every page, component, feature, and design decision traces back to the brand strategy brief. If something on the storefront doesn't connect to a strategic decision documented here or in [brand-strategy.md](brand-strategy.md), question whether it should exist.*
