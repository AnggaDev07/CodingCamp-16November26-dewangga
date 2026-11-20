/* ==========================================================================
   To-Do Life Dashboard — app.js
   Single JavaScript file for all dashboard behaviour.
   No imports, no require, no npm dependencies.
   ========================================================================== */

/* ==========================================================================
   Task 3.1: Storage helper layer
   Requirements: 7.1, 7.4
   ========================================================================== */

/* --------------------------------------------------------------------------
   Storage key constants
   All keys are namespaced with the "tld_" prefix to avoid collisions.
   -------------------------------------------------------------------------- */
var KEY_TASKS    = 'tld_tasks';
var KEY_LINKS    = 'tld_links';
var KEY_NAME     = 'tld_name';
var KEY_DURATION = 'tld_focusDuration';
var KEY_THEME    = 'tld_theme';

/**
 * storage_get(key)
 * Reads a value from localStorage and parses it as JSON.
 * Returns the parsed value, or null if the key is absent.
 * Returns { ok: false, error } if localStorage throws.
 *
 * @param {string} key
 * @returns {*|null|{ok:false, error:Error}}
 */
function storage_get(key) {
  try {
    var raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch (err) {
    return { ok: false, error: err };
  }
}

/**
 * storage_set(key, value)
 * Serialises value as JSON and writes it to localStorage.
 * Returns { ok: true } on success.
 * Returns { ok: false, error } if localStorage throws.
 *
 * @param {string} key
 * @param {*}      value
 * @returns {{ok:boolean, error?:Error}}
 */
function storage_set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/**
 * storage_isAvailable()
 * Performs a test-write / test-read / test-delete cycle to confirm that
 * localStorage is accessible in the current browser context.
 * Returns true if available, false otherwise.
 * When unavailable, reveals the #storage-banner element.
 *
 * @returns {boolean}
 */
function storage_isAvailable() {
  var SENTINEL_KEY = '__tld_storage_test__';
  var SENTINEL_VAL = '1';
  try {
    localStorage.setItem(SENTINEL_KEY, SENTINEL_VAL);
    var readBack = localStorage.getItem(SENTINEL_KEY);
    localStorage.removeItem(SENTINEL_KEY);
    if (readBack !== SENTINEL_VAL) {
      storage_showBanner();
      return false;
    }
    return true;
  } catch (err) {
    storage_showBanner();
    return false;
  }
}

/**
 * storage_showBanner()
 * Reveals the persistent #storage-banner element so the user knows that
 * data will not be saved during this session.
 */
function storage_showBanner() {
  var banner = document.getElementById('storage-banner');
  if (banner) {
    banner.hidden = false;
  }
}

/* ==========================================================================
   Task 4.1: Theme module
   Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   ========================================================================== */

/**
 * theme_apply(isDark)
 * Adds or removes the `.dark` class on <html> based on the boolean argument.
 *
 * @param {boolean} isDark
 */
function theme_apply(isDark) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * theme_load()
 * Reads the saved theme from storage (key: tld_theme).
 * If no value is stored, falls back to the OS prefers-color-scheme setting.
 * Applies the resolved theme immediately by toggling .dark on <html>.
 * Also attaches the click listener to #theme-toggle.
 *
 * Requirements: 5.4, 5.5
 */
function theme_load() {
  var stored = storage_get(KEY_THEME);

  var isDark;
  if (stored === 'dark') {
    isDark = true;
  } else if (stored === 'light') {
    isDark = false;
  } else {
    // No saved preference — defer to OS setting (Requirement 5.5)
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  theme_apply(isDark);

  // Attach the toggle button listener here so it is ready after theme_load()
  var btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', theme_toggle);
  }
}

/**
 * theme_toggle()
 * Flips the .dark class on <html>, then persists the new value to storage.
 *
 * Requirements: 5.1, 5.2, 5.3
 */
function theme_toggle() {
  var isDark = document.documentElement.classList.toggle('dark');
  storage_set(KEY_THEME, isDark ? 'dark' : 'light');
}

/* ==========================================================================
   Task 5.1: Greeting pure helper functions
   Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8
   ========================================================================== */

var GREETING_DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var GREETING_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * greeting_getGreeting(hour)
 * Maps a 0–23 hour value to one of four greeting strings.
 *
 *   5–11  → "Good Morning"
 *  12–17  → "Good Afternoon"
 *  18–20  → "Good Evening"
 *  21–23 and 0–4 → "Good Night"
 *
 * @param {number} hour  Integer in [0, 23]
 * @returns {string}
 */
function greeting_getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 20) return 'Good Evening';
  return 'Good Night';
}

/**
 * greeting_formatTime(date)
 * Returns the time portion of a Date as "HH:MM:SS" with zero-padding.
 * e.g. new Date with hour=9, minute=5, second=3 → "09:05:03"
 *
 * @param {Date} date
 * @returns {string}
 */
function greeting_formatTime(date) {
  var hh = String(date.getHours()).padStart(2, '0');
  var mm = String(date.getMinutes()).padStart(2, '0');
  var ss = String(date.getSeconds()).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

/**
 * greeting_formatDate(date)
 * Returns the date as "DayName, DD MonthName YYYY".
 * e.g. "Monday, 16 November 2026"
 *
 * @param {Date} date
 * @returns {string}
 */
function greeting_formatDate(date) {
  var dayName   = GREETING_DAYS[date.getDay()];
  var dd        = String(date.getDate()).padStart(2, '0');
  var monthName = GREETING_MONTHS[date.getMonth()];
  var yyyy      = date.getFullYear();
  return dayName + ', ' + dd + ' ' + monthName + ' ' + yyyy;
}

/**
 * greeting_buildText(hour, name)
 * Combines the greeting for the given hour with an optional name.
 * Returns "[Greeting], [Name]!" when name is non-empty after trimming,
 * or "[Greeting]!" otherwise.
 *
 * @param {number} hour  Integer in [0, 23]
 * @param {string} name  May be empty or whitespace-only
 * @returns {string}
 */
function greeting_buildText(hour, name) {
  var greeting = greeting_getGreeting(hour);
  var trimmed  = (name || '').trim();
  if (trimmed.length > 0) {
    return greeting + ', ' + trimmed + '!';
  }
  return greeting + '!';
}

/* ==========================================================================
   Task 5.3: Greeting DOM functions — greeting_tick, greeting_saveName,
             initGreeting, startClock
   Requirements: 1.1, 1.2, 1.7, 1.8, 1.9, 1.10, 1.11
   ========================================================================== */

/**
 * greeting_tick()
 * Called every 1 000 ms (and once immediately on load) to refresh the
 * clock, date, and greeting text from the current time and stored name.
 *
 * Requirements: 1.1, 1.2, 1.7, 1.8
 */
function greeting_tick() {
  var now  = new Date();
  var hour = now.getHours();

  var clockEl    = document.getElementById('clock');
  var dateEl     = document.getElementById('date-display');
  var greetingEl = document.getElementById('greeting-text');

  if (clockEl)    clockEl.textContent    = greeting_formatTime(now);
  if (dateEl)     dateEl.textContent     = greeting_formatDate(now);

  if (greetingEl) {
    var storedName = storage_get(KEY_NAME);
    var name = (typeof storedName === 'string') ? storedName : '';
    greetingEl.textContent = greeting_buildText(hour, name);
  }
}

/**
 * greeting_saveName(value)
 * Validates the supplied name and, if valid, persists it then refreshes
 * the greeting.
 *
 *  - Empty string ("")   → no-op; retain stored name; return { ok: true }
 *  - 1–50 characters    → persist, call greeting_tick(), return { ok: true }
 *  - > 50 characters    → show error, do NOT modify storage, return { ok: false }
 *  - Non-string          → show error, do NOT modify storage, return { ok: false }
 *
 * @param {string} value
 * @returns {{ ok: boolean, error?: string }}
 */
function greeting_saveName(value) {
  var errorEl = document.getElementById('name-error');

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';

  // Guard: must be a string
  if (typeof value !== 'string') {
    var msg = 'Name must be a text string.';
    if (errorEl) errorEl.textContent = msg;
    return { ok: false, error: msg };
  }

  // Empty string → silent no-op (Requirement 1.10)
  if (value.length === 0) {
    return { ok: true };
  }

  // Too long → reject (Requirement 1.11)
  if (value.length > 50) {
    var tooLongMsg = 'Name must be 50 characters or fewer.';
    if (errorEl) errorEl.textContent = tooLongMsg;
    return { ok: false, error: tooLongMsg };
  }

  // Valid 1–50 chars → persist and refresh (Requirement 1.9)
  storage_set(KEY_NAME, value);
  greeting_tick();
  return { ok: true };
}

/**
 * initGreeting()
 * Reads the stored name, pre-fills the name input, fires an immediate
 * greeting_tick(), and wires up the name form submit handler.
 *
 * Requirements: 1.1, 1.2, 1.7, 1.8, 1.9, 1.10, 1.11
 */
function initGreeting() {
  var storedName = storage_get(KEY_NAME);
  var nameInput  = document.getElementById('name-input');
  if (nameInput) {
    nameInput.value = (typeof storedName === 'string') ? storedName : '';
  }

  // Show current time / date / greeting immediately (before the first tick)
  greeting_tick();

  // Attach form submit listener
  var nameForm = document.getElementById('name-form');
  if (nameForm) {
    nameForm.addEventListener('submit', function (event) {
      event.preventDefault();

      // Clear error on each submission attempt
      var errorEl = document.getElementById('name-error');
      if (errorEl) errorEl.textContent = '';

      var input   = document.getElementById('name-input');
      var trimmed = input ? input.value.trim() : '';

      greeting_saveName(trimmed);
    });
  }
}

/**
 * startClock()
 * Starts the 1-second interval that keeps the clock and greeting current.
 * Must be called after initGreeting() so the DOM is already populated.
 *
 * Requirements: 1.1
 */
function startClock() {
  setInterval(greeting_tick, 1000);
}

/* ==========================================================================
   Task 7.1: Timer module — state variables and helper functions
   Requirements: 2.1, 2.2, 2.7, 2.8
   ========================================================================== */

/* --------------------------------------------------------------------------
   Module-level state variables
   -------------------------------------------------------------------------- */

/** setInterval handle; null when the timer is stopped */
var timer_intervalId = null;

/** Seconds remaining in the current countdown */
var timer_remaining = 0;

/**
 * Current configured focus duration in seconds.
 * Default is 25 minutes (Requirement 2.1).
 */
var timer_focusDuration = 25 * 60; // 1500 seconds

/** True while the countdown is actively running */
var timer_isRunning = false;

/**
 * timer_formatDisplay(seconds)
 * Converts a non-negative integer number of seconds to a "MM:SS" string
 * with both components zero-padded to two digits.
 *
 * Examples:
 *   0   → "00:00"
 *   90  → "01:30"
 *   3600 → "60:00"
 *
 * Requirements: 2.2, 2.7
 *
 * @param {number} seconds  Non-negative integer
 * @returns {string}
 */
function timer_formatDisplay(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

/**
 * timer_setDuration(minutes)
 * Validates the supplied duration, updates module state, persists the value,
 * and refreshes the display when the timer is not running.
 *
 * Validation rules (Requirement 2.8):
 *  - `minutes` must be an integer in [1, 999]
 *  - On failure: populate #duration-error, return { ok: false }, do NOT
 *    alter timer_focusDuration or reset any in-progress countdown.
 *
 * On success (Requirements 2.2, 2.7):
 *  - Set timer_focusDuration = minutes * 60
 *  - Persist via storage_set(KEY_DURATION, minutes)
 *  - If timer is NOT running, update #timer-display
 *  - Clear #duration-error
 *  - Return { ok: true }
 *
 * @param {number} minutes
 * @returns {{ ok: boolean }}
 */
function timer_setDuration(minutes) {
  var errorEl = document.getElementById('duration-error');

  // Validate: must be an integer in [1, 999]
  if (
    typeof minutes !== 'number' ||
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 999
  ) {
    var msg = 'Duration must be between 1 and 999 minutes.';
    if (errorEl) errorEl.textContent = msg;
    return { ok: false };
  }

  // Valid input — update state
  timer_focusDuration = minutes * 60;
  storage_set(KEY_DURATION, minutes);

  // Update display only when timer is not currently running (Requirement 2.8)
  if (!timer_isRunning) {
    var displayEl = document.getElementById('timer-display');
    if (displayEl) displayEl.textContent = timer_formatDisplay(timer_focusDuration);
  }

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';

  return { ok: true };
}

/* ==========================================================================
   Task 7.3: Timer state-machine functions and initTimer()
   Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.9
   ========================================================================== */

/**
 * timer_tick()
 * Called every 1 000 ms by the running interval. Decrements timer_remaining
 * by 1, clamps to 0 (never negative), updates #timer-display, and triggers
 * timer_onComplete() when the countdown reaches zero.
 *
 * Requirements: 2.3, 2.6
 */
function timer_tick() {
  timer_remaining -= 1;
  if (timer_remaining < 0) {
    timer_remaining = 0;
  }

  var displayEl = document.getElementById('timer-display');
  if (displayEl) {
    displayEl.textContent = timer_formatDisplay(timer_remaining);
  }

  if (timer_remaining === 0) {
    timer_onComplete();
  }
}

/**
 * timer_start()
 * Begins the countdown by setting a 1-second interval.
 * No-op if the timer is already running (Requirement 2.9).
 *
 * Requirements: 2.3, 2.9
 */
function timer_start() {
  if (timer_isRunning) {
    return; // already running — ignore (Requirement 2.9)
  }
  timer_isRunning = true;
  timer_intervalId = setInterval(timer_tick, 1000);
}

/**
 * timer_stop()
 * Pauses the countdown by clearing the interval and marking the timer as
 * not running. Does not alter the remaining time.
 *
 * Requirements: 2.4
 */
function timer_stop() {
  clearInterval(timer_intervalId);
  timer_isRunning = false;
}

/**
 * timer_reset()
 * Stops the countdown, restores remaining time to the full focus duration,
 * refreshes the display, and removes the completion indicator.
 *
 * Requirements: 2.5
 */
function timer_reset() {
  timer_stop();
  timer_remaining = timer_focusDuration;

  var displayEl = document.getElementById('timer-display');
  if (displayEl) {
    displayEl.textContent = timer_formatDisplay(timer_remaining);
  }

  var widgetEl = document.getElementById('timer-widget');
  if (widgetEl) {
    widgetEl.classList.remove('timer-complete');
  }
}

/**
 * timer_onComplete()
 * Called when the countdown reaches zero. Stops the timer and applies the
 * visual completion indicator (.timer-complete on #timer-widget).
 *
 * Requirements: 2.6
 */
function timer_onComplete() {
  timer_stop();

  var widgetEl = document.getElementById('timer-widget');
  if (widgetEl) {
    widgetEl.classList.add('timer-complete');
  }
}

/**
 * initTimer()
 * Bootstraps the timer widget:
 *  1. Reads the stored focus duration from localStorage (default: 25 minutes).
 *  2. Initialises timer_focusDuration and timer_remaining.
 *  3. Updates #timer-display to show the initial duration.
 *  4. Attaches click listeners to #btn-start, #btn-stop, #btn-reset.
 *  5. Attaches a submit listener to #duration-form that reads #duration-input
 *     and calls timer_setDuration().
 *
 * Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.8, 2.9
 */
function initTimer() {
  // 1. Read stored duration; fall back to 25 if absent or invalid
  var stored = storage_get(KEY_DURATION);
  var storedMinutes = (typeof stored === 'number' && stored >= 1 && stored <= 999)
    ? stored
    : 25;

  // 2. Initialise module state
  timer_focusDuration = storedMinutes * 60;
  timer_remaining     = timer_focusDuration;

  // 3. Populate the display
  var displayEl = document.getElementById('timer-display');
  if (displayEl) {
    displayEl.textContent = timer_formatDisplay(timer_remaining);
  }

  // 4. Control button listeners
  var btnStart = document.getElementById('btn-start');
  var btnStop  = document.getElementById('btn-stop');
  var btnReset = document.getElementById('btn-reset');

  if (btnStart) btnStart.addEventListener('click', timer_start);
  if (btnStop)  btnStop.addEventListener('click', timer_stop);
  if (btnReset) btnReset.addEventListener('click', timer_reset);

  // 5. Duration-form submit listener
  var durationForm = document.getElementById('duration-form');
  if (durationForm) {
    durationForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var input   = document.getElementById('duration-input');
      var minutes = input ? parseInt(input.value, 10) : NaN;

      timer_setDuration(minutes);
    });
  }
}

