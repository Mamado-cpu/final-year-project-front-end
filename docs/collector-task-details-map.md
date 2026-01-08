## 📌 Feature Requirement: Collector Task Details & Map View

### Context

This feature applies when a **task is assigned to a collector** in the system.

---

### Functional Requirements

1. **Task Click → Task Details View**

   * When a collector clicks on an assigned task in the task list:

     * Navigate to a task details view (modal or page).
     * Fetch the full task record from the backend using the task ID.

2. **Task Details Must Display**
   The task details view must show the following information:

   * **Resident full name**
   * **Resident phone number**
   * **Task description** (booking or report description)
   * **Task type** (booking or report)
   * **Task status** (assigned / in-progress / completed)

3. **Resident Location on Map**

   * The task includes resident location coordinates:

     * `latitude`
     * `longitude`
   * These coordinates are provided by the resident during:

     * booking, or
     * reporting (for reports)

4. **Map Integration**

   * Display an interactive map (Leaflet / React-Leaflet).
   * Center the map on the resident’s location using the stored latitude and longitude.
   * Place a marker at the resident’s location.
   * The marker popup should display:

     * Resident name
     * Task description

5. **Data Flow**

   * Task list → user clicks task
   * Task ID is passed to the task details component
   * Backend query joins:

     * `tasks`
     * `residents`
   * Location coordinates come from the resident record or task record (depending on schema).

---

### Technical Notes (Implementation Hints)

* Backend:

  * Tasks table must include:

    * `id`
    * `collector_id`
    * `resident_id`
    * `description`
    * `status`
    * `latitude`
    * `longitude`
* Frontend:

  * Use `useEffect` to fetch task details by ID.
  * Pass `latitude` and `longitude` to the map component.
  * Ensure map re-renders when a new task is selected.
* Map:

  * Use `react-leaflet@4` (React 18 compatible).
  * Default zoom level: `13–15`.

---

### Acceptance Criteria

* ✅ Collector can click any assigned task.
* ✅ Task details are displayed correctly.
* ✅ Resident contact information is visible.
* ✅ Map loads without errors.
* ✅ Marker appears at the correct resident location.
* ✅ Location matches the coordinates provided by the resident.

---
Enhancements (Future)

* Button to start navigation (Google Maps link).
* Real-time collector position vs resident location.
* Status update (e.g., “On the way”, “Completed”).
