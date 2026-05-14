---
name: MamaLedger
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#41493e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2a6b2c'
  primary: '#00450d'
  on-primary: '#ffffff'
  primary-container: '#1b5e20'
  on-primary-container: '#90d689'
  inverse-primary: '#91d78a'
  secondary: '#835400'
  on-secondary: '#ffffff'
  secondary-container: '#fcab28'
  on-secondary-container: '#694300'
  tertiary: '#6c2200'
  on-tertiary: '#ffffff'
  tertiary-container: '#933100'
  on-tertiary-container: '#ffb498'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acf4a4'
  primary-fixed-dim: '#91d78a'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#0c5216'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#ffb957'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 34px
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  voice-prompt:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  touch-target-min: 56px
  gutter: 16px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style
The design system is built on a foundation of **Empathetic Utility**. It bridges the gap between sophisticated financial technology and the vibrant, fast-paced atmosphere of Nigerian open-air markets. The aesthetic is "Market Modern"—clean and systematic enough to feel secure, yet warm and familiar enough to be approachable for a non-technical user base.

The UI prioritizes high-visibility and "glanceability" for outdoor environments. It draws from **Minimalism** for clarity and **Tactile** design for interaction confidence. Every element is designed to be tapped easily with one hand while balancing a tray or attending to a customer. The emotional goal is to empower users with the feeling that "money matters are simple" through a "voice-first" interface that speaks the user's language.

## Colors
The palette is rooted in the Nigerian landscape and the energy of commerce. 
- **Deep Green (Primary):** Represents growth, stability, and the currency itself. It is used for primary actions and key brand moments.
- **Golden Yellow (Secondary):** Used for highlights, active states, and success indicators. It provides high contrast against the green.
- **Warm Orange (Accent/Alert):** Reserved for urgent information, spending alerts, or pending items.
- **Surface & Background:** A pure white background is used to ensure maximum legibility under bright sunlight, paired with very soft grey surfaces for secondary grouping.

## Typography
Typography is the primary accessibility tool in this design system. We use **Be Vietnam Pro** for headings to provide a friendly, contemporary character. For body text, **Plus Jakarta Sans** offers soft, rounded letterforms that are highly legible at larger scales.

Sizes are intentionally oversized to accommodate users with varying literacy levels or visual impairments. Body text never drops below 18px. Labels and captions are bolded to ensure they remain legible even on lower-quality mobile displays common in the target market.

## Layout & Spacing
The layout follows a **Fluid Grid** model with generous safe areas. 
- **Touch Targets:** A strict minimum height of 56px is enforced for all interactive elements to account for "fat-finger" errors in busy environments.
- **Margins:** 20px side margins on mobile to prevent accidental edge-taps while holding the phone.
- **Vertical Rhythm:** A heavy 8px-based system. We use "Stack" spacing to group related information tightly (12px) while separating distinct tasks with significant breathing room (40px) to prevent cognitive overload.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and **Tonal Layering**. 
- **Level 0 (Background):** Pure white (#FFFFFF) for the main canvas.
- **Level 1 (Cards):** Soft, low-blur shadows (e.g., 0px 4px 12px rgba(0,0,0,0.05)) are used to lift white cards off the white background, creating a subtle physical presence without distracting borders.
- **Level 2 (Active/Floating):** The "Voice Input" button uses a more pronounced shadow and a slight glow to indicate it is the most important element on the screen.
Depth is never used for purely decorative purposes; it always signifies interactable containers.

## Shapes
The shape language is extremely soft and welcoming. 
- **Standard Radius:** 16px (1rem) for input fields and small cards.
- **Large Radius:** 24px (1.5rem) for main dashboard cards and containers.
- **Pill Shapes:** Used exclusively for buttons and status chips to distinguish them from informational cards.
These rounded corners reflect the "Mama" brand personality—nurturing, safe, and modern.

## Components
- **The "Speak" Button:** A large, circular floating action button (FAB) at the bottom center. It features a microphone icon and a pulse animation when active. 
- **Transaction Cards:** High-contrast cards with large currency symbols. Green text for "In" (Money enter) and Orange text for "Out" (Money go).
- **Icon-Heavy Navigation:** Bottom navigation uses 32px icons with clear Pidgin English labels (e.g., "Home", "Book", "Customer", "Help").
- **Voice-First Input:** Instead of traditional forms, inputs use "suggestive chips" that the user can tap if they don't want to speak the amount or category.
- **Checkboxes & Radio Buttons:** Oversized (min 32px) with thick strokes and bright secondary color fills when selected.
- **Status Chips:** Large, pill-shaped tags with high-contrast backgrounds to indicate "Paid" or "Credit" status.