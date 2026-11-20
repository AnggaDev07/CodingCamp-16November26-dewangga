# Implementation Plan: To-Do Life Dashboard

## Overview

Build a fully self-contained single-page dashboard in three files (`index.html`, `css/style.css`, `js/app.js`). The order of work is: HTML scaffold → CSS base and theming → storage helper → each widget's JS logic → integration wiring → tests.

## Tasks

- [x] 1. Create the HTML scaffold
  - [x] 1.1 Create `index.html` with the full page structure
    - Write the `<!DOCTYPE html>` document with `<head>` meta tags (charset, viewport)
    - Add `<link>` to `css/style.css` and `<script defer>` to `js/app.js`
    - Add the `#dashboard-grid` wrapper containing the four `<section>` widgets: `#greeting-widget`, `#timer-widget`, `#todo-widget`, `#links-widget`
    - Include all widget-internal markup from the design: `#clock`, `#date-display`, `#greeting-text`, `#name-form`; `#timer-display`, `#timer-controls`, `#duration-form`; `#add-task-form`, `#sort-controls`, `#task-list`; `#links-list`, `#add-link-form`
    - Add the `#theme-toggle` button in the page header
    - Add `role="alert"` error spans for every form: `#name-error`, `#duration-error`, `#task-error`, `#link-error`
    - _Requirements: 6.1, 6.3, 6.4_

- [x] 2. Write the CSS stylesheet
  - [x] 2.1 Implement CSS custom properties and base styles in `css/style.css`
    - Define all `:root` custom properties: `--bg-primary`, `--bg-surface`, `--text-primary`, `--text-secondary`, `--accent`, `--border`, `--shadow`, `--timer-complete-bg`
    - Define `.dark` overrides for all custom properties
    - Apply base reset, `body` background and text using custom properties, and consistent font stack
    - _Requirements: 5.1, 5.2, 6.2_

  - [x] 2.2 Implement responsive grid layout and widget card styles
    - Style `#dashboard-grid` as a single-column CSS Grid with `gap: 1.5rem` (mobile-first)
    - Add `@media (min-width: 768px)` breakpoint switching to `repeat(2, 1fr)` columns
    - Make `#todo-widget` span both columns (`grid-column: 1 / -1`) on wide screens
    - Style each `<section>` as a card using `--bg-surface`, `--border`, `--shadow`
    - Add spacing, font-size, and contrast rules so all widget content is legible without zooming
    - _Requirements: 6.2, 6.5, 6.6_

  - [x] 2.3 Style individual widget components
    - Style `#clock` (large monospace), `#greeting-text`, `#date-display`
    - Style timer display (`#timer-display` large), control buttons, and `.timer-complete` state (background uses `--timer-complete-bg`)
    - Style task list items (`<li>`) with flex layout: complete/edit/delete buttons aligned right, completed tasks with strikethrough
    - Style quick-link cards (`.link-item`) and their delete buttons
    - Style `#theme-toggle` button in the header
    - Style all form inputs, submit buttons, and `role="alert"` error spans (red, visible)
    - _Requirements: 2.6, 6.2_

- [x] 3. Implement the storage helper in `js/app.js`
  - [x] 3.1 Write the `storage_*` helper layer with error handling
    - Create `storage_get(key)` — wraps `localStorage.getItem` in try/catch; returns parsed JSON or `null`; on error returns `{ ok: false, error }`
    - Create `storage_set(key, value)` — wraps `localStorage.setItem(key, JSON.stringify(value))` in try/catch; returns `{ ok: true }` or `{ ok: false, error }`
    - Define the five storage key constants: `KEY_TASKS`, `KEY_LINKS`, `KEY_NAME`, `KEY_DURATION`, `KEY_THEME`
    - Implement `storage_isAvailable()` — test-writes and test-reads a sentinel value; returns boolean
    - On unavailability, display the persistent banner "Storage unavailable — data will not be saved this session." in a `#storage-banner` element added to the page
    - _Requirements: 7.1, 7.4_

