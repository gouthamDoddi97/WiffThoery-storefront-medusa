# Whiff Theory Storefront — Coastal Gallery Implementation Plan

> Design reference: `/public/stitch/coastal_gallery/DESIGN.md` + 13 screen mockups in `/public/stitch/`
> Brand reference: `Brand-identity.md`

---

## Design System Quick Reference

| Token | Value | Usage |
|---|---|---|
| `surface-lowest` | `#0A0E1A` | Page background, deepest layer |
| `surface` | `#0F131F` | Default surface |
| `surface-container-low` | `#171B28` | Cards, sections |
| `surface-container` | `#1D2130` | Elevated cards |
| `surface-container-high` | `#262A37` | Hover states |
| `surface-variant` | `#313442` | Nav glassmorphism base |
| `primary` | `#4FDBCC` | Teal — text, icons, accents |
| `primary-container` | `#00B4A6` | Teal — gradient endpoint |
| `secondary` | `#FF6B5A` | Coral accent |
| `tertiary` | `#FFB547` | Gold/Sunset — tier 2 accent |
| `on-surface` | `#E8EAF0` | Body text |
| `on-surface-variant` | `#8B8FA8` | Muted text, labels |

**Typography**
- Display / Headings: `Space Grotesk`, weight 700/600, tracking `-0.02em`
- Body / UI: `Inter`, weight 400/500

**Rules**
- `border-radius: 0px` on ALL elements — no rounding anywhere
- No border lines for section separation — use background color shifts only
- Nav: `background: rgba(49, 52, 66, 0.6)`, `backdrop-filter: blur(24px)`
- Gradient CTAs: `background: linear-gradient(45deg, #4FDBCC, #00B4A6)`
- Inputs: bottom border only (`border-bottom: 1px solid #313442`)
- Ambient shadows: `box-shadow: 0px 24px 48px -12px rgba(5,7,13,0.06)`

---

## PHASE 1 — Foundation (Do this first — everything depends on it)

### Task 1.1 — Tailwind Config Overhaul
**File**: `tailwind.config.js`

Replace the current grey palette and Medusa preset with the Coastal Gallery color system.

**Exact changes:**
- Remove `medusaui` preset reference
- Replace `colors.grey` with full surface hierarchy:
  ```js
  colors: {
    surface: {
      lowest:   '#0A0E1A',
      DEFAULT:  '#0F131F',
      low:      '#171B28',
      container:'#1D2130',
      high:     '#262A37',
      variant:  '#313442',
    },
    primary: {
      DEFAULT: '#4FDBCC',
      container: '#00B4A6',
    },
    secondary: '#FF6B5A',
    tertiary: '#FFB547',
    'on-surface': '#E8EAF0',
    'on-surface-variant': '#8B8FA8',
    'on-surface-disabled': '#4A4E63',
  }
  ```
- Set `fontFamily`:
  ```js
  fontFamily: {
    grotesk: ['Space Grotesk', 'sans-serif'],
    inter: ['Inter', 'sans-serif'],
    sans: ['Inter', 'sans-serif'],
  }
  ```
- Set `borderRadius` to all `0px`:
  ```js
  borderRadius: {
    none: '0px',
    DEFAULT: '0px',
    sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px',
  }
  ```
- Add custom `boxShadow`:
  ```js
  boxShadow: {
    ambient: '0px 24px 48px -12px rgba(5,7,13,0.06)',
    card: '0px 8px 24px -4px rgba(5,7,13,0.12)',
    'card-hover': '0px 16px 40px -8px rgba(5,7,13,0.20)',
  }
  ```
- Add `backgroundImage` for gradient CTA:
  ```js
  backgroundImage: {
    'gradient-cta': 'linear-gradient(45deg, #4FDBCC, #00B4A6)',
    'gradient-cta-hover': 'linear-gradient(45deg, #00B4A6, #4FDBCC)',
  }
  ```

