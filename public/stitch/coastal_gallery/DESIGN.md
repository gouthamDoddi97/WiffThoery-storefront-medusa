# Design System: The Coastal Gallery Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Atmospheric Curator"**

This design system rejects the cluttered, transactional nature of traditional e-commerce in favor of a high-end gallery experience. We are not building a marketplace; we are curated an olfactory exhibition. The aesthetic bridges the gap between the precision of a laboratory and the fluid, organic warmth of a coastal sunset.

To move beyond a "template" look, the system relies on **Intentional Asymmetry**. Large-scale typography (Display-LG) should often be offset from the central axis, and imagery should bleed off the edges of the viewport or overlap container boundaries. We embrace generous whitespace—not as "empty" space, but as "breathing" space that gives the product (the fragrance) the same reverence as an oil painting in a minimalist gallery.

---

## 2. Color & Surface Philosophy

The palette is anchored in the deep, nocturnal navy of the ocean, punctuated by the high-chroma vitality of the coast (Teal, Coral, and Gold).

### The "No-Line" Rule
**Borders are strictly prohibited for sectioning.** We do not use 1px solid lines to separate content. Boundaries must be defined solely through background color shifts. 
*   *Example:* A product description in `surface-container-low` (#171B28) sitting directly on a `surface` (#0F131F) background. The subtle tonal shift provides all the structure the eye requires without the visual "noise" of a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of heavy, matte paper or frosted glass.
*   **Base:** `surface` (#0F131F) for the main canvas.
*   **Depth:** Use `surface-container-lowest` (#0A0E1A) for recessed areas like footers or utility bars.
*   **Elevation:** Use `surface-container-high` (#262A37) or `highest` (#313442) for interactive elements like cards or modals to create a soft, natural lift.

### Glass & Gradient Rule
To achieve a "signature" feel, floating elements (navigation bars, hover states) should utilize **Glassmorphism**.
*   Apply `surface-variant` (#313442) at 60% opacity with a `24px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should not be flat. Use a subtle linear gradient (45°) transitioning from `primary` (#4FDBCC) to `primary-container` (#00B4A6) to give buttons a "lithic" or gemstone-like depth.

---

## 3. Typography
Our typography is a dialogue between the technical (Space Grotesk) and the human (Inter).

*   **Display & Headlines (Space Grotesk 700/600):** These are our "Art Labels." Use `display-lg` (3.5rem) for hero statements. Tighten letter-spacing by `-0.02em` for a more authoritative, editorial feel.
*   **Body (Inter 400/500):** Set in `body-lg` (1rem) or `body-md` (0.875rem). Use `line-height: 1.6` to maintain the "gallery" airiness.
*   **Micro/Labels (Inter 500, ALL CAPS):** These are used for navigation and technical specs. Apply `letter-spacing: 0.08em`. This creates a rhythmic, architectural feel that balances the bold headlines.
*   **The Accent (Space Grotesk 500 Italic):** Use sparingly for pull-quotes or fragrance notes (e.g., *Notes of Sea Salt and Sandalwood*).

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved via **Tonal Layering**. Instead of a shadow, place a `surface-container-low` card on top of a `surface` background. The shift from #0F131F to #171B28 is sufficient for the human eye to perceive hierarchy.

### Ambient Shadows
When an element must "float" (e.g., a perfume bottle image or a floating cart), use a shadow that mimics natural coastal light:
*   **Shadow Color:** #05070D (A darker tint of our Deep Navy).
*   **Settings:** 0px 24px 48px -12px, Opacity: 6%. This creates a "glow of absence" rather than a dirty grey smudge.

### The Ghost Border Fallback
If accessibility requires a border (e.g., an input field), use a **Ghost Border**: `outline-variant` (#3C4947) at 20% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Gradient (Primary to Primary-Container), `0px` border-radius (Sharp edges), `label-md` typography.
*   **Secondary:** Ghost style. No background, `Ghost Border` (20% opacity), `primary` text color.
*   **Tertiary:** Underlined text only, using `secondary` (Coral) to draw the eye to "Add to Cart" or "Discover."

### Cards (The "Gallery Plinth")
*   **No Dividers:** Separate image from text using `spacing.6` (2rem) of whitespace.
*   **Sharp Edges:** All containers must use `0px` roundedness. The sharpness evokes the edge of a glass display case.
*   **Hover:** Shift background from `surface-container` to `surface-container-high`.

### Input Fields
*   **Visual Style:** Bottom-border only (1px, `outline-variant` at 40% opacity). When active, the border transitions to `primary` (#4FDBCC) with a subtle `2px` height.
*   **Error State:** Use `error` (#FFB4AB) for text and the bottom border.

### Signature Component: The "Scent Layer"
A vertical list component used for fragrance notes. Instead of bullets, use a `2px` vertical line using `tertiary` (Sunset Gold) that grows in height as the user scrolls, connecting the Top, Heart, and Base notes.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. If an image is on the left, let the text be slightly lower on the right.
*   **Do** use the `Neutral Mid` (#8A8680) for "meta" information (dates, weights, SKU numbers) to keep the primary focus on the art.
*   **Do** allow images to overlap different colored background sections.

### Don't:
*   **Don't** use standard "Drop Shadows." They look cheap and digital. Use Tonal Layering.
*   **Don't** use rounded corners (`0px` only). We are aiming for architectural precision.
*   **Don't** use icons for everything. Where possible, use high-letter-spaced `label-sm` text (e.g., "SEARCH" instead of a magnifying glass).
*   **Don't** use pure black (#000) or pure white (#FFF). Our "Salt" and "Navy" provide a much more premium, organic contrast.