- [x] 4. Implement the theme module
  - [x] 4.1 Write `theme_load()` and `theme_toggle()` in `js/app.js`
    - `theme_load()`: read `tld_theme` from storage; if absent, read `window.matchMedia('(prefers-color-scheme: dark)').matches`; add or remove `.dark` on `<html>` accordingly
    - `theme_toggle()`: flip `.dark` on `<html>`, persist the new value via `storage_set`
    - Attach `theme_toggle` to the `#theme-toggle` button's `click` event
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.2 Write property tests for theme (Properties 15–16)
    - **Property 15: Theme toggle is its own inverse** — call `theme_toggle()` twice, assert class list unchanged
    - **Property 16: Theme persistence round-trip** — for any of `"light"` or `"dark"`, `theme_save` then `theme_load` applies the correct class
    - File: `tests/theme.test.js`
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 5. Implement the greeting module
  - [x] 5.1 Write pure greeting helper functions
    - `greeting_getGreeting(hour)`: map 5–11 → "Good Morning", 12–17 → "Good Afternoon", 18–20 → "Good Evening", 21–23 and 0–4 → "Good Night"
    - `greeting_formatTime(date)`: return `HH:MM:SS` with zero-padding
    - `greeting_formatDate(date)`: return `"DayName, DD MonthName YYYY"` using `toLocaleDateString` or manual arrays
    - `greeting_buildText(hour, name)`: return `"[Greeting], [Name]!"` when name is non-empty, else `"[Greeting]!"`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ]* 5.2 Write property tests for greeting helpers (Properties 1–4)
    - **Property 1: Greeting range covers all 24 hours** — `fc.integer({min:0,max:23})` → one of four strings, non-overlapping
    - **Property 2: Greeting text includes saved name** — any valid name + any hour → result contains name and ends with "!"
    - **Property 3: Time format is always HH:MM:SS** — any `Date` → matches `^\d{2}:\d{2}:\d{2}$`
    - **Property 4: Date format matches expected structure** — any `Date` → matches `"DayName, DD MonthName YYYY"` structure
    - File: `tests/greeting.test.js`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 5.3 Write `greeting_saveName()` and `initGreeting()` / `startClock()`
    - `greeting_saveName(value)`: validate 1–50 chars; on fail populate `#name-error` and return `{ ok: false }`; on pass persist via `storage_set(KEY_NAME, value)` and call `greeting_tick()`, return `{ ok: true }`
    - If `value` is empty string, retain stored name (no-op)
    - If `value` exceeds 50 chars, display error "Name must be 50 characters or fewer." and do not modify storage
    - `initGreeting()`: read stored name from storage, populate `#name-input`, call `greeting_tick()`, attach `submit` listener to `#name-form`
    - `startClock()`: call `setInterval(greeting_tick, 1000)` after `initGreeting()`
    - `greeting_tick()`: update `#clock`, `#date-display`, `#greeting-text` from `new Date()`
    - _Requirements: 1.1, 1.2, 1.7, 1.8, 1.9, 1.10, 1.11_

  - [ ]* 5.4 Write property test for name save (Property 5)
    - **Property 5: Name save accepts exactly 1–50 character strings** — `fc.string({minLength:1,maxLength:50})` → `{ ok: true }`; length 0 or >50 → `{ ok: false }` and storage unchanged
    - File: `tests/greeting.test.js`
    - _Requirements: 1.9, 1.10, 1.11_

- [ ] 6. Checkpoint — Ensure greeting, theme, and storage tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement the timer module
  - [x] 7.1 Write timer helper and state variables
    - Declare module-level variables: `timer_intervalId`, `timer_remaining`, `timer_focusDuration`, `timer_isRunning`
    - `timer_formatDisplay(seconds)`: return `"MM:SS"` zero-padded; minutes = `Math.floor(seconds/60)`, seconds = `seconds % 60`
    - `timer_setDuration(minutes)`: validate 1–999; on fail populate `#duration-error`, return `{ ok: false }`, do not reset in-progress countdown; on pass update `timer_focusDuration` (in seconds), persist via `storage_set(KEY_DURATION, minutes)`, update `#timer-display` if not running
    - _Requirements: 2.1, 2.2, 2.7, 2.8_

  - [ ]* 7.2 Write property test for timer display (Property 6)
    - **Property 6: Timer display is always valid MM:SS** — `fc.nat()` → matches `^\d{2}:\d{2}$`, minute component = `Math.floor(n/60)` padded, second component = `n%60` padded
    - File: `tests/timer.test.js`
    - _Requirements: 2.2, 2.7_

  - [x] 7.3 Write timer state-machine functions and `initTimer()`
    - `timer_tick()`: decrement `timer_remaining`; clamp to 0; update `#timer-display`; if 0 call `timer_onComplete()`
    - `timer_start()`: no-op if `timer_isRunning`; set `timer_isRunning = true`; call `setInterval(timer_tick, 1000)` storing handle in `timer_intervalId`
    - `timer_stop()`: `clearInterval(timer_intervalId)`; set `timer_isRunning = false`
    - `timer_reset()`: call `timer_stop()`; set `timer_remaining = timer_focusDuration`; update `#timer-display`; remove `.timer-complete` from `#timer-widget`
    - `timer_onComplete()`: call `timer_stop()`; add `.timer-complete` to `#timer-widget`
    - `initTimer()`: read `tld_focusDuration` from storage (default 25); set `timer_focusDuration` and `timer_remaining`; update `#timer-display`; attach click listeners to `#btn-start`, `#btn-stop`, `#btn-reset` and submit listener to `#duration-form`
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9_

