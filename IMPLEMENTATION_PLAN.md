Vol. 01 · Ed. iii
Design Brief · Handoff
The Whiff Theory
A Journal Direction
Amobile-first editorial e-commerce experience for an Indian extrait-de-parfum house based in Vizag. The design treats the storefront like a print journal: cover, chapters, features, pull quotes, drop caps, plates, and a colophon. Three product tiers (Popular, Unique, IDGF) form the spine; Sets and Scent Personality are the differentiated revenue and retention features.
Reference HTML: Whiff Theory Journal.html (+ journal-lib.jsx, journal-screens.jsx, journal-pdp.jsx, journal-extras.jsx, data.js).

Brand voice
Editorial, dry-witty, never precious. "Made to be worn. Not shelved."
Borrows from print magazines (Kinfolk, Cereal, The Gentlewoman) — but warmer, with Indian weight.
Tone: editorial but product-forward — reduce overt magazine flourishes on store and product screens; prioritize clarity, product imagery, and brand cues.
Section names use roman numerals (Ch. I / II / III) and "Vol. 01 · Ed. iii" markers.
Copy is short. Drop caps are reserved for long editorial features only; avoid using them on product and store pages. Tier and product captions are mono.
Tier names are spoken as words, not categories: "the Popular", "the Unique", "the IDGF".
Visual system
2.1 — Palette
Token	Hex	Use
--paper	#faf7f2	Primary surface (bone)
--paper-2	#f2ede4	Pull-quote bands, alt sections
--paper-deep	#e8dfd0	Subtle deeper paper, edges
--ink	#1a1f1a	Body text, hairlines, primary buttons
--forest	#2d3b2a	IDGF tier surface, constellation plate
--ink-muted	#5a6354	Secondary text
--ink-soft	#7a7a6e	Captions, footnotes
--rose	#d4a5b0	Soft accent (radar fill, founders tape)
--rose-deep	#b07888	Italic display accents, drop caps, Unique tier
--taupe	#a89070	Popular tier accent
--taupe-deep	#7a6852	Tier rules, second portrait tint
Tier accent map
Popular → --taupe (#a89070)
Unique → --rose-deep (#b07888)
IDGF → --forest (#2d3b2a) — used as full surface, not just accent
2.2 — Typography
Display / body serif: Fraunces (Google Fonts), variable, opsz 9–144. Italic 400/500 for display, regular 400 for body. Set font-variation-settings: "opsz" 144 on large display headings, "opsz" 36 on body italics.
UI sans: Nunito Sans 400/600/700.
Mono labels: DM Mono 400/500 — uppercased with letter-spacing: 0.22em–0.24em for kickers, captions, page numbers, and section markers.
Type scale (mobile, 410px frame)
Display XL (cover headlines): 64–96px Fraunces italic
Display L (feature title): 48–80px
Display M (article H1): 32–46px
Display S (callout): 22–28px
Body: 15–17px Fraunces (regular)
Italic body intro: 17–22px Fraunces italic
Mono kicker: 9–10px DM Mono uppercase
Letterpress feel: use subtly on cover and hero only (not on store/product UI). Display headings may use a light two-stop text-shadow for an embossed effect, applied sparingly.

2.3 — Layout primitives
Page width: 410px design, fluid below.
Side gutter: 22px on most sections.
Hairlines: 1px solid --ink separators on every section break — print-rule feel.
Kicker pattern: small mono uppercase label flanked by short rules: [—— LABEL] or [—— LABEL ——] if centered. Implemented as <Kicker>.
Drop caps: optional; reserved for long editorial features (56–72px) and not used on store or PDP pages.
Pull quotes: reserved for editorial features only; avoid on store and product listing screens.
Captions: bottom-of-figure mono row, justified between (e.g. "Fig. 01 · Aphrodite, on linen" / "pg. 12 →").
2.4 — Imagery
Editorial imagery: painterly SVGs are preferred for features and editorial spreads. Store and product pages may use high-quality product photography (or the painterly SVG alternative) — keep the same inset hairline border for consistency.
Each photo frame has a hairline inset border (10px inset, rgba(26,31,26,0.3)) to feel printed.
Founders portraits use duotone SVG silhouettes (paper → forest gradient, hair mass, film-grain SVG filter, washi-tape rectangle in corner).
Vizag landscape is layered SVG (sky gradient → distant hills → sea → sand → tiny boat silhouette + grain filter).
2.5 — Bottle
Single reusable SVG component (<Bottle fragrance size>), sizes xs/sm/md/lg/xl.
Squarer body, painted-paper label, juice tint per fragrance ID, hairline ink stroke. Tier label printed at top of label in mono uppercase.
Information architecture
/                           Cover (home)
/tier/popular               Chapter I  · The Popular
/tier/unique                Chapter II · The Unique
/tier/idgf                  Chapter III · The IDGF      (forest surface)
/sets                       Feature · Sets
/store                      Reference · The Store (store/list)
/details/<frag-id>          Feature · single PDP
/personality                Feature · Scent Personality
/founders                   Essay · Our Story
                            (Menu = slide-in TOC, not its own route)
Globally present: <Masthead> at top, <Colophon> at bottom, <Menu> slide-in (☰ in masthead). Masthead expanded on home (volume marker, "The Whiff Theory" wordmark, dek), collapsed elsewhere with horizontal sub-nav of chapters/features.

Screens
4.1 — Cover (home)
Cover story headline — three-line italic display, last line in --rose-deep. CTA "Begin reading →" (filled ink) + secondary "Sets" (mono, ink underline).
Lead figure — 4:5 painterly photo, mono caption row underneath.
Contents list — five rows: roman numeral · department label · feature title · pg.NN. Tap → tier / sets / store.
Manifesto pull quote — paper-2 band, 50px italic, "Made to be worn. Not shelved."
From the editors — three TierCard rows; left-aligned text + small bottle stack on right.
Founders letter block — duotone portrait left, italic title + 2-sentence preview right, "Read the full story" CTA.
Note on pricing — small editorial sidecar.
4.2 — Tier feature pages
Department banner (mono, top), full-bleed title block (96px italic), italic dek in tier accent, body description, byline ("Words by The Editors · N bottles").
For each fragrance in the tier: numbered article (№ 01), painterly photo (alternating left/right), kicker with families, 48px italic title, italic tagline, body with drop cap, price + read CTA row.
Footer: "Next chapter" with link to next tier.
IDGF tier inverts: surface = --forest, ink = --paper.
4.3 — Sets
Big italic title "Two bottles, one wardrobe."
Per set: numbered, italic display name, italic pull quote on a 2px ink-bordered left rule, composed dual-bottle figure (gradient background per set), drop-cap body, "Included in this set" list (a./b. with mono details), price block (₹current + struck-through original + save) and dual CTAs ("Customize" outline + "Add set →" filled).
Sets alternate --paper / --paper-2 backgrounds.
4.4 — Store (catalog)
Title "Every bottle, on record."
Filter strip (All / Popular / Unique / IDGF), active tab underlined.
Long alphabetical list: bottle thumb · tier mono kicker (in tier color) + italic name + short description · price + ml.
4.5 — Feature (PDP)
Crumb row (← tier name · feature № NN).
Parallax hero — painterly figure with translateY(-scrollY * 0.35) cap at 180px; mono department tag (top-left, paper card) and page number (bottom-right).
Centered title block: kicker (families), 80px italic name, italic tagline (--rose-deep).
Byline / pricing strip.
Body with drop cap.
Pull quote band (32px italic).
The composition — three rows (Top / Heart / Base notes) in a/b/c labelled grid, italic note list.
Character — three mood cards, middle one in --paper-2.
How it wears — Projection / Longevity / Warmth, hairline-divided rows with 5-step segmented bars.
Order block — two size cards (20ml Traveler / 50ml Full bottle, active = ink-filled), quantity stepper, full-width "Add to bag · ₹total" ink button.
Continue reading — next fragrance in tier teaser with bottle thumb.
4.6 — Scent Personality
Issue header (Subscriber feature · Profile №).
Title block: "A profile, in notes."
Plate I · The Constellation — forest-surface SVG; every fragrance is a star at a stable seeded position; owned ones are large with radial-gradient glow + name labels and connected by dashed rose lines; unowned are tiny dots with muted name labels.
Archetype — derived from owned set (signature combos + tier-mix fallback). 68px italic name + generated pull quote in paper-2 band.
Plate II · Note families — radar chart (Citrus / Floral / Woody / Spicy / Smoky / Sweet) computed by keyword-matching note strings to families. Rose fill, rose-deep stroke + dots, mono axis labels.
In your library — 2-col bottle cards.
Recommended next — list rows of unowned fragrances.
Your card — 4:5 forest-on-paper shareable card containing archetype name, quote, mini constellation, footer URL/issue. "Save image" outline + "Share →" filled buttons.
4.7 — Our Story (Founders)
Department strip ("Essay · 8 min read").
Vizag shoreline SVG hero with caption row ("Fig. 00 · Ramakrishna Beach, November · 17.72°N 83.31°E").
Centered title block "From Vizag, with intent."
Byline strip.
Dual duotone portraits — Asha (forest tint, "the nose · ex-IFF, twelve years"), Ravi (taupe tint, "the operator · ex-retail, built four brands").
Three drop-cap body paragraphs.
Pull quote band ("The margins weren't in the bottles. They were in the boxes." — Ravi).
A short chronology — date · sentence rows (2019 → 2026).
Signature block (italic "With affection,", 36px Asha & Ravi script-feel, mono location/date), CTA "Read the Store →".
4.8 — Menu (slide-in)
88%-width left drawer over scrim. Top bar: "Vol. 01 · Ed. iii" + "Close ✕".
"Table of contents" kicker, 50px italic header.
Chapters group — three rows (I/II/III · italic name · →).
Features group — Store, Scent Personality, Our Story (italic name + italic sub-tag).
Subscriber strip (paper-2 card) → Sign in / Account.
Bag CTA (ink button) "Your Bag · 2 items · ₹2,198 →".
Footer "Est. Vizag · MMXXV".
4.9 — Colophon (footer)
Centered wordmark ("The Whiff Theory" 38px italic) + "A Journal of Fragrance" mono.
Manifesto italic centered.
Two columns: Departments / Masthead.
Bottom strip: © MMXXVI · Vizag · India.
Components reference
File	Exports	Purpose
data.js	FRAGRANCES, TIERS, SETS	Catalog data. Each fragrance: id, name, tier, families, notes, tagline, description, short, mood, price20, price50, bottle, accent, new, bestseller.
journal-lib.jsx	Masthead, Colophon, Bottle, Press, Kicker, Rule, PhotoFrame	Shared UI primitives. <Press size italic> is the letterpress display heading; <Kicker align color> is the labelled rule.
journal-screens.jsx	Cover, TierFeature, Sets, Store	Top-level screens. <TierCard> and <SetFeature> are local.
journal-pdp.jsx	Feature	PDP including parallax hero.
journal-extras.jsx	Menu, Personality, Founders, FoundersLetterBlock, Constellation, Radar, DuotonePortrait, VizagHero	Menu + personality + founders + their visual primitives.
App shell
410px phone frame with status bar, mono URL bar, scrollable .app, home indicator.
React mount in #app. Nav state {s: screen, p: param} persisted in localStorage as wt-j-nav.
nav('menu') opens the drawer; everything else replaces screen and resets scroll.
Tweaks dropdown in bottom-right exposes every screen and persists selection through reload.
Rules for extending
No new colors. Pick from the table. If a state really needs a new tone, derive via oklch from an existing token.
No new fonts. Fraunces / Nunito Sans / DM Mono only.
Every section starts with a <Kicker> and ends with a 1px ink hairline. If you skip one, the spread loses its rhythm.
Headlines are italic Fraunces. Roman serifs are fine for body and for short emphatic words ("IDGF.", "Note", years), never for displays.
Drop caps only for long editorial features; avoid on store/PDP screens.
Pull quotes reserved for editorial features; avoid on store and product listing screens.
Imagery is generative SVG with the painterly recipe described in §2.4. Store and PDP pages may use product photography in place of painterly placeholders while keeping the inset hairline border for visual continuity.
Tier color is structural. When a fragrance is shown anywhere outside its native tier, surface its tier with the mono uppercase kicker in the tier color — never re-tint the bottle/photo.
CTAs come in two flavors only:
Primary: ink-filled, --paper text, mono uppercase 10px, 0.24em tracking, weight 700.
Secondary: transparent, mono uppercase 10px, hairline ink underline.
Mobile widths are sacred. Body 15–17px floor, hit targets ≥ 44px.
Open product questions
Authentication state (cart, profile) is mocked — wire to your commerce backend.
Personality archetype currently uses a tiny rules table; productize via signal weights or LLM classifier per user.
"Save image" on the personality card needs an html-to-image export step.
Real photography to replace painterly placeholders on PDP / Sets / Cover.
Vizag shoreline + duotone portraits are placeholders for a documentary photo shoot.
The Whiff Theory
Design Brief · Vol. 01 · Ed. iii · Vizag · MMXXVI