/* ==========================================================================
   Task 8.1: Todo module — data layer (todo_tasks, todo_persist, todo_load)
   Requirements: 3.11, 7.1
   ========================================================================== */

/* --------------------------------------------------------------------------
   Module-level state
   -------------------------------------------------------------------------- */

/**
 * In-memory array of Task objects.
 * Shape: { id: string, description: string, completed: boolean, createdAt: number }
 */
var todo_tasks = [];

/**
 * todo_persist()
 * Writes the current todo_tasks array to localStorage under KEY_TASKS.
 * On storage failure, populates #task-error with an inline error message.
 *
 * Requirements: 7.1
 */
function todo_persist() {
  var result = storage_set(KEY_TASKS, todo_tasks);
  if (result && result.ok === false) {
    var errorEl = document.getElementById('task-error');
    if (errorEl) {
      errorEl.textContent = 'Failed to save tasks.';
    }
  }
}

/**
 * todo_load()
 * Reads the task array from localStorage under KEY_TASKS.
 * Sets todo_tasks to the retrieved array, or [] if the key is absent or
 * the value is not a valid array (including storage errors).
 * Calls todo_render() to update the DOM.
 *
 * Requirements: 3.11, 7.1
 */
function todo_load() {
  var result = storage_get(KEY_TASKS);

  // storage_get returns null when key is absent, or { ok: false } on error
  if (Array.isArray(result)) {
    todo_tasks = result;
  } else {
    todo_tasks = [];
  }

  // todo_render may be defined later in the file; call it if available
  if (typeof todo_render === 'function') {
    todo_render();
  }
}