- [x] 8. Implement the to-do module
  - [x] 8.1 Write todo data functions and `todo_persist()` / `todo_load()`
    - Declare module-level `todo_tasks` array
    - `todo_persist()`: call `storage_set(KEY_TASKS, todo_tasks)`; on failure show inline error
    - `todo_load()`: call `storage_get(KEY_TASKS)`; set `todo_tasks` to result or `[]`; call `todo_render()`
    - Each task has shape `{ id, description, completed, createdAt }` per design data model
    - _Requirements: 3.11, 7.1_

  - [ ]* 8.2 Write property test for task persistence round-trip (Property 11)
    - **Property 11: Task persistence round-trip** — `fc.array(fc.record({id: fc.uuid(), description: fc.string({minLength:1,maxLength:200}), completed: fc.boolean(), createdAt: fc.nat()}))` → persist then load returns structurally equal array
    - File: `tests/todo.test.js`
    - _Requirements: 3.11, 7.1_

  - [x] 8.3 Write `todo_add()`, `todo_delete()`, and `todo_toggle()`
    - `todo_add(description)`: validate 1–200 chars; on fail populate `#task-error`; on pass push `{ id: crypto.randomUUID(), description, completed: false, createdAt: Date.now() }`, call `todo_persist()` and `todo_render()`
    - `todo_delete(id)`: splice out task by id, call `todo_persist()` and `todo_render()`
    - `todo_toggle(id)`: flip `completed`, call `todo_persist()` and `todo_render()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 8.4 Write property tests for add and toggle (Properties 7–8)
    - **Property 7: Adding a valid task grows the list by one** — any description 1–200 chars → list length +1 and new task description matches input
    - **Property 8: Completion toggle is its own inverse** — toggle twice → completed state unchanged
    - File: `tests/todo.test.js`
    - _Requirements: 3.1, 3.4_

  - [x] 8.5 Write `todo_startEdit()`, `todo_saveEdit()`, and `todo_sort()`
    - `todo_startEdit(id)`: replace the task `<span class="task-text">` with an `<input>` pre-filled with current description; replace edit button with a save button that calls `todo_saveEdit(id, input.value)`
    - `todo_saveEdit(id, value)`: if empty, populate `#task-error` on the item and revert to original text; if 1–200 chars, update task description, call `todo_persist()` and `todo_render()`
    - `todo_sort('name')`: sort `todo_tasks` in-place by `description.toLowerCase()` ascending
    - `todo_sort('status')`: stable-sort so `completed === false` items come first, relative order preserved within each group
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_

  - [ ]* 8.6 Write property tests for sort (Properties 9–10)
    - **Property 9: Sort by name produces case-insensitive ascending order** — any task array → after `todo_sort('name')`, every adjacent pair satisfies `tasks[i].description.toLowerCase() <= tasks[i+1].description.toLowerCase()`
    - **Property 10: Sort by status places all incomplete tasks before completed** — any task array → after `todo_sort('status')`, there exists index `k` such that tasks `< k` are incomplete and tasks `>= k` are complete; relative order within each group preserved
    - File: `tests/todo.test.js`
    - _Requirements: 3.9, 3.10_

  - [x] 8.7 Write `todo_render()` and `initTodo()`
    - `todo_render()`: clear `#task-list`; for each task in `todo_tasks` create an `<li data-id="{id}">` with complete/edit/delete buttons and `<span class="task-text">`; add `completed` class and `aria-label` on the toggle button when `task.completed === true`; attach button event listeners inline during render
    - `initTodo()`: call `todo_load()`; attach `submit` listener to `#add-task-form`; attach `click` listeners to `[data-sort]` buttons in `#sort-controls`
    - _Requirements: 3.1, 3.4, 3.5, 3.6, 3.9, 3.10, 3.11_