---

### Task 1.2 — Font Setup
**File**: `src/app/layout.tsx`

Add Space Grotesk and Inter via `next/font/google`:
```tsx
import { Space_Grotesk, Inter } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})
```
Apply both `variable` classes to the `<html>` tag.

---

### Task 1.3 — Global CSS Overhaul
**File**: `src/styles/globals.css`

Replace or extend with:
```css
:root {
  --surface-lowest: #0A0E1A;
  --surface: #0F131F;
  --surface-low: #171B28;
  --surface-container: #1D2130;
  --surface-high: #262A37;
  --surface-variant: #313442;
  --primary: #4FDBCC;
  --primary-container: #00B4A6;
  --secondary: #FF6B5A;
  --tertiary: #FFB547;
  --on-surface: #E8EAF0;
  --on-surface-variant: #8B8FA8;
}

html {
  background-color: var(--surface-lowest);
  color: var(--on-surface);
  font-family: 'Inter', sans-serif;
}

* {
  border-radius: 0 !important;
}
```
Remove any existing light-theme default variables.

---

### Task 1.4 — Base UI Components
**Directory**: `src/modules/common/components/`

Create/update these shared primitives:

**`ui/button.tsx`**
- Variant `primary`: `bg-gradient-cta text-surface-lowest font-grotesk font-semibold tracking-widest uppercase px-8 py-4`
- Variant `ghost`: `border border-primary text-primary bg-transparent hover:bg-primary/10`
- Variant `text`: `text-primary underline underline-offset-4 bg-transparent`
- All: `rounded-none` (0px radius), `transition-all duration-300`

**`ui/input.tsx`**
- Style: `bg-transparent border-0 border-b border-surface-variant text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none pb-2 w-full`
- Label floats above on focus (animated with CSS transition)

**`ui/card.tsx`**
- Wrapper: `bg-surface-low shadow-ambient transition-all duration-300 hover:bg-surface-high hover:shadow-card-hover`
- 0px radius always

---

## PHASE 2 — Layout Shell

### Task 2.1 — Navigation Component
**File**: `src/modules/layout/components/nav/`

Mockup: `/public/stitch/whiff_theory_home_v3/screen.png` (top bar)

**Structural changes:**
- Background: `bg-surface-variant/60 backdrop-blur-[24px]` (glassmorphism)
- Left: "WHIFF THEORY" wordmark — `font-grotesk font-bold text-on-surface tracking-[0.15em] uppercase`
- Center nav links: `CROWD PLEASERS` / `INTRO TO NICHE` / `POLARIZING ART` / `ARCHIVE` — `font-inter font-medium text-on-surface-variant text-sm tracking-widest hover:text-primary transition-colors`
- Right: Search icon + Wishlist heart icon + Cart bag icon — all in `text-primary`
- Active collection link: `text-primary`
- On scroll: nav gains `border-b border-surface-variant` for subtle separation
- Mobile: hamburger menu, full-screen dark overlay, same links stacked

**Remove**: Country selector from prominent position (tuck into footer/account)

---

### Task 2.2 — Footer Component
**File**: `src/modules/layout/components/footer/`

Mockup: bottom of `/public/stitch/whiff_theory_home_v3/screen.png`

**Structure (4-column grid on desktop, stacked on mobile):**

Column 1 — Brand:
- "WHIFF THEORY" wordmark
- Tagline: "CRAFTED IN VIZAG. FOR THE WORLD."
- Newsletter email input (bottom-border only style) + "→" submit icon

Column 2 — Collections:
- Heading: "THE LADDER" (font-grotesk, uppercase, text-on-surface-variant)
- Links: Crowd Pleasers / Intro to Niche / Polarizing Art / Archive

Column 3 — Company:
- Heading: "COMPANY"
- Links: Our Story / Scent Journal / Contact