/* ==========================================================================
   Task 8.3: Todo mutation functions — todo_add, todo_delete, todo_toggle
   Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   ========================================================================== */

/**
 * todo_add(description)
 * Validates the description, then adds a new task to todo_tasks.
 *
 * Validation rules (Requirements 3.1, 3.2, 3.3):
 *  - Empty string (length 0) → populate #task-error with
 *    "Task description is required.", return early.
 *  - Length > 200 → populate #task-error with
 *    "Task description must be 200 characters or fewer.", return early.
 *  - Valid (1–200 chars) → push task, call todo_persist() and todo_render(),
 *    clear #task-error.
 *
 * @param {string} description
 */
function todo_add(description) {
  var errorEl = document.getElementById('task-error');

  // Validate: empty
  if (!description || description.length === 0) {
    if (errorEl) errorEl.textContent = 'Task description is required.';
    return;
  }

  // Validate: too long
  if (description.length > 200) {
    if (errorEl) errorEl.textContent = 'Task description must be 200 characters or fewer.';
    return;
  }

  // Valid — build and append the new task object
  var newTask = {
    id: crypto.randomUUID(),
    description: description,
    completed: false,
    createdAt: Date.now()
  };

  todo_tasks.push(newTask);
  todo_persist();

  if (typeof todo_render === 'function') {
    todo_render();
  }

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';
}

