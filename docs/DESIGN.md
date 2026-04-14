# 🎨 Design Theme Document

## Soft Neutral + Green Trust (UI System)

---

# 1. 🧠 Theme Overview

## Theme Name

**Soft Neutral + Green Trust**

---

## 🎯 Design Goal

To create a UI that feels:

* Clean
* Corporate
* Trustworthy
* Calm
* Modern

---

## 🧬 Core Idea

> Neutral base + meaningful green = **trust-driven interface**

---

# 2. 🎨 Color System

---

## 🌿 Base Colors

```css
--bg-primary: #F9FAFB;
--bg-secondary: #FFFFFF;

--text-primary: #111827;
--text-secondary: #6B7280;

--border: #E5E7EB;
--card: #FFFFFF;
```

---

## 🛡️ Trust Colors (Primary Identity)

```css
--trust: #16A34A;
--trust-light: #22C55E;
--trust-bg: #ECFDF5;
```

---

## ⚠️ Status Colors

```css
--pending: #F59E0B;
--pending-bg: #FFFBEB;

--danger: #EF4444;
--danger-bg: #FEF2F2;
```

---

## 🔵 Optional Accent

```css
--accent: #2563EB;
```

---

# 3. ⚡ Tailwind Configuration

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        bg: "#F9FAFB",
        card: "#FFFFFF",
        border: "#E5E7EB",

        text: {
          primary: "#111827",
          secondary: "#6B7280"
        },

        trust: {
          DEFAULT: "#16A34A",
          light: "#22C55E",
          bg: "#ECFDF5"
        },

        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FFFBEB"
        },

        danger: {
          DEFAULT: "#EF4444",
          bg: "#FEF2F2"
        }
      }
    }
  }
};
```

---

# 4. 🧩 Component Design System

---

## 🟩 Verified Badge

```tsx
<div className="flex items-center gap-1 text-sm font-medium text-trust bg-trust-bg px-2 py-1 rounded-md">
  ✔ Verified
</div>
```

---

## 🟨 Pending Badge

```tsx
<div className="text-warning bg-warning-bg px-2 py-1 rounded-md text-sm">
  Pending
</div>
```

---

## 🟥 Flagged Badge

```tsx
<div className="text-danger bg-danger-bg px-2 py-1 rounded-md text-sm">
  Flagged
</div>
```

---

---

# 5. 🧱 Card System

```tsx
<div className="bg-card border border-border rounded-xl p-4 shadow-sm">
  Content
</div>
```

---

## Rules

* Use **soft borders** instead of shadows
* Keep elevation minimal
* Maintain spacing consistency

---

---

# 6. 🔘 Button System

---

## Primary Button (Trust Action)

```tsx
<button className="bg-trust hover:bg-trust-light text-white px-4 py-2 rounded-lg">
  Action
</button>
```

---

## Secondary Button

```tsx
<button className="border border-border px-4 py-2 rounded-lg">
  Secondary
</button>
```

---

---

# 7. 🧠 Layout System

---

## Page Wrapper

```tsx
<div className="bg-bg min-h-screen">
```

---

## Container

```tsx
<div className="max-w-5xl mx-auto px-4">
```

---

---

# 8. ✍️ Typography System

---

## Font Family

* Inter (primary)
* Geist (alternative)

---

## Scale

```css
Heading: text-xl font-semibold
Subheading: text-lg font-medium
Body: text-base
Caption: text-sm text-gray-500
```

---

---

# 9. 🧠 UX Principles

---

## 1. Meaningful Colors

| Color  | Meaning          |
| ------ | ---------------- |
| Green  | Verified / Trust |
| Yellow | Pending          |
| Red    | Risk / Flagged   |

---

## 2. Minimalism First

* Avoid clutter
* Reduce unnecessary UI
* Focus on clarity

---

## 3. Spacing = Quality

* Use generous padding
* Maintain visual hierarchy

---

## 4. Consistency

* Same badge styles
* Same button patterns
* Same spacing rules

---

---

# 10. 🔥 Interaction Design

---

## Hover States

```css
hover:bg-gray-100
hover:bg-trust-light
```

---

## Transitions

```css
transition-all duration-200
```

---

---

# 11. 🧬 Screen-Level Application

---

## 👤 Profile Page

* Clean white cards
* Verified badge visible
* Minimal distractions

---

## 📝 Feed

* Card-based posts
* No algorithm noise
* Focus on content

---

## 💼 Jobs

* Structured layout
* Highlight trust score

---

---

# 12. ⚠️ Anti-Patterns (Avoid These)

---

❌ Too many colors
❌ Heavy gradients
❌ Strong shadows
❌ Overuse of green

---

---

# 13. 🏁 Final Summary

---

## Theme Strengths

* Clean & corporate
* Trust-focused
* Scalable design system
* Easy to maintain

---

## Design Philosophy

> Less noise → more trust
> More clarity → better decisions

---

**This is not just a UI theme.
This is a trust-driven design system.**
