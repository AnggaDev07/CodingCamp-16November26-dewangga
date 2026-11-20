# Requirements Document

## Introduction

A single-page, modern To-Do List Life Dashboard delivered as a standalone HTML/CSS/Vanilla JavaScript web application. The dashboard combines a live clock with contextual greeting, a configurable focus timer, a full-featured to-do list, and a quick-links launcher — all persisted in browser Local Storage with no backend required. A light/dark mode toggle and clean, minimalistic visual design make it suitable for daily productivity use directly from the browser.

## Glossary

- **Dashboard**: The single HTML page that hosts all widgets.
- **Greeting_Widget**: The section that displays the current time, date, and a personalized greeting.
- **Timer_Widget**: The focus timer section with configurable duration and start/stop/reset controls.
- **Todo_Widget**: The to-do list section supporting add, edit, complete, delete, and sort operations.
- **Links_Widget**: The quick-links section that stores and launches user-defined bookmark buttons.
- **Storage**: The browser's `localStorage` API used for all client-side persistence.
- **User**: A person interacting with the Dashboard in a modern browser.
- **Task**: A single to-do item with a text description and a completion state.
- **Quick_Link**: A user-defined record consisting of a display label and a URL.
- **Focus_Duration**: The countdown duration (in minutes) configured for the Timer_Widget.
- **Theme**: The active color scheme, either "light" or "dark".

---

## Requirements

### Requirement 1: Live Greeting and Clock

**User Story:** As a User, I want to see the current time, date, and a personalized greeting, so that I am immediately oriented when I open the Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM:SS format, updated at an interval of exactly 1000 milliseconds.
2. THE Greeting_Widget SHALL display the current date in the format "DayName, DD MonthName YYYY" (e.g., "Monday, 16 November 2026").
3. WHEN the current local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the current local hour is between 21:00 and 23:59 or between 00:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. IF a user name has been saved in Storage, THEN THE Greeting_Widget SHALL append the stored name to the greeting in the format "[Greeting], [Name]!" (e.g., "Good Morning, Alex!").
8. IF no user name has been saved in Storage, THEN THE Greeting_Widget SHALL display the greeting text without a name suffix (e.g., "Good Morning!").
9. WHEN the User submits a non-empty name of between 1 and 50 characters via the name input field, THE Greeting_Widget SHALL save the name to Storage and update the displayed greeting within 500 milliseconds.
10. IF the User submits an empty name, THEN THE Greeting_Widget SHALL retain the previously stored name without modification.
11. IF the User submits a name exceeding 50 characters, THEN THE Greeting_Widget SHALL reject the input and display an error message indicating the character limit, without modifying the stored name.

---

### Requirement 2: Configurable Focus Timer

**User Story:** As a User, I want a configurable countdown timer with start, stop, and reset controls, so that I can run focused work sessions of my chosen duration.

#### Acceptance Criteria

1. THE Timer_Widget SHALL initialize with a default Focus_Duration of 25 minutes on first load.
2. WHEN the User changes the Focus_Duration input to a positive integer between 1 and 999 and saves it, THE Timer_Widget SHALL update the countdown display to the new duration in MM:SS format, where seconds display as 00.
3. WHEN the User clicks the Start button while the timer is stopped, THE Timer_Widget SHALL begin counting down one second per real second, decrementing the display each second within ±50 milliseconds of the target interval.
4. WHEN the User clicks the Stop button while the timer is running, THE Timer_Widget SHALL pause the countdown at its current value without altering the remaining time by more than one second.
5. WHEN the User clicks the Reset button, THE Timer_Widget SHALL stop the countdown and restore the display to the current Focus_Duration in MM:SS format.
6. WHEN the countdown reaches 00:00, THE Timer_Widget SHALL stop automatically and display a persistent visual indicator distinct from the running state, such as a changed background color or icon, until the User clicks Reset or Start.
7. THE Timer_Widget SHALL display the remaining time in MM:SS format at all times, where MM is zero-padded to two digits and SS is zero-padded to two digits.
8. IF the User enters a Focus_Duration value outside the range 1–999, THEN THE Timer_Widget SHALL reject the input, retain the last valid Focus_Duration without resetting an in-progress countdown, and display an inline error message indicating the valid range.
9. WHEN the User clicks the Start button while the timer is already running, THE Timer_Widget SHALL ignore the action and continue the countdown without interruption.

---

### Requirement 3: To-Do List

**User Story:** As a User, I want to add, edit, complete, delete, and sort tasks, so that I can track my daily work and stay organized.

#### Acceptance Criteria

1. WHEN the User submits a non-empty task description of 1 to 200 characters, THE Todo_Widget SHALL add the Task to the list and persist all tasks to Storage.
2. IF the User submits an empty task description, THEN THE Todo_Widget SHALL not add a Task and SHALL display an inline validation message indicating the description is required.
3. IF the User submits a task description exceeding 200 characters, THEN THE Todo_Widget SHALL not add a Task and SHALL display an inline validation message indicating the maximum length.
4. WHEN the User clicks the complete control on a Task, THE Todo_Widget SHALL toggle the Task's completion state and persist the updated list to Storage.
5. WHEN the User clicks the delete control on a Task, THE Todo_Widget SHALL remove the Task from the list and persist the updated list to Storage.
6. WHEN the User activates the edit control on a Task, THE Todo_Widget SHALL display the Task's current description in an editable field.
7. WHEN the User saves an edited Task with a non-empty description of 1 to 200 characters, THE Todo_Widget SHALL update the Task's description and persist the updated list to Storage.
8. IF the User saves an edited Task with an empty description, THEN THE Todo_Widget SHALL retain the original Task description without modification and SHALL display an inline validation message indicating the description is required.
9. WHEN the User selects the sort option "By Name (A–Z)", THE Todo_Widget SHALL reorder tasks alphabetically by description in ascending order using case-insensitive comparison.
10. WHEN the User selects the sort option "By Status", THE Todo_Widget SHALL reorder tasks so incomplete tasks appear before completed tasks, preserving the relative order of tasks within each group.
11. WHEN the Dashboard loads, THE Todo_Widget SHALL restore and display all tasks previously saved in Storage within 2 seconds.

---

### Requirement 4: Quick Links

**User Story:** As a User, I want to save and launch favorite website links as buttons, so that I can reach frequently used sites with one click.

#### Acceptance Criteria

1. WHEN the User submits a Quick_Link with a label of 1–50 characters and a URL that begins with `http://` or `https://` and contains a valid domain, THE Links_Widget SHALL add the Quick_Link as a button and persist all Quick_Links to Storage.
2. IF the User submits a Quick_Link with an empty label, a label exceeding 50 characters, or a URL that does not begin with `http://` or `https://` or lacks a valid domain, THEN THE Links_Widget SHALL reject the entry and display an inline validation message indicating which field is invalid.
3. WHEN the User clicks a Quick_Link button, THE Links_Widget SHALL open the associated URL in a new browser tab.
4. WHEN the User clicks the delete control on a Quick_Link, THE Links_Widget SHALL remove the Quick_Link and persist the updated list to Storage.
5. WHEN the Dashboard loads, THE Links_Widget SHALL restore and display all Quick_Links previously saved in Storage.
6. IF the User attempts to add a Quick_Link when 20 Quick_Links are already saved, THEN THE Links_Widget SHALL reject the entry and display an inline message indicating the maximum limit has been reached.
7. IF Storage is unavailable when the Links_Widget attempts to persist or restore Quick_Links, THEN THE Links_Widget SHALL display an error message indicating that saving or loading failed, and SHALL NOT modify the currently displayed Quick_Links.

---

### Requirement 5: Light / Dark Mode

**User Story:** As a User, I want to toggle between a light and dark color scheme, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a visible toggle control for switching between light and dark Theme.
2. WHEN the User activates the Theme toggle, THE Dashboard SHALL switch all visible styles to the selected Theme immediately without a page reload.
3. THE Dashboard SHALL persist the selected Theme to Storage.
4. WHEN the Dashboard loads, THE Dashboard SHALL restore and apply the previously saved Theme.
5. IF no Theme has been saved, THEN THE Dashboard SHALL apply the Theme that matches the User's operating system preference (`prefers-color-scheme`).

---

### Requirement 6: Visual Design and Layout

**User Story:** As a User, I want a clean, minimalistic, and modern interface, so that the Dashboard is visually appealing and easy to use at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL present all four widgets — Greeting_Widget, Timer_Widget, Todo_Widget, and Links_Widget — on a single HTML page with no navigation or page transitions.
2. THE Dashboard SHALL apply consistent spacing, font sizes, and color contrast across all widgets so that content is legible without zooming.
3. THE Dashboard SHALL use a single CSS file located at `css/style.css` for all styling.
4. THE Dashboard SHALL use a single JavaScript file located at `js/app.js` for all behavior.
5. WHILE the viewport width is 768 px or wider, THE Dashboard SHALL display widgets in a multi-column grid layout.
6. WHILE the viewport width is below 768 px, THE Dashboard SHALL collapse to a single-column stacked layout.
7. THE Dashboard SHALL load and reach a fully interactive state within 2 seconds on a standard broadband connection.

---

### Requirement 7: Data Persistence and Compatibility

**User Story:** As a User, I want my data saved automatically, so that tasks, links, settings, and preferences survive page reloads and browser restarts.

#### Acceptance Criteria

1. THE Storage SHALL persist tasks, Quick_Links, user name, Focus_Duration, and Theme as separate keys in `localStorage`.
2. THE Dashboard SHALL function correctly in the latest stable releases of Chrome, Firefox, Edge, and Safari.
3. THE Dashboard SHALL require no external dependencies, build tools, or backend server to operate.
4. IF `localStorage` is unavailable or throws an access error, THEN THE Dashboard SHALL display a warning message and operate in a non-persistent session mode without crashing.
