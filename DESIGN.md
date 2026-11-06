# Design Language: Linear (Refined & Production-Ready)
## Application Design System Specification for Truskill Operations

> **Origin**: Derived and refined from the extracted design language of `Linear.app` (May 2026).
> **Purpose**: A production-grade design system specification transforming raw CSS properties into clean semantic tokens, typography scales, component recipes, and Tailwind utility standards for high-performance operational dashboards.

---

## 1. Visual Philosophy & Core Pillars

Linear's visual signature is defined by **four core principles**:

1. **Obsidian Depth & Layered Surfaces**: Pure dark themes avoid flat muddy grays. Linear uses precise luminescence layering (`#08090a` canvas → `#0f1011` panel → `#141516` surface → `#191a1b` elevated cards) with 1px translucent hairline borders (`rgba(255, 255, 255, 0.05–0.08)`).
2. **Optical Typography & Negative Tracking**: Headings and interface labels use tight negative letter-spacing (`-0.011em` to `-0.022em`) for maximum density and sharpness, paired with a distinct monospace font for tabular numbers and entity identifiers.
3. **Restrained Saturated Accents**: A predominantly neutral canvas punctuated by purposeful, calibrated neon signals (Linear Indigo `#5e6ad2`, Emerald `#27a644`, Amber `#f0bf00`, Crimson `#eb5757`).
4. **Instantaneous Tactility**: Ultra-fast micro-transitions (100ms–160ms `cubic-bezier(0.25, 0.46, 0.45, 0.94)`) and subtle inset highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.04)`).

---

## 2. Color System & Semantic Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│ SURFACE ELEVATION LAYERS                                               │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ Layer             │ Hex               │ Semantic Purpose               │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Canvas / Root     │ #08090a           │ Application background         │
│ Panel / Nav       │ #0f1011           │ Top navigation, side panels    │
│ Level 1 (Card)    │ #141516           │ Data cards, table containers   │
│ Level 2 (Elevated)│ #191a1b           │ Modals, popovers, active rows  │
│ Level 3 (Input)   │ #1e2022           │ Text inputs, select triggers   │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### A. Text Color Hierarchy
* **`text-primary` (`#f7f8f8`)**: Primary titles, table headers, active values. (Contrast ratio 15.8:1 against `#08090a` - AAA Compliant).
* **`text-secondary` (`#d0d6e0`)**: Body text, table data cells, primary labels.
* **`text-tertiary` (`#8a8f98`)**: Supporting descriptions, secondary metadata, breadcrumbs.
* **`text-quaternary` (`#62666d`)**: Disabled text, subtle table footer captions, dividers.

### B. Border & Hairline Tokens
Linear uses **translucent white borders** rather than opaque gray borders to create an organic, glass-like edge on dark backgrounds:
* **Hairline Subtle**: `rgba(255, 255, 255, 0.05)` (`border-white/[0.05]`) — Table rows, card dividers.
* **Hairline Normal**: `rgba(255, 255, 255, 0.08)` (`border-white/[0.08]`) — Card outer boundaries, panel borders.
* **Hairline Active / Focus**: `#5e6ad2` (`border-[#5e6ad2]`) with focus ring `ring-1 ring-[#5e6ad2]/50`.

### C. Semantic Accent Tokens (Truskill Operations Mapping)
| Role | Color Hex | Background Token (10% Alpha) | Border Token (20% Alpha) | Truskill Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Linear Brand** | `#5e6ad2` | `rgba(94, 106, 210, 0.12)` | `rgba(94, 106, 210, 0.3)` | Primary actions, Training Tests (`TR`) |
| **Success / Level I** | `#27a644` | `rgba(39, 166, 68, 0.12)` | `rgba(39, 166, 68, 0.25)` | Level I (Easy) questions, Completed deployment |
| **Warning / Level II** | `#f0bf00` | `rgba(240, 191, 0, 0.12)` | `rgba(240, 191, 0, 0.25)` | Level II (Medium) questions, Pending updates |
| **Danger / Level III** | `#eb5757` | `rgba(235, 87, 87, 0.12)` | `rgba(235, 87, 87, 0.25)` | Level III (Hard) questions, Validation errors |
| **Cyan / Truskill LMS** | `#00cee2` | `rgba(0, 206, 226, 0.12)` | `rgba(0, 206, 226, 0.25)` | Truskill LMS status milestones |
| **Purple / Superadmin**| `#8b5cf6` | `rgba(139, 92, 246, 0.12)` | `rgba(139, 92, 246, 0.25)` | Superadmin badges, Regular Tests (`RG`) |

