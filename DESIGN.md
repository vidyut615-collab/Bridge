# Ui — Style Reference & Design System Specification
> Clinical blueprint on frosted paper

**Theme:** Light (Monochromatic Design-System Workshop)

Single source of truth for UI/UX styling across the Truskill Assessment Operations & Observability System, derived from `Design sample 1.md`.

---

## 1. Design Tokens — Colors

| Token Name | Hex Value | CSS Variable | Semantic Purpose |
|------------|-----------|--------------|------------------|
| **Canvas** | `#f5f5f5` | `--color-canvas` | Page background, muted surface fills, secondary buttons |
| **Paper** | `#ffffff` | `--color-paper` | Card surfaces, popover backgrounds, primary button text |
| **Surface Alt** | `#fafafa` | `--color-surface-alt` | Sidebar/table headers, subtle card variant, input resting state |
| **Ink** | `#0a0a0a` | `--color-ink` | Primary text, display headings, button labels, icon strokes |
| **Ink Soft** | `#171717` | `--color-ink-soft` | Filled button backgrounds, secondary text on light surfaces |
| **Mid Gray** | `#737373` | `--color-mid-gray` | Muted body text, placeholder text, helper labels, table headers |
| **Hairline** | `#e5e5e5` | `--color-hairline` | Borders, input outlines, card edges, badge outlines |
| **Ember** | `#e7000b` | `--color-ember` | Red destructive accent for errors, deletions, and warning states only |

---

## 2. Typography & Letter-Spacing

Interface typography uses **Geist** and **Geist Mono** with engineered, code-adjacent geometric neutrality:

- **Display (48px / 600)**: letter-spacing `-0.0500em`
- **Headings (24–36px / 600)**: letter-spacing `-0.0250em`
- **Body (14px / 400)**: line-height `1.43`
- **Captions (11–12px uppercase / 500)**: letter-spacing `0.0500em`
- **Numbers, Codes, Timestamps**: `font-mono tabular-nums`

---

## 3. Shapes & Radii Hierarchy

- **Cards & Containers**: `24px` (`rounded-[24px]`)
- **Interactive Elements (Buttons, Inputs, Badges, Search Bars)**: `18px` (`rounded-[18px]` or `rounded-full`)
- **Nested Controls & Icon Boxes**: `10px` (`rounded-[10px]`)
- **Small Badges & Micro-tags**: `6px` (`rounded-[6px]`)

---

## 4. Elevation & Hairlines

- **Card Shadow**:
  `box-shadow: 0 0 0 1px rgba(23, 23, 23, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);`
- **Buttons**: Flat tonal contrast — no shadow.
- **Inputs**: Flat resting fill `#f5f5f5`, 1px hairline border `#e5e5e5` on focus.

---

## 5. Component Recipes

1. **Primary Button**: `bg-[#0a0a0a] text-[#fafafa] rounded-[18px] px-4 py-2 font-medium text-xs sm:text-sm hover:bg-[#262626] transition-colors`
2. **Ghost/Secondary Button**: `bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] px-3.5 py-1.5 font-medium text-xs sm:text-sm hover:bg-[#e5e5e5] transition-colors`
3. **Outline Button**: `bg-transparent text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] px-3 py-1.5 font-medium text-xs sm:text-sm hover:bg-[#f5f5f5] transition-colors`
4. **Card Container**: `bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] p-6`
5. **Form Input**: `bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] border border-transparent focus:border-[#e5e5e5] focus:bg-white rounded-[18px] px-3.5 py-2 text-xs sm:text-sm transition-all focus:outline-none`
6. **Status Badges**:
   - Solid: `bg-[#171717] text-[#fafafa] rounded-[18px] px-2.5 py-0.5 text-[10px] font-mono font-medium`
   - Soft: `bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5] rounded-[18px] px-2.5 py-0.5 text-[10px] font-mono font-medium`
   - Destructive: `bg-red-50 text-[#e7000b] border border-red-200 rounded-[18px] px-2.5 py-0.5 text-[10px] font-mono font-medium`