Column 4 — Trust:
- Heading: "TRANSPARENCY"
- Links: Pricing Philosophy / Ingredient Sourcing / Returns

Bottom bar:
- `© 2024 Whiff Theory. Independent. Always.`
- Social icons (Instagram, Twitter/X)

---

## PHASE 3 — Home Page

**File**: `src/modules/home/components/` + `src/app/[countryCode]/(main)/page.tsx`
**Mockup**: `/public/stitch/whiff_theory_home_v3/screen.png`

### Task 3.1 — Hero Section
**Component**: `home/components/hero/index.tsx`

- Full viewport height (`min-h-screen`)
- Background: `bg-surface-lowest` with subtle radial gradient overlay (teal glow, low opacity)
- Left column (60% width):
  - Eyebrow text: `"COASTAL GALLERY COLLECTION"` — `text-primary font-inter text-sm tracking-[0.2em] uppercase`
  - Headline: `"Your first real scent. The end of ordinary."` — `font-grotesk font-bold text-5xl lg:text-7xl text-on-surface leading-[0.95] tracking-[-0.02em]`
  - Subtext: `"Three tiers. One journey. No compromises."` — `text-on-surface-variant text-lg font-inter`
  - CTA button: "START YOUR JOURNEY" (primary gradient variant)
  - Secondary link: "EXPLORE COLLECTION →" (text variant, underlined)
- Right column (40% width):
  - Product bottle image (large, no background)
  - Floating stats cards: "47 FRAGRANCES" / "3 TIERS" / "EXTRAIT QUALITY"
- Background: subtle animated particles or static grain texture (CSS)

---

### Task 3.2 — "Olfactory Evolution" Tier Cards Section
**Component**: `home/components/tier-cards/index.tsx`

Three cards in a horizontal grid:
- Card 1: **Crowd Pleasers** — Tier 01, "Your entry point. Instantly loved." teal accent, →
- Card 2: **Intro to Niche** — Tier 02, "For the curious nose." gold/amber accent, →
- Card 3: **Polarizing Art** — Tier 03, "Not for everyone. Maybe for you." coral accent, →
- Each card: `bg-surface-low` with hover `bg-surface-container`, left accent border (4px, color-coded per tier), tier number label `text-on-surface-variant text-xs tracking-widest`
- Each links to its respective collection page

---

### Task 3.3 — "Art Objects" Featured Products Rail
**Component**: `home/components/featured-products/index.tsx`

- Section heading: "ART OBJECTS" — font-grotesk, plus sub-label "CURRENTLY FEATURED"
- Horizontal scroll rail (or 3-4 column grid)
- Each product card:
  - `bg-surface-container` background
  - Product image (full-bleed top)
  - Collection tier badge (e.g. `TIER 01`) in `text-primary text-xs`
  - Product name: `font-grotesk font-semibold text-on-surface`
  - Price: `text-primary font-inter`
  - "VIEW" link: text variant
- Fetch via Medusa `listProducts` API with featured tag or specific collection IDs

---

### Task 3.4 — Brand Values Trio
**Component**: `home/components/brand-values/index.tsx`

Three equal columns, dark background (`bg-surface-low`):
1. Icon + "ART YOU WEAR" + sub-copy: "Every bottle is a graphic art object designed in Vizag."
2. Icon + "SCENT THAT SPEAKS" + sub-copy: "Extrait concentration. No watered-down compromises."
3. Icon + "JOURNEY NOT CATALOG" + sub-copy: "Three tiers that evolve with your nose."

Each icon: simple SVG line art, `text-primary`

---

### Task 3.5 — UGC Gallery Section
**Component**: `home/components/ugc-gallery/index.tsx`

- Section heading: `"WHERE DOES YOUR WHIFF THEORY LIVE?"` — font-grotesk uppercase
- Sub-label: `"#WHIFFTHEORY"` in teal
- 4-column image grid (static images from `/public/` or placeholder)
- Each image: `aspect-square overflow-hidden` — hover dim overlay with Instagram icon
- Below grid: "SHARE YOUR COLLECTION" → links to Instagram