---

## 3. Typography & Hierarchy

### Font Families:
1. **Sans-Serif**: `Inter Variable`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
2. **Monospace**: `Berkeley Mono`, `Geist Mono`, `ui-monospace`, `monospace` (Mandatory for counts, codes, and IDs)

### Type Rules:
* **H1 / Page Titles**: `text-xl sm:text-2xl font-medium tracking-[-0.022em] text-[#f7f8f8]`
* **H2 / Section Headers**: `text-sm sm:text-base font-medium tracking-[-0.015em] text-[#f7f8f8]`
* **Body Text**: `text-xs sm:text-sm font-normal text-[#d0d6e0] leading-relaxed`
* **Metadata & Table Headers**: `text-[11px] font-mono uppercase tracking-[0.05em] text-[#8a8f98]`
* **Data Cells**: `text-xs font-mono tabular-nums text-[#f7f8f8]` (numbers right-aligned)
* **Status Badges**: `text-[10px] font-mono font-medium tracking-wider uppercase`

---

## 4. Spacing, Borders & Shadows

### Border Radius Hierarchy:
* `rounded-sm` (`4px`): Micro-badges, select dropdown items, icon buttons.
* `rounded-md` (`6px`): Standard buttons, text inputs, table action buttons.
* `rounded-lg` (`8px`): Small cards, dialog boxes, dropdown menus.
* `rounded-xl` (`12px`): Main operational containers, KPI stat cards, data table wrappers.
* `rounded-full` (`9999px`): Status dot indicators, filter pills.

### Box Shadows (Linear Inset Glow Technique):
```css
/* Card with subtle top highlight */
box-shadow: 
  inset 0 1px 0 0 rgba(255, 255, 255, 0.05),
  0 2px 4px 0 rgba(0, 0, 0, 0.4);

/* Elevated Popover / Modal */
box-shadow: 
  inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
  0 4px 24px 0 rgba(0, 0, 0, 0.6);

/* Linear Brand Button Glow */
box-shadow: 
  0 0 16px 0 rgba(94, 106, 210, 0.35),
  inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
```

---

## 5. Component Recipes (Tailwind CSS Ready)

### A. Navigation Bar (Linear Header)
```html
<header class="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#08090a]/80 backdrop-blur-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
    <!-- Brand -->
    <div class="flex items-center gap-3">
      <div class="h-6 w-6 rounded bg-[#5e6ad2] flex items-center justify-center text-white shadow-[0_0_12px_rgba(94,106,210,0.5)]">
        <Icon class="h-3.5 w-3.5" />
      </div>
      <span class="text-xs font-medium tracking-tight text-[#f7f8f8]">TRUSKILL OPS</span>
    </div>

    <!-- Nav Items -->
    <nav class="flex items-center space-x-1">
      <a class="px-3 py-1.5 rounded-md text-xs font-medium text-[#f7f8f8] bg-white/[0.06] border border-white/[0.08]">
        Dashboard
      </a>
      <a class="px-3 py-1.5 rounded-md text-xs font-medium text-[#8a8f98] hover:text-[#f7f8f8] hover:bg-white/[0.03] transition-colors">
        Question Bank
      </a>
    </nav>
  </div>
</header>
```

