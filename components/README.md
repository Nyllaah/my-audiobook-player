# Components

Reusable UI and screen-specific components. Use **kebab-case** for all filenames.

## Folder structure (by screen)

| Folder | Screen(s) | Purpose |
|--------|-----------|---------|
| **`ui/`** | All | Generic primitives (themed text/view, icons, collapsible, links, haptics). No app-specific logic. |
| **`layout/`** | All | Structural components (scroll views, wrappers). |
| **`library/`** | Library | Components used on the library tab (e.g. audiobook list item). |
| **`player/`** | Player (+ mini in tabs) | Components for the player screen and the mini player bar. |
| **`settings/`** | Settings | Components used on the settings tab. Add when you have settings-only UI. |

## Import paths

- UI primitives: `@/components/ui/<filename>` (e.g. `@/components/ui/themed-view`)
- Screen components: `@/components/<screen>/<filename>` (e.g. `@/components/library/audiobook-list-item`)

## When to add where

- **`ui/`** — Buttons, icons, themed text/view, links, tabs. Anything reusable across screens or in another app.
- **`layout/`** — Scroll views, screen wrappers, or containers that define structure.
- **`library/`** — Anything used mainly on the library screen (list items, empty state, filters, etc.).
- **`player/`** — Mini player, full player controls, progress bar, etc.
- **`settings/`** — Settings-specific forms, toggles, or sections.

If a component is used on **multiple screens**, keep it in **`ui/`** or **`layout/`**; otherwise put it in the screen folder that owns it.