/**
 * todo_delete(id)
 * Removes the task with the matching id from todo_tasks, then persists
 * and re-renders.
 *
 * Requirements: 3.5
 *
 * @param {string} id  UUID of the task to remove
 */
function todo_delete(id) {
  var index = -1;
  for (var i = 0; i < todo_tasks.length; i++) {
    if (todo_tasks[i].id === id) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    todo_tasks.splice(index, 1);
    todo_persist();

    if (typeof todo_render === 'function') {
      todo_render();
    }
  }
}

/**
 * todo_toggle(id)
 * Flips the `completed` boolean of the task with the matching id, then
 * persists and re-renders.
 *
 * Requirements: 3.4, 3.6
 *
 * @param {string} id  UUID of the task to toggle
 */
function todo_toggle(id) {
  for (var i = 0; i < todo_tasks.length; i++) {
    if (todo_tasks[i].id === id) {
      todo_tasks[i].completed = !todo_tasks[i].completed;
      todo_persist();

      if (typeof todo_render === 'function') {
        todo_render();
      }

      break;
    }
  }
}

/* ==========================================================================
   Task 8.5: Todo edit and sort functions
   Requirements: 3.6, 3.7, 3.8, 3.9, 3.10
   ========================================================================== */

/**
 * todo_startEdit(id)
 * Switches a rendered task item from view mode to edit mode.
 *
 * - Finds the <li data-id="{id}"> element in #task-list.
 * - Replaces the <span class="task-text"> with an <input> pre-filled with
 *   the task's current description.
 * - Replaces the <button class="btn-edit"> with a save <button class="btn-save">
 *   whose click handler calls todo_saveEdit(id, input.value).
 *
 * Requirements: 3.6
 *
 * @param {string} id  UUID of the task to edit
 */
function todo_startEdit(id) {
  var li = document.querySelector('#task-list li[data-id="' + id + '"]');
  if (!li) return;

  // Find the current description from the in-memory array
  var task = null;
  for (var i = 0; i < todo_tasks.length; i++) {
    if (todo_tasks[i].id === id) {
      task = todo_tasks[i];
      break;
    }
  }
  if (!task) return;

  // Replace <span class="task-text"> with an <input>
  var span = li.querySelector('.task-text');
  if (!span) return;

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.description;
  input.maxLength = 200;
  li.replaceChild(input, span);
  input.focus();

  // Replace <button class="btn-edit"> with a save button
  var editBtn = li.querySelector('.btn-edit');
  if (editBtn) {
    var saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.setAttribute('aria-label', 'Save edit');
    saveBtn.textContent = '💾 Save';

    // Capture the input reference in the closure
    (function (capturedInput, capturedId) {
      saveBtn.addEventListener('click', function () {
        todo_saveEdit(capturedId, capturedInput.value);
      });
    }(input, id));

    li.replaceChild(saveBtn, editBtn);
  }
}

/**
 * todo_saveEdit(id, value)
 * Commits or rejects an in-progress edit.
 *
 * Validation rules (Requirements 3.7, 3.8):
 *  - Empty string (length 0 after trimming is NOT applied — raw value is used
 *    per requirement 3.8 "empty description") → populate #task-error with
 *    "Task description is required." and call todo_render() to revert.
 *  - 1–200 characters → update description in todo_tasks, call
 *    todo_persist() and todo_render(), clear #task-error.
 *  - > 200 characters → populate #task-error and call todo_render() to revert.
 *
 * Requirements: 3.7, 3.8
 *
 * @param {string} id     UUID of the task being edited
 * @param {string} value  The new description value from the edit input
 */