### B. KPI Stat Widget (Compact & Dense)
```html
<div class="rounded-xl border border-white/[0.08] bg-[#0f1011] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
  <div class="flex items-center justify-between text-[#8a8f98] text-[11px] font-mono uppercase tracking-wider">
    <span>Total Questions</span>
    <Icon class="h-3.5 w-3.5 text-[#62666d]" />
  </div>
  <div class="mt-2 text-2xl font-bold font-mono tracking-tight text-[#f7f8f8] tabular-nums">
    1,660
  </div>
  <div class="mt-2 flex items-center gap-1.5 text-[11px] text-[#8a8f98]">
    <span class="inline-block h-1.5 w-1.5 rounded-full bg-[#27a644] shadow-[0_0_6px_#27a644]"></span>
    <span>4 Active Subjects</span>
  </div>
</div>
```

### C. High-Density Data Table
```html
<div class="rounded-xl border border-white/[0.08] bg-[#0f1011] overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
  <table class="w-full text-left text-xs">
    <thead class="bg-[#141516] text-[#8a8f98] font-mono text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
      <tr>
        <th class="py-2.5 px-3">Subject</th>
        <th class="py-2.5 px-3 text-right">Easy (I)</th>
        <th class="py-2.5 px-3 text-right">Med (II)</th>
        <th class="py-2.5 px-3 text-right">Hard (III)</th>
        <th class="py-2.5 px-3 text-right text-[#f7f8f8]">Total</th>
        <th class="py-2.5 px-3 text-center">Status</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-white/[0.04]">
      <tr class="hover:bg-white/[0.02] transition-colors">
        <td class="py-2.5 px-3 font-medium text-[#f7f8f8]">Quantitative Aptitude</td>
        <td class="py-2.5 px-3 text-right font-mono tabular-nums text-[#43bc58]">250</td>
        <td class="py-2.5 px-3 text-right font-mono tabular-nums text-[#ffd500]">180</td>
        <td class="py-2.5 px-3 text-right font-mono tabular-nums text-[#ff6565]">90</td>
        <td class="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-[#f7f8f8]">520</td>
        <td class="py-2.5 px-3 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#27a644]/10 text-[#43bc58] border border-[#27a644]/20">
            Active
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### D. Primary Action Button (Linear Glowing Brand Button)
```html
<button class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#5e6ad2] text-[#f7f8f8] text-xs font-medium hover:bg-[#6c76e0] shadow-[0_0_16px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]">
  <Icon class="h-3.5 w-3.5" />
  Register Examination
</button>
```

### E. Secondary Ghost Button
```html
<button class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04] text-[#d0d6e0] border border-white/[0.08] text-xs font-medium hover:bg-white/[0.08] hover:text-[#f7f8f8] transition-colors active:scale-[0.98]">
  Update Counts
</button>
```

### F. Form Input
```html
<input
  type="text"
  class="w-full px-3 py-1.5 text-xs rounded-md bg-[#141516] border border-white/[0.08] text-[#f7f8f8] placeholder-[#62666d] focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2]/50 transition-colors font-mono"
/>
```

---

## 6. Implementation Architecture in Tailwind CSS (Next.js)

To apply this refined Linear design across the application:

1. **`globals.css` Theme Tokens**:
   Map the surface and text variables into CSS custom properties:
   ```css
   :root {
     --bg-canvas: #08090a;
     --bg-panel: #0f1011;
     --bg-surface: #141516;
     --bg-elevated: #191a1b;
     --border-subtle: rgba(255, 255, 255, 0.05);
     --border-normal: rgba(255, 255, 255, 0.08);
     --text-primary: #f7f8f8;
     --text-secondary: #d0d6e0;
     --text-muted: #8a8f98;
     --color-brand: #5e6ad2;
     --color-easy: #27a644;
     --color-medium: #f0bf00;
     --color-hard: #eb5757;
   }
   ```
2. **Typography**:
   Ensure `Geist` (or `Inter`) and `Geist Mono` (or `Berkeley Mono`) are active on `body` with `-0.015em` letter-spacing.
3. **No Heavy Shadows**:
   Shadows are subtle and inset, keeping the workspace crisp, dark, and distraction-free.