---

## PHASE 4 — Product Page

**File**: `src/modules/products/templates/` + component files
**Mockup**: `/public/stitch/petalina_product_page_v3/screen.png`

### Task 4.1 — Hero Section (Product)
**Component**: `products/components/product-hero/`

- Full viewport height, two-column split
- Left (50%): Full-bleed product image, `object-cover`
- Right (50%): `bg-surface-low` panel
  - Breadcrumb: `CROWD PLEASERS / PETALINA` — `text-on-surface-variant text-xs tracking-widest`
  - Collection badge: `TIER 01 — CROWD PLEASERS` — pill with teal border
  - Product name: `font-grotesk font-bold text-5xl text-on-surface`
  - Scent tagline: `"Feminine. Powdery. Universally Adored."` — `text-on-surface-variant font-inter italic`
  - Price: `₹[price]` — `text-primary font-grotesk text-2xl`
  - Size selector: toggle buttons (10ml / 30ml / 50ml), active = `bg-primary text-surface-lowest`
  - "ADD TO CART" gradient CTA (full width)
  - Trust line: `"Genuine Extrait. Graphic Art Packaging. Transparent Pricing."`

---

### Task 4.2 — "The Impression" Section
**Component**: `products/components/product-impression/`

- `bg-surface-low` full-width section
- Left: large decorative quote mark (teal, font-grotesk, very large)
- Scent story paragraph (pulled from `perfume-details.scentStory` field via API)
- Italic, `text-on-surface font-inter text-xl leading-relaxed`
- Right: secondary product image or label art close-up

---

### Task 4.3 — Founder Quote Block
**Component**: `products/components/founder-quote/`

- Dark `bg-surface-container` strip
- Centered italic quote: `"This isn't a fragrance. It's a first impression."` — font-grotesk, large
- Attribution: `"— Founder, Whiff Theory"` — text-on-surface-variant

---

### Task 4.4 — "Olfactory Blueprint" Accordion
**Component**: `products/components/olfactory-blueprint/`

Section heading: "OLFACTORY BLUEPRINT" — font-grotesk uppercase

Three accordion panels (expand/collapse, no animation jank):
1. **TOP NOTES** — note names as teal tags, opens duration/first impression note
2. **MIDDLE NOTES** — heart notes, character description
3. **BASE NOTES** — longevity notes, drydown description

Two stat rows below accordion:
- `SILLAGE: [Heavy / Moderate / Soft]` — filled progress bar in teal
- `LONGEVITY: [12+ hrs]` — same bar treatment
- `BEST FOR: [Evening / Date Night / Office]` — tag chips

Application tips panel (collapsible): `"SKIN PREP" / "PULSE POINTS" / "LAYERING"`

All data sourced from `perfume-details` API (`/store/products/:id/perfume-details`).

---

### Task 4.5 — "Art You Wear" Label Story Section
**Component**: `products/components/label-story/`

- Two-column: image of bottle/label art (left) + text (right)
- Heading: `"ART YOU WEAR. SCENT THAT SPEAKS."` — font-grotesk
- Body: copy about the label design philosophy
- `bg-surface-lowest` background (deepest surface, creates visual anchor)

---

### Task 4.6 — "Your Next Step" Journey CTA
**Component**: `products/components/next-step/`

- `bg-surface-low` strip
- Heading: `"READY TO GO DEEPER?"` or `"GRADUATE TO A SCENE STEALER"`
- Shows the next tier up in the journey (e.g., if on Crowd Pleasers product → shows Intro to Niche)
- Horizontal card: tier name + description + "EXPLORE [TIER NAME] →" link
- Teal accent border on the left of the card

---

## PHASE 5 — Collection Pages (3 Templates)