function todo_saveEdit(id, value) {
  var errorEl = document.getElementById('task-error');

  // Guard: empty value → revert and show error (Requirement 3.8)
  if (!value || value.length === 0) {
    if (errorEl) errorEl.textContent = 'Task description is required.';
    if (typeof todo_render === 'function') todo_render();
    return;
  }

  // Guard: too long → revert and show error
  if (value.length > 200) {
    if (errorEl) errorEl.textContent = 'Task description must be 200 characters or fewer.';
    if (typeof todo_render === 'function') todo_render();
    return;
  }

  // Valid — update in-memory task (Requirement 3.7)
  for (var i = 0; i < todo_tasks.length; i++) {
    if (todo_tasks[i].id === id) {
      todo_tasks[i].description = value;
      break;
    }
  }

  todo_persist();

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';

  if (typeof todo_render === 'function') todo_render();
}

/**
 * todo_sort(mode)
 * Sorts todo_tasks in-place according to the specified mode, then re-renders.
 *
 * Modes:
 *  'name'   — case-insensitive ascending sort by description (Requirement 3.9)
 *  'status' — stable sort: incomplete tasks first, then completed tasks;
 *             relative order within each group is preserved (Requirement 3.10)
 *
 * @param {string} mode  Either 'name' or 'status'
 */
function todo_sort(mode) {
  if (mode === 'name') {
    // Case-insensitive ascending sort (Requirement 3.9)
    todo_tasks.sort(function (a, b) {
      var aLower = a.description.toLowerCase();
      var bLower = b.description.toLowerCase();
      if (aLower < bLower) return -1;
      if (aLower > bLower) return 1;
      return 0;
    });
  } else if (mode === 'status') {
    // Stable sort: incomplete (false) before completed (true).
    // Array.prototype.sort is stable in all modern engines (ES2019+), but to
    // guarantee stability in older environments we use an index-tagged sort.
    var indexed = todo_tasks.map(function (task, index) {
      return { task: task, index: index };
    });

    indexed.sort(function (a, b) {
      // false (0) sorts before true (1)
      var aVal = a.task.completed ? 1 : 0;
      var bVal = b.task.completed ? 1 : 0;
      if (aVal !== bVal) return aVal - bVal;
      // Preserve original relative order within the same group
      return a.index - b.index;
    });

    for (var i = 0; i < indexed.length; i++) {
      todo_tasks[i] = indexed[i].task;
    }
  }

  if (typeof todo_render === 'function') {
    todo_render();
  }
}

/* ==========================================================================
   Task 8.7: todo_render() and initTodo()
   Requirements: 3.1, 3.4, 3.5, 3.6, 3.9, 3.10, 3.11
   ========================================================================== */

/**
 * todo_render()
 * Fully re-renders #task-list from the in-memory todo_tasks array.
 *
 * For each task, creates:
 *   <li data-id="{id}">
 *     <button class="btn-complete" [class="completed"] [aria-label="..."]>
 *     <span class="task-text" [class="completed"]>{description}</span>
 *     <button class="btn-edit" aria-label="Edit">
 *     <button class="btn-delete" aria-label="Delete">
 *   </li>
 *
 * Event listeners are attached inline during render.
 *
 * Requirements: 3.4, 3.5, 3.6
 */
function todo_render() {
  var list = document.getElementById('task-list');
  if (!list) return;

  // Clear existing content
  list.innerHTML = '';

  for (var i = 0; i < todo_tasks.length; i++) {
    var task = todo_tasks[i];

    // <li data-id="{id}">
    var li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    if (task.completed) {
      li.classList.add('completed');
    }

    // Complete toggle button
    var completeBtn = document.createElement('button');
    completeBtn.className = 'btn-complete' + (task.completed ? ' completed' : '');
    completeBtn.setAttribute(
      'aria-label',
      task.completed ? 'Mark incomplete' : 'Toggle complete'
    );
    completeBtn.textContent = task.completed ? '✅' : '☐';
    // Capture task.id in closure
    (function (id) {
      completeBtn.addEventListener('click', function () {
        todo_toggle(id);
      });
    }(task.id));
    li.appendChild(completeBtn);

    // Task text span
    var span = document.createElement('span');
    span.className = 'task-text' + (task.completed ? ' completed' : '');
    span.textContent = task.description;
    li.appendChild(span);

    // Edit button
    var editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.setAttribute('aria-label', 'Edit');
    editBtn.textContent = '✏️';
    (function (id) {
      editBtn.addEventListener('click', function () {
        todo_startEdit(id);
      });
    }(task.id));
    li.appendChild(editBtn);

    // Delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', 'Delete');
    deleteBtn.textContent = '🗑️';
    (function (id) {
      deleteBtn.addEventListener('click', function () {
        todo_delete(id);
      });
    }(task.id));
    li.appendChild(deleteBtn);

    list.appendChild(li);
  }
}

