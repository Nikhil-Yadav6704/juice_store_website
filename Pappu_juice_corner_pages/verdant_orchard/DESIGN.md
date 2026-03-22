# Design System Document: The Orchard Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Organic Atelier"**

This design system rejects the "template" look of health-food apps in favor of a high-end editorial experience. It treats digital space like a premium lifestyle magazine—airy, intentional, and vibrant. We move beyond standard grids by employing **Intentional Asymmetry** and **Tonal Depth**. By layering soft, organic surfaces and utilizing a high-contrast typography scale, we evoke the feeling of a sun-drenched kitchen. This is not just a juice shop; it is a curated wellness destination.

The experience is defined by:
*   **Breathing Room:** Aggressive use of whitespace to let high-quality imagery "pop."
*   **Tactile Layering:** Using color shifts rather than lines to define boundaries.
*   **Visual Fluidity:** Overlapping elements (e.g., a juice bottle image breaking the container of a card) to create a sense of motion and freshness.

---

## 2. Colors & Surface Philosophy

### The Palette
The palette is rooted in botanical vitality. We use `primary` (#0d631b) for brand authority and `secondary` (#8f4e00) to provide appetizing warmth.

*   **Primary (Forest Vitality):** `#0d631b` — Used for key brand moments and deep-toned typography.
*   **Secondary (Citrus Zest):** `#8f4e00` — Reserved for appetite-stimulating accents and CTA highlights.
*   **Surface (Parchment White):** `#f7faf3` — A soft, off-white base that feels more premium and organic than pure hex #ffffff.

### The "No-Line" Rule
**Strict Mandate:** Prohibit the use of 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts.
*   To separate a "Featured Blend" from the main feed, place a `surface-container-low` (#f2f5ee) section against the `surface` (#f7faf3) background.
*   This creates a "soft-edge" layout that feels modern and expensive.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked fine papers. 
*   **Base:** `surface` (#f7faf3)
*   **Content Blocks:** `surface-container` (#ecefe8)
*   **Elevated Cards:** `surface-container-lowest` (#ffffff) to provide a "bright" lift.

### The "Glass & Gradient" Rule
To avoid a flat, "digital" feel, use **Glassmorphism** for floating navigation bars or modal overlays. 
*   **Token:** `surface` at 80% opacity with a `20px` backdrop-blur.
*   **Signature Texture:** For primary CTAs, use a subtle linear gradient from `primary` (#0d631b) to `primary_container` (#2e7d32) at 135 degrees. This mimics the natural variegation found in leafy greens.

---

## 3. Typography: Editorial Authority

We pair the geometric confidence of **Plus Jakarta Sans** with the functional elegance of **Manrope**.

*   **Display (Plus Jakarta Sans):** Used for "Hero" moments. Use `display-lg` (3.5rem) with `-0.02em` letter spacing to create a tight, professional "masthead" look.
*   **Headlines (Plus Jakarta Sans):** Bold and friendly. Use `headline-md` (1.75rem) for product names to ensure they feel appetizing and prominent.
*   **Body (Manrope):** Chosen for its high legibility in nutritional data and descriptions. Use `body-md` (0.875rem) with a generous `1.6` line-height to maintain an airy feel.
*   **Hierarchy Note:** All primary headings must use `on_surface` (#191d19), while secondary descriptions use `on_surface_variant` (#40493d) to create a sophisticated tonal contrast.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**, not shadows. 
*   **Recipe:** Place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#ecefe8) background. The contrast is enough to define the object without adding visual "weight."

### Ambient Shadows
When a floating effect is required (e.g., a "Cart" FAB), use an **Ambient Shadow**:
*   **Color:** `on_surface` (#191d19) at 6% opacity.
*   **Blur:** `24px`.
*   **Offset:** `Y: 8px`.
*   This mimics natural light passing through a glass of juice, rather than a heavy, artificial drop shadow.

### The "Ghost Border" Fallback
If accessibility requires a container definition (e.g., an input field), use a **Ghost Border**:
*   `outline_variant` (#bfcaba) at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons (The "Soft-Pill")
*   **Primary:** Gradient of `primary` to `primary_container`. Radius: `full` (9999px). Label: `label-md` in `on_primary`.
*   **Secondary:** `surface_container_highest` (#e0e3dd) with `on_surface` text. No border.
*   **Interaction:** On hover, a subtle `0.5rem` lift using an Ambient Shadow.

### Cards & Lists (Editorial Blocks)
*   **Rule:** Forbid divider lines. Use `spacing-8` (2.75rem) to separate list items.
*   **Product Cards:** Use `surface-container-lowest` with a `lg` (1rem) rounded corner. The product image should "break out" of the top edge by `-1rem` to create a 3D effect.

### Selection Chips
*   **Selected:** `primary_fixed` (#a3f69c) background with `on_primary_fixed` text.
*   **Unselected:** `surface_container_high` (#e6e9e2).

### Input Fields
*   **Style:** Minimalist. No bottom line. Use a `surface-container-low` (#f2f5ee) fill with `md` (0.75rem) rounded corners.
*   **Focus State:** The "Ghost Border" becomes 100% opaque `primary`.

### Specialized Component: The "Ingredient Float"
A horizontal scrolling strip of high-res fruit PNGs (no backgrounds) that sit behind the text of a section. These should use a parallax scroll effect to create a sense of depth and freshness.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Offset images to the right and text to the left to break the "grid" feel.
*   **Embrace Whitespace:** If you think a section needs more content, it probably needs more `spacing-12` (4rem) instead.
*   **Layer Color:** Use `tertiary_container` (#5d7543) for subtle "Health Benefit" badges—it feels medicinal yet organic.

### Don’t:
*   **Don't use 1px Dividers:** Use background shifts or white space. Dividers make an app look like a utility, not an experience.
*   **Don't use Pure Black:** Always use `on_background` (#191d19) for text to keep the "Forest Green" undertone alive.
*   **Don't Over-round:** Stick to `lg` (1rem) for cards. Going `xl` or beyond makes the system look "childish" rather than "premium."