**Files**: `src/modules/collections/templates/`
**Mockups**: 3 separate stitch folders

### Task 5.1 — Crowd Pleasers Collection Template
**Mockup**: `/public/stitch/crowd_pleasers_collection_page_v3/screen.png`

**Header area:**
- Full-bleed hero image (from `collection-background` API)
- Overlay: `bg-surface-lowest/70`
- Tier badge: `TIER 01 / 03` — `text-primary font-inter text-sm tracking-widest`
- Collection name: `"CROWD PLEASERS"` — `font-grotesk font-bold text-6xl text-on-surface`
- Tagline: `"Your entry point. Instantly loved."` — italic, on-surface-variant
- Intro paragraph: brand copy about this tier

**Product grid:**
- 3-column grid (desktop), 2-col (tablet), 1-col (mobile)
- Each card: `bg-surface-container`, product image top, name, pocket descriptor of scent (1 line), price, `"ADD TO COLLECTION"` gradient CTA button

**Tier progression CTA at bottom:**
- `bg-surface-low` banner
- Copy: `"Ready for More? Explore Intro to Niche →"`
- Secondary text: `"Your nose is ready for the next level."`

---

### Task 5.2 — Intro to Niche Collection Template
**Mockup**: `/public/stitch/intro_to_niche_collection_page_v3/screen.png`

**Header area:**
- Golden/amber swirl texture background (static image from `/public/`)
- `TIER 02 / 03` badge in gold (`text-tertiary`)
- Heading: `"INTRO TO NICHE"` — font-grotesk
- Journey progress stepper: `● ● ○` dots — Crowd Pleasers (filled) → Intro to Niche (active, teal) → Polarizing Art (empty)

**Product layout:**
- Asymmetric alternating layout: first product image-left/text-right, second product text-left/image-right
- Each product entry: large image, product name (display-md), scent character (1–2 lines), "shop now" text link

**Pull quote between products:**
- Italic pull quote from a fictional customer: `"I didn't know fragrance could feel like this."`

**Bottom CTA:**
- `"EXPLORE POLARIZING ART →"` — gradient button
- Explanatory copy: `"Some scents are made for the few."`

---

### Task 5.3 — Polarizing Art Collection Template
**Mockup**: `/public/stitch/polarizing_art_collection_page/screen.png`

**Header area:**
- Very dark, dramatic full-bleed image
- Breadcrumb at top-left: `HOME / POLARIZING ART`
- `TIER 03 / 03` badge in coral (`text-secondary`)
- Heading: `"POLARIZING ART"` — font-grotesk, very large
- Tagline: `"Not for everyone. Definitely for you."`

**Product layout:**
- 2-product asymmetric layout (not a grid — more like editorial)
- Each product: large image + name + horizontal "note bars" — gold lines representing top/mid/base intensity
- `"COLLECT IT"` CTA button

**"The Curator's Note" section:**
- Dark `bg-surface-container` pull-out block
- Founder voice: explains the philosophy of this tier
- `"THE COLLECTION"` label + italic body copy

---

## PHASE 6 — About / Our Story Page

**File**: `src/app/[countryCode]/(main)/about/page.tsx` (create this file)
**Mockup**: `/public/stitch/our_story_about_whiff_theory/screen.png`

### Task 6.1 — Route Setup
Create `src/app/[countryCode]/(main)/about/page.tsx` with metadata:
```tsx
export const metadata = { title: 'Our Story | Whiff Theory' }
```

### Task 6.2 — Origin Hero Section
- Full-width, two-column
- Left: "FROM YOUR FIRST REAL SCENT TO THE ONE THAT STOPS A ROOM" — large display text, font-grotesk
- Right: atmospheric image (bay/coastal/studio)
- Eyebrow: `"OUR STORY"` in teal

### Task 6.3 — "The Independent Path" Narrative
- Left column: 3–4 paragraph brand origin story (from Brand Identity doc)
- Right column: founder photo or studio image
- Copy touchpoints: Vizag origin, no mainstream compromise, extrait decision

### Task 6.4 — "What We Believe" Values Cards
Four cards in a 2×2 grid:
1. `"QUALITY OVER QUANTITY"` — fewer, better fragrances
2. `"TRANSPARENT PRICING"` — no inflated margins, honest costs
3. `"THE LADDER MATTERS"` — curated journey, not catalog
4. `"CRAFT OVER CELEBRITY"` — no paid influencer marketing

Each card: `bg-surface-low`, teal icon top, heading, 2-line description

### Task 6.5 — Vizag Section
- Full-width `bg-surface-container` section
- Heading: `"CRAFTED IN VIZAG, FOR THE WORLD"`
- Map or Bay of Bengal abstract image
- Copy: brand connection to Vizag, independent spirit

### Task 6.6 — "The Pricing Truth" Manifesto
- `bg-surface-lowest` section with coral (`text-secondary`) accent
- Heading: `"THE PRICING TRUTH"` — font-grotesk
- Body: price transparency manifesto from Brand Identity doc — cost breakdown, markup philosophy
- Visual: simple table showing cost structure

### Task 6.7 — Journey CTA
- `"Ready to find your signature?"` — font-grotesk display
- Two CTAs: `"START WITH CROWD PLEASERS"` (gradient) + `"TAKE THE SCENT QUIZ"` (ghost)

---

## PHASE 7 — Cart & Checkout Rework

### Task 7.1 — Cart Page Rework
**File**: `src/modules/cart/templates/`
**Mockup**: `/public/stitch/cart_whiff_theory/screen.png`

**Header**: `"YOUR COLLECTION"` — font-grotesk + `"[X] FRAGMENTS"` count

**Line items:**
- `bg-surface-low` row per item
- Left: product image (small)
- Center: product name, collection tier badge, 1-line scent note preview (pulled from perfume-details)
- Right: quantity stepper + price + remove icon
- No outer border — tonal background only

**"Complete the Set" Upsell Widget:**
- `bg-surface-container` block below items
- Heading: `"COMPLETE THE SET"`
- 2–3 recommended products based on current cart items
- Small cards with "ADD" quick-add button

**Order Summary (right panel):**
- `bg-surface-low`
- Line items: Subtotal / Shipping / Total
- `"CHECKOUT"` gradient CTA (full width)

**Trust badge strip above CTA:**
- `"GENUINE EXTRAIT"` / `"GRAPHIC-ART PACKAGING"` / `"TRANSPARENT PRICING"` — with icons, small text

---

### Task 7.2 — Checkout Rework
**File**: `src/modules/checkout/`
**Mockup**: `/public/stitch/checkout_whiff_theory/screen.png`

**Page header**: `"FINALIZING THE ESSENCE"` — font-grotesk italic

**Left column (2/3 width) — Steps:**

Step `01 SHIPPING DETAILS`:
- All inputs: bottom-border only style (no box border)
- Fields: Full Name / Email / Phone / Address / City / PIN Code / State
- Country preset to India

Step `02 PAYMENT`:
- Payment method tabs (pill buttons, not a dropdown):
  - `CARD` | `UPI` | `GPAY` | `COD`
  - Active tab: `bg-primary text-surface-lowest`
- Card fields only show when CARD is selected (conditional render)
- UPI: single text input for UPI ID
- GPay: "Pay with Google Pay" button (redirect to GPay flow)
- COD: confirmation note

**Right column (1/3 width) — `"CURATION SUMMARY"`:**
- `bg-surface-container` panel
- Heading: `"CURATION SUMMARY"` (not "Order Summary")
- Item thumbnails + names
- Pricing rows
- `"COMPLETE CURATION"` final CTA

---

## PHASE 8 — Auth Pages Rework

### Task 8.1 — Login Page Rework
**File**: `src/modules/account/components/login/`
**Mockup**: `/public/stitch/login_whiff_theory/screen.png`

**Layout**: Full-screen split — left panel (50%) and right panel (50%)

**Left panel** (`bg-surface-lowest`):
- Large atmospheric product image
- "WHIFF THEORY" wordmark overlay
- Brand tagline

**Right panel** (`bg-surface-low`):
- Heading: `"WELCOME BACK."` — font-grotesk bold, large
- Sub-heading: `"Your collection awaits."` — italic, on-surface-variant
- Email field + Password field: bottom-border-only inputs
- `"ENTER THE GALLERY"` gradient CTA button
- Forgot password link: text variant, teal
- Divider (tonal, no line — just spacing)
- `"New here? JOIN THE JOURNEY"` — links to register

---

### Task 8.2 — Register Page Rework
**File**: `src/modules/account/components/register/`
**Mockup**: `/public/stitch/register_whiff_theory/screen.png`

**Layout**: Full-screen with cosmic/bubble background image (abstract dark orbs/bubbles)

**Glassmorphism form card** (centered, max-width 480px):
- `bg-surface-variant/60 backdrop-blur-[24px] border border-surface-variant`
- Heading: `"YOUR JOURNEY STARTS WITH YOUR FIRST REAL SCENT"` — font-grotesk, centered
- Fields: First Name / Last Name / Email / Password — bottom-border-only inputs
- `"START YOUR JOURNEY"` gradient CTA (full width)
- Already have account: `"ENTER THE GALLERY →"` — text link

---

## PHASE 9 — New Feature Pages

### Task 9.1 — Wishlist Page
**File**: `src/app/[countryCode]/(main)/wishlist/page.tsx` (create)
**Mockup**: `/public/stitch/wishlist_whiff_theory/screen.png`

**Backend requirement**: Wishlist must be stored — options:
- Option A: Use Medusa Customer metadata / custom wishlist entity
- Option B: LocalStorage for guest wishlist, sync on login

**Page structure:**
- Header: `"ON YOUR RADAR"` — font-grotesk display
- Sub-header: `"[X] SCENTS UNDER CONSIDERATION"` — on-surface-variant
- Product masonry grid / 3-column grid
- Each item card: `bg-surface-low`, product image, name, tier badge, price, `"ADD TO CART"` gradient CTA, remove icon (trash or ✕)
- Empty state: `"Your radar is clear. Time to explore."` + "EXPLORE COLLECTION" CTA

**Wishlist heart icon in nav** (Task 2.1 prerequisite) needs to be wired to this page.

---

### Task 9.2 — Scent Journey Dashboard
**File**: `src/app/[countryCode]/(main)/journey/page.tsx` (create)
**Mockup**: `/public/stitch/my_scent_journey_dashboard_v3/screen.png`

**Backend requirements**: Reads from order history. Requires authenticated user.

**Sections:**

**A. Constellation Map (hero section)**
- SVG/Canvas component: dark background, purchased scents as glowing dots connected by lines
- Each dot: product name on hover, collection tier determines color (teal/gold/coral)
- `"YOUR SCENT CONSTELLATION"` heading

**B. Persona Card**
- `bg-surface-container` card
- Derived persona (e.g., "THE NIGHT OWL") based on purchase patterns
- Short persona description
- `"WHAT THIS MEANS"` expandable section

**C. Scent DNA Radar Chart**
- SVG radar chart — 5 axes: Floral / Woody / Fresh / Oriental / Gourmand
- Filled polygon based on notes of purchased products
- `"YOUR OLFACTORY FINGERPRINT"` heading

**D. Timeline of Discovery**
- Vertical timeline: each purchase as a milestone
- Date + product name + collection tier marker
- `"YOUR FIRST SCENT"` marked specially at bottom

**E. Tier Recommendations**
- Based on current tier presence in purchases
- `bg-surface-low` cards: `"YOUR NEXT FRONTIER"` heading
- 2–3 product recommendations linking to product pages