/**
 * initTodo()
 * Bootstraps the to-do widget:
 *  1. Calls todo_load() to restore tasks from storage and trigger initial render.
 *  2. Attaches a submit listener to #add-task-form that calls
 *     todo_add(taskInput.value.trim()) and clears the input on success.
 *  3. Attaches click listeners to each [data-sort] button in #sort-controls
 *     that call todo_sort(button.dataset.sort) followed by todo_render().
 *
 * Requirements: 3.1, 3.9, 3.10, 3.11
 */
function initTodo() {
  // 1. Restore tasks from storage and render
  todo_load();

  // 2. Add-task form submit handler
  var addForm = document.getElementById('add-task-form');
  if (addForm) {
    addForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var input = document.getElementById('task-input');
      if (!input) return;

      var trimmed = input.value.trim();
      var before  = todo_tasks.length;

      todo_add(trimmed);

      // Clear the input only when a task was actually added (list grew by one)
      if (todo_tasks.length > before) {
        input.value = '';
      }
    });
  }

  // 3. Sort-control button click handlers
  var sortButtons = document.querySelectorAll('#sort-controls [data-sort]');
  for (var i = 0; i < sortButtons.length; i++) {
    (function (btn) {
      btn.addEventListener('click', function () {
        todo_sort(btn.dataset.sort);
        // todo_sort already calls todo_render() internally, but calling it
        // explicitly here makes the dependency clear and matches the spec.
        todo_render();
      });
    }(sortButtons[i]));
  }
}

/* ==========================================================================
   Task 10.1: Quick Links module — data layer
   links_validateUrl(), links_persist(), links_load()
   Requirements: 4.5, 4.7, 7.1
   ========================================================================== */

/* --------------------------------------------------------------------------
   Module-level state
   -------------------------------------------------------------------------- */

/**
 * In-memory array of QuickLink objects.
 * Shape: { id: string, label: string, url: string }
 */
var links_items = [];

/**
 * links_validateUrl(url)
 * Two-step URL validation:
 *  1. String prefix must be "http://" or "https://" — fast reject before
 *     attempting URL construction.
 *  2. Attempt `new URL(url)` inside try/catch — catches malformed URLs such
 *     as "https://" with no host.
 *
 * Returns { ok: true } when both checks pass.
 * Returns { ok: false, error: string } on the first failing check.
 *
 * Requirements: 4.1, 4.2
 *
 * @param {string} url
 * @returns {{ ok: boolean, error?: string }}
 */
function links_validateUrl(url) {
  if (typeof url !== 'string' ||
      (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return { ok: false, error: 'URL must start with http:// or https://' };
  }

  try {
    new URL(url);
  } catch (e) {
    return { ok: false, error: 'URL is not valid' };
  }

  return { ok: true };
}

/**
 * links_persist()
 * Writes the current links_items array to localStorage under KEY_LINKS.
 * On storage failure, populates #link-error with an inline error message
 * without modifying the currently displayed list.
 *
 * Requirements: 4.7, 7.1
 */
function links_persist() {
  var result = storage_set(KEY_LINKS, links_items);
  if (result && result.ok === false) {
    var errorEl = document.getElementById('link-error');
    if (errorEl) {
      errorEl.textContent = 'Failed to save links.';
    }
  }
}

/**
 * links_load()
 * Reads the quick-links array from localStorage under KEY_LINKS.
 *  - If the result is a valid non-null array, sets links_items to it.
 *  - If the result is null (key absent), sets links_items = [].
 *  - If storage throws (result.ok === false), shows the storage banner,
 *    sets links_items = [], and does NOT modify the currently displayed list.
 * Calls links_render() to sync the DOM.
 *
 * Requirements: 4.5, 4.7, 7.1
 */
function links_load() {
  var result = storage_get(KEY_LINKS);

  // storage error — show banner and keep list empty (Requirement 4.7)
  if (result !== null && typeof result === 'object' && result.ok === false) {
    storage_showBanner();
    links_items = [];
    if (typeof links_render === 'function') {
      links_render();
    }
    return;
  }

  // Valid array — restore; null (absent key) → empty array
  if (Array.isArray(result)) {
    links_items = result;
  } else {
    links_items = [];
  }

  if (typeof links_render === 'function') {
    links_render();
  }
}

/* ==========================================================================
   Task 10.3: Quick Links mutation and render functions
   links_add(), links_delete(), links_render(), initLinks()
   Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7
   ========================================================================== */

/**
 * links_render()
 * Fully re-renders #links-list from the in-memory links_items array.
 *
 * For each item creates:
 *   <div class="link-item">
 *     <a href="{url}" target="_blank" rel="noopener noreferrer">{label}</a>
 *     <button class="btn-delete-link" aria-label="Delete link"></button>
 *   </div>
 *
 * Event listeners are attached inline during render.
 *
 * Requirements: 4.3, 4.4, 4.6
 */
function links_render() {
  var list = document.getElementById('links-list');
  if (!list) return;

  // Clear existing content
  list.innerHTML = '';

  for (var i = 0; i < links_items.length; i++) {
    var item = links_items[i];

    var div = document.createElement('div');
    div.className = 'link-item';

    var a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = item.label;
    div.appendChild(a);

    var deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete-link';
    deleteBtn.setAttribute('aria-label', 'Delete link');
    deleteBtn.textContent = '✕';
    // Capture item.id in closure
    (function (id) {
      deleteBtn.addEventListener('click', function () {
        links_delete(id);
      });
    }(item.id));
    div.appendChild(deleteBtn);

    list.appendChild(div);
  }
}

/**
 * links_add(label, url)
 * Validates label (1–50 chars) and url (via links_validateUrl), enforces the
 * 20-item cap, then pushes the new entry and persists + re-renders.
 *
 * On any validation failure, populates #link-error with the specific message
 * and returns without modifying links_items.
 *
 * On success, clears #link-error.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 *
 * @param {string} label
 * @param {string} url
 */
function links_add(label, url) {
  var errorEl = document.getElementById('link-error');

  // Validate label: must be 1–50 characters (Requirement 4.1)
  if (!label || label.length === 0) {
    if (errorEl) errorEl.textContent = 'Label is required.';
    return;
  }
  if (label.length > 50) {
    if (errorEl) errorEl.textContent = 'Label must be 50 characters or fewer.';
    return;
  }

  // Validate URL (Requirement 4.2)
  var urlCheck = links_validateUrl(url);
  if (!urlCheck.ok) {
    if (errorEl) errorEl.textContent = urlCheck.error;
    return;
  }

  // Enforce 20-item cap (Requirement 4.4)
  if (links_items.length >= 20) {
    if (errorEl) errorEl.textContent = 'Maximum of 20 links reached.';
    return;
  }

  // All checks passed — add item
  links_items.push({
    id: crypto.randomUUID(),
    label: label,
    url: url
  });

  links_persist();
  links_render();

  // Clear any previous error
  if (errorEl) errorEl.textContent = '';
}

/**
 * links_delete(id)
 * Removes the link with the matching id from links_items, then persists
 * and re-renders.
 *
 * Requirements: 4.6
 *
 * @param {string} id  UUID of the link to remove
 */
function links_delete(id) {
  var index = -1;
  for (var i = 0; i < links_items.length; i++) {
    if (links_items[i].id === id) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    links_items.splice(index, 1);
    links_persist();
    links_render();
  }
}

/**
 * initLinks()
 * Bootstraps the Quick Links widget:
 *  1. Calls links_load() to restore saved links from storage and render them.
 *  2. Attaches a submit listener to #add-link-form that reads #link-label
 *     and #link-url, calls links_add(), and resets the form on success.
 *
 * Requirements: 4.3, 4.6, 4.7
 */
function initLinks() {
  // 1. Restore links from storage and render
  links_load();

  // 2. Add-link form submit handler
  var addForm = document.getElementById('add-link-form');
  if (addForm) {
    addForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var labelInput = document.getElementById('link-label');
      var urlInput   = document.getElementById('link-url');

      var label = labelInput ? labelInput.value : '';
      var url   = urlInput   ? urlInput.value   : '';

      var before = links_items.length;

      links_add(label, url);

      // Reset the form only when a link was actually added (list grew by one)
      if (links_items.length > before) {
        addForm.reset();
      }
    });
  }
}

/* ==========================================================================
   Task 11.1: DOMContentLoaded initialisation sequence
   Requirements: 6.1, 6.7, 7.4
   ========================================================================== */

/**
 * Single entry-point listener that bootstraps every widget in the correct
 * order once the DOM is fully parsed.
 *
 * Order:
 *  1. storage_isAvailable() — reveal #storage-banner if storage is blocked
 *  2. theme_load()          — apply saved/OS theme before any content renders
 *  3. initGreeting()        — restore name, fire first tick
 *  4. initTimer()           — restore duration, wire controls
 *  5. initTodo()            — restore tasks, render list, wire form
 *  6. initLinks()           — restore links, render list, wire form
 *  7. startClock()          — start 1 s interval LAST, after all widgets ready
 *
 * Requirements: 6.1, 6.7, 7.4
 */
document.addEventListener('DOMContentLoaded', function () {
  // 1. Check storage availability; show banner if unavailable (Requirement 7.4)
  var storageOk = storage_isAvailable();
  if (!storageOk) {
    storage_showBanner();
  }

  // 2. Apply theme before widgets render to avoid a flash of wrong theme
  theme_load();

  // 3–6. Initialise each widget
  initGreeting();
  initTimer();
  initTodo();
  initLinks();

  // 7. Start the live clock last so the interval begins after all setup is done
  startClock();
});
