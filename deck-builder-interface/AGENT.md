# Project Architecture & Patterns

This project follows a **simple and clean architecture** specifically designed for small-scale applications. It avoids over-engineering while maintaining high standards for code quality and maintainability.

## Core Principles

1. **Simple Patterns for a Small Application**: We intentionally avoid complex abstractions like Redux, Clean Architecture, or DDD, which would introduce unnecessary overhead.
2. **Feature-Based Organization**: Code is organized by "features" (modules) rather than technical types. This makes the codebase intuitive to navigate.
3. **Component-Based Architecture**: Standard React component patterns are used for UI modularity.
4. **Logic Separation (Custom Hooks)**: UI components focus on presentation. Logic, side effects, and state management are moved into custom hooks (e.g., `useNavigation.ts`).
5. **Service Pattern**: External logic or data fetching is isolated into simple service objects (e.g., `productService.ts`) to keep components and hooks clean.

## Folder Structure

- `/app`: Next.js App Router routes and global configurations.
- `/features`: The core of the application, divided by domain feature.
  - `/navigation`: Shared navigation components and logic.
  - `/home`: Landing page with premium banners (Collections, BanList, Meta).
  - `/decks`: Core deck management logic.
    - `DeckList.tsx`: Visual grid of user decks.
    - `DeckCreate.tsx`: Interactive side-by-side deck builder (Client Component).
    - `DeckDetailPage.tsx`: Detailed view of cards in a deck.
    - `deckService.ts`: Centralized service for deck and card operations.

## Guidelines for Future Contributors

### When to scale up?
- Introduce a global state library (like Zustand or React Context) only if state must be shared across many non-adjacent components.
- Introduce more complex service layers only if the application integrates with multiple complex APIs.

### What to avoid?
- **No Over-abstraction**: Don't create generic wrappers for everything. Keep it practical.
- **No Redux**: Avoid global stores unless absolutely necessary.
- **Keep Components Focused**: If a component exceeds 100 lines, consider breaking it down or moving logic to a hook.

---
*This documentation is maintained by Antigravity.*
