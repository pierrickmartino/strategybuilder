# Blockbuilders – User Interface Design Document  

## Layout Structure  
- **Top Navigation Bar (minimizable):**  
  - Left side: App logo + navigation tabs (Canvas, Backtests, Paper-Trading, Strategy Library).  
  - Center: Quick access to **New Strategy**, **Recent Strategies**, **Templates**, and **Settings**.  
  - Right side: User profile icon → dropdown for account actions (log out, profile settings).  
- **Main Content Area:**  
  - Dynamic workspace: switches content depending on selected top nav item.  
  - **Canvas View:** central drag-and-drop strategy builder with left-side block palette and right-side block settings panel.  
  - **Backtests / Results:** charts, KPIs, and logs take over main area.  
  - **Library / Paper-Trading:** table/grid-based layouts with filters.  
- **Optional Bottom “Results Bar”:** collapsible panel to show quick KPIs while building on the Canvas.  

## Core Components  
- **Canvas Builder:** drag-and-drop with snap-to-grid, palette (Data, Indicators, Signals, Risk, Execution).  
- **Block Settings Panel:** opens on right side when block selected.  
- **Results Dashboard:** equity curves, KPIs, and trade logs with export options.  
- **Comparison View:** multiple strategies side-by-side in a grid.  
- **Onboarding Layer:** starter templates, guided walkthrough, contextual tips.  
- **Profile Dropdown:** profile settings, light/dark mode toggle, logout.  

## Interaction Patterns  
- **Top nav bar** switches context, dynamically loads the respective workspace.  
- **Drag-and-drop canvas** supports connecting/disconnecting blocks with real-time validation feedback.  
- **Inline notifications** for validation errors and success messages.  
- **Modal overlays** for creating a new strategy, importing/exporting, or viewing details.  
- **Collapsible panels** (block palette, results bar) to maximize workspace.  

## Visual Design Elements & Color Scheme  
- **Primary Theme:** Dark mode by default with **orange accent color** for highlights, active states, and call-to-action buttons.  
- **Block Colors:**  
  - Data Sources – Teal  
  - Indicators – Blue  
  - Signals – Purple  
  - Risk Controls – Orange  
  - Execution – Green  
- **Light Mode Option:** Accessible color palette with neutral grays, softer accents, retaining the same block color scheme.  
- **Consistency:** Clear separation between background, interactive elements, and highlights for readability.  

## Mobile, Web App, Desktop Considerations  
- **Desktop-first design** for strategy creation.  
- **Responsive layout** on web and mobile:  
  - Collapsible nav bar and panels for small screens.  
  - Canvas interaction simplified on touch devices (tap-to-connect instead of drag).  
- **Future React Native app** alignment: use same navigation and color system.  

## Typography  
- **Primary Font:** Sans-serif, geometric and modern (e.g., Inter or Roboto).  
- **Hierarchy:**  
  - H1 (section headers): bold, larger size.  
  - H2/H3 (sub-sections): medium weight, smaller.  
  - Body: regular, high readability with adequate spacing.  
  - KPIs/metrics: bold, numeric-focused font style for emphasis.  

## Accessibility  
- **Light/Dark Mode Toggle** for visual comfort.  
- **High-contrast color options** meeting WCAG AA+ standards.  
- **Keyboard navigation support** (tab-through all actionable elements).  
- **ARIA labels** for screen reader support on all navigation, blocks, and charts.  
- **Scalable text**: relative units (rem/em) for responsiveness and zoom support.  