---

## Implementation Order (Priority)

```
Week 1: Phase 1 + Phase 2 (Foundation + Layout shell)
Week 2: Phase 3 (Home page) + Phase 4 (Product page)
Week 3: Phase 5 (Collection pages — all 3 templates)
Week 4: Phase 6 (About page) + Phase 7 (Cart/Checkout)
Week 5: Phase 8 (Auth pages) + Phase 9.1 (Wishlist)
Week 6: Phase 9.2 (Journey Dashboard — hardest, needs D3/SVG work)
```

---

## File Checklist

### New files to create
- `src/app/[countryCode]/(main)/about/page.tsx`
- `src/app/[countryCode]/(main)/wishlist/page.tsx`
- `src/app/[countryCode]/(main)/journey/page.tsx`
- `src/modules/common/components/ui/button.tsx`
- `src/modules/common/components/ui/input.tsx`
- `src/modules/common/components/ui/card.tsx`
- `src/modules/home/components/hero/index.tsx`
- `src/modules/home/components/tier-cards/index.tsx`
- `src/modules/home/components/brand-values/index.tsx`
- `src/modules/home/components/ugc-gallery/index.tsx`
- `src/modules/products/components/product-impression/index.tsx`
- `src/modules/products/components/founder-quote/index.tsx`
- `src/modules/products/components/olfactory-blueprint/index.tsx`
- `src/modules/products/components/label-story/index.tsx`
- `src/modules/products/components/next-step/index.tsx`
- `src/modules/collections/templates/crowd-pleasers.tsx`
- `src/modules/collections/templates/intro-to-niche.tsx`
- `src/modules/collections/templates/polarizing-art.tsx`

### Existing files to overhaul
- `tailwind.config.js`
- `src/styles/globals.css`
- `src/app/layout.tsx`
- `src/modules/layout/components/nav/` (all files)
- `src/modules/layout/components/footer/` (all files)
- `src/modules/home/templates/index.tsx`
- `src/modules/home/components/featured-products/`
- `src/modules/products/templates/index.tsx`
- `src/modules/products/components/product-actions/`
- `src/modules/collections/templates/index.tsx`
- `src/modules/cart/templates/index.tsx`
- `src/modules/checkout/templates/index.tsx`
- `src/modules/account/components/login/`
- `src/modules/account/components/register/`

---

## Key Reference Paths

| Resource | Path |
|---|---|
| Design system spec | `/public/stitch/coastal_gallery/DESIGN.md` |
| Home mockup | `/public/stitch/whiff_theory_home_v3/screen.png` |
| Product mockup | `/public/stitch/petalina_product_page_v3/screen.png` |
| Crowd Pleasers mockup | `/public/stitch/crowd_pleasers_collection_page_v3/screen.png` |
| Intro to Niche mockup | `/public/stitch/intro_to_niche_collection_page_v3/screen.png` |
| Polarizing Art mockup | `/public/stitch/polarizing_art_collection_page/screen.png` |
| About mockup | `/public/stitch/our_story_about_whiff_theory/screen.png` |
| Cart mockup | `/public/stitch/cart_whiff_theory/screen.png` |
| Checkout mockup | `/public/stitch/checkout_whiff_theory/screen.png` |
| Login mockup | `/public/stitch/login_whiff_theory/screen.png` |
| Register mockup | `/public/stitch/register_whiff_theory/screen.png` |
| Journey mockup | `/public/stitch/my_scent_journey_dashboard_v3/screen.png` |
| Wishlist mockup | `/public/stitch/wishlist_whiff_theory/screen.png` |
| Brand identity | `Brand-identity.md` |
| Perfume details API | `/store/products/:id/perfume-details` (Medusa custom module) |
| Collection background API | `/store/collection-backgrounds` (Medusa custom module) |