- [ ] 9. Checkpoint — Ensure todo tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement the quick-links module
  - [x] 10.1 Write `links_validateUrl()`, `links_persist()`, and `links_load()`
    - `links_validateUrl(url)`: check string prefix is `http://` or `https://`; then `new URL(url)` in try/catch; return `{ ok: true }` or `{ ok: false, error }`
    - `links_persist()`: call `storage_set(KEY_LINKS, links_items)`; on storage failure display error without changing displayed list
    - `links_load()`: call `storage_get(KEY_LINKS)`; set `links_items` to result or `[]`; call `links_render()`; on storage failure show error banner
    - _Requirements: 4.5, 4.7, 7.1_

  - [ ]* 10.2 Write property test for quick-links persistence round-trip (Property 14)
    - **Property 14: Quick-links persistence round-trip** — any array of `{ id, label, url }` objects → persist then load returns structurally equal array
    - File: `tests/links.test.js`
    - _Requirements: 4.5, 7.1_

  - [x] 10.3 Write `links_add()`, `links_delete()`, and `links_render()`
    - `links_add(label, url)`: validate label 1–50 chars and URL via `links_validateUrl`; reject if `links_items.length >= 20`; on any validation failure populate `#link-error` with the specific message; on pass push `{ id: crypto.randomUUID(), label, url }`, call `links_persist()` and `links_render()`
    - `links_delete(id)`: remove entry by id, call `links_persist()` and `links_render()`
    - `links_render()`: clear `#links-list`; for each item create a `.link-item` div containing an `<a href="{url}" target="_blank" rel="noopener noreferrer">` and a delete `<button class="btn-delete-link">`; attach delete button listener
    - `initLinks()`: call `links_load()`; attach `submit` listener to `#add-link-form`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_

  - [ ]* 10.4 Write property tests for add and delete (Properties 12–13)
    - **Property 12: Adding a valid quick link grows the list by one** — any label 1–50 chars and valid http/https URL → list length +1, entry label and url match inputs
    - **Property 13: Deleting a quick link removes it from the list** — any list with at least one entry, any present id → after delete no entry with that id exists, all others unchanged
    - File: `tests/links.test.js`
    - _Requirements: 4.1, 4.4_

- [x] 11. Wire everything together in `js/app.js`
  - [x] 11.1 Write the `DOMContentLoaded` initialisation sequence
    - Add a single `document.addEventListener('DOMContentLoaded', ...)` handler at the bottom of `app.js`
    - Call in order: `storage_isAvailable()` (show banner if false), `theme_load()`, `initGreeting()`, `initTimer()`, `initTodo()`, `initLinks()`, `startClock()`
    - Ensure `startClock()` is the last call so the clock interval starts after all widgets are ready
    - _Requirements: 6.1, 6.7, 7.4_

  - [ ]* 11.2 Write storage error-handling unit tests
    - Test that `storage_get` returns `null` and does not throw when `localStorage` is unavailable (simulate by overriding `localStorage` to throw)
    - Test that `storage_set` returns `{ ok: false }` on `localStorage` failure
    - Test that the unavailability banner is shown when `storage_isAvailable()` returns false
    - File: `tests/storage.test.js`
    - _Requirements: 7.4_

  - [ ]* 11.3 Write timer example-based unit tests
    - Test start → stop → reset state transitions
    - Test that starting an already-running timer is a no-op (no second interval)
    - Test that `timer_onComplete` adds `.timer-complete` to `#timer-widget`
    - Test that `timer_setDuration` with out-of-range values populates `#duration-error` and does not change `timer_focusDuration`
    - File: `tests/timer.test.js`
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.8, 2.9_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Run all test files; ensure every test passes; ask the user if any failures require design clarification.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Property tests use [fast-check](https://fast-check.dev/) with `numRuns: 100`; each test file is tagged with the property numbers it covers.
- All three runtime files (`index.html`, `css/style.css`, `js/app.js`) must remain free of any `import`, `require`, or `npm` dependency.
- The `tests/` directory and fast-check are dev-only and do not ship with the application.
- Checkpoints at tasks 6 and 12 mark natural integration boundaries.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.1", "5.1"] },
    { "id": 3, "tasks": ["4.2", "5.2", "5.3", "7.1"] },
    { "id": 4, "tasks": ["5.4", "7.2", "7.3", "8.1"] },
    { "id": 5, "tasks": ["7.2", "8.2", "8.3"] },
    { "id": 6, "tasks": ["8.4", "8.5"] },
    { "id": 7, "tasks": ["8.6", "8.7", "10.1"] },
    { "id": 8, "tasks": ["10.2", "10.3"] },
    { "id": 9, "tasks": ["10.4", "11.1"] },
    { "id": 10, "tasks": ["11.2", "11.3"] }
  ]
}
```
