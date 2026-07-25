# BGS Jewellery — Brand Guidelines

## Identity

**Brand name:** BGS Jewellery  
**Origin:** Dubai Gold Souk  
**Pillars:** Craftsmanship · Heritage · Gold  
**Promise:** Zero making charges on 22K gold — meticulous craftsmanship — full transparency  

### Brand voice
- Quiet, confident, unhurried — never loud or salesy
- Warm but precise; poetic in long-form, spare in UI
- First-person plural ("we", "our") — family business, not corporate
- Signature phrases: "Gold is not merely a metal — it is a language." / "— The BGS Family, Dubai"

---

## Colour palette

### Primary
| Role | Hex | Usage |
|---|---|---|
| Antique Gold | `#d4af37` | Primary accent — CTA backgrounds, active states, headings, hover targets |
| Deep Gold | `#c89018` | Gold pressed/active states |
| Muted Gold | `#9f8a48` | Secondary labels, source lines, footer text |

### Gold scale (gradients / shimmer)
| Name | Hex |
|---|---|
| Gold Light | `#f5e090` |
| Gold Mid-Light | `#f0d060` |
| Gold Mid | `#e8c050` |
| Gold Deep | `#9a7010` |
| Gold Darkest | `#7a5808` |

### Backgrounds
| Role | Value | Usage |
|---|---|---|
| Page base | `#080808` | Root background |
| Surface warm | `#110e06` | Gradient midpoint — gives warmth |
| Panel | `#0a0a0a` | Cards, modals, drawers |
| Panel alt | `#060606` | Dropdown, secondary panels |
| Elevated | `#0e0e0e` | Input fields |
| Warm gradient | `linear-gradient(135deg, #080808 0%, #110e06 50%, #080808 100%)` | Sidebar, gold ticker |

### Text
| Role | Value |
|---|---|
| Primary | `#ffffff` |
| Secondary | `rgba(255,255,255,0.65)` |
| Tertiary | `rgba(255,255,255,0.45)` |
| Disabled / faint | `#888` / `#666` / `#555` / `#444` |
| Gold label | `rgba(212,175,55,0.85)` |
| Gold sub-label | `rgba(212,175,55,0.45)` |

### Borders
| Role | Value |
|---|---|
| Standard gold hairline | `1px solid rgba(212,175,55,0.28)` |
| Subtle gold hairline | `1px solid rgba(212,175,55,0.18)` |
| Ultra-subtle gold | `1px solid rgba(212,175,55,0.12)` |
| Surface divider | `1px solid rgba(255,255,255,0.04)` |

### Semantic
| Role | Hex |
|---|---|
| Error / danger | `#f87171` / `#e05c5c` |
| Error bg | `rgba(239,68,68,0.2)` |
| Success | `#4ade80` |
| Success bg | `rgba(34,197,94,0.3)` |

---

## Typography

### Typefaces
| Family | Use |
|---|---|
| **Playfair Display** (serif, italic) | Product names, display headings, About modal title, pull-quotes |
| **Georgia** | Serif fallback for Playfair |
| **Inter** | All UI text — labels, body copy, prices, buttons, data |
| **Helvetica Neue** | Sans-serif fallback for Inter |

### Type scale (UI)
| Role | Size | Weight | Tracking | Transform |
|---|---|---|---|---|
| Display heading | 2rem | 400 (regular) | 0.02em | Italic |
| Product name (modal) | 1.65rem | 400 | 0.02em | Italic |
| Body | 0.88rem | 400 | — | — |
| Data / price | 0.78–0.82rem | 500 | 0.03–0.12em | — |
| Section label | 0.62–0.67rem | 400 | 0.14–0.35em | Uppercase |
| Micro label | 0.50–0.57rem | 400 | 0.28–0.35em | Uppercase |
| CTA / button | 0.63rem | 700 | 0.22em | Uppercase |

---

## Shape & elevation

| Token | Value |
|---|---|
| Border radius | 2–3px (near-square — luxury minimal, never pill-shaped) |
| Shadow — heavy | `0 32px 80px rgba(0,0,0,0.95)` |
| Shadow — medium | `0 20px 60px rgba(0,0,0,0.9)` |
| Shadow — light | `0 12px 40px rgba(0,0,0,0.85)` |
| Backdrop blur | `blur(4–6px)` on overlays |
| Overlay bg | `rgba(0,0,0,0.88–0.92)` |

---

## Motion

| Token | Value | Usage |
|---|---|---|
| Standard | `0.2s ease` | Colour transitions, hover states |
| Standard slow | `0.3s ease` | Modal fade, visibility |
| Elastic / spring | `cubic-bezier(0.16, 1, 0.3, 1)` | Drawers sliding in, dropdowns opening |
| Panel slide | `0.55s cubic-bezier(0.16,1,0.3,1)` | Gold ticker drawer |
| Gold pulse | `2.4s ease-in-out infinite` | Ticker tab glow animation |
| Spin | `1s linear infinite` | Refresh button |

---

## Product catalogue

| Category | Metal |
|---|---|
| Rings | 18K / 22K Yellow Gold, Rose Gold, White Gold |
| Pendants | 18K Yellow / Rose Gold |
| Bracelets | 18K Yellow / White Gold |
| Earrings (hoops, drops, studs) | 18K Yellow / White Gold |
| Necklaces / Chains | 18K Yellow Gold |
| Cuffs | 18K Yellow Gold |
| Tennis Bracelets | 18K White Gold |
| Lab Diamond pieces | Any metal + Lab Diamond callout |

**Primary metal:** 22K Gold (everyday wear — warmth, longevity, lustre)  
**Stones:** Diamonds (round, marquise, pavé, eternity), Sapphires, Lab Diamonds  

---

## Contact & channels

| Channel | Value |
|---|---|
| WhatsApp | +971 52 493 2609 (`wa.me/971524932609`) |
| Instagram | Instagram ↗ (linked in nav) |
| Location | Dubai City of Gold (`dubaicityofgold.com`) |

---

## Do / Don't

| Do | Don't |
|---|---|
| Use Playfair italic for all product titles | Use Playfair bold or upright for UI labels |
| Keep all UI text Inter, uppercase, wide-tracked | Mix serif into data rows or price displays |
| Use gold only as an accent — never fill large areas | Fill entire backgrounds with `#d4af37` |
| Use near-black backgrounds (`#080808–#0e0e0e`) | Use off-white, grey, or navy backgrounds |
| Keep borders as 1px gold hairlines | Use thick or coloured borders |
| Keep border-radius at 2–3px | Round corners to 8px+ (pill/card feel) |
| Let white space breathe | Crowd elements together |
| Write product names in title case | Write in ALL CAPS or all-lower |
