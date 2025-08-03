# PASS Attendance Tracker PRD

A comprehensive offline-first mobile app to track student attendance via barcode scanning with advanced student management features.

## Overview

The app allows leaders to:

* Create courses with form validation and real-time feedback
* Scan student ID barcodes with strict format validation (S + 8 digits)
* Collect and manage detailed student information (name, sponsor)
* Store attendance records in a local SQLite database with automatic migration
* Export attendance data as Excel files with comprehensive student details
* Use the app entirely offline with proper safe area handling across all devices
* Navigate seamlessly with hardware back button support

---

## Design

* **Theme**: Dark mode with consistent styling
* **Icons**: Lucide React Native icons with consistent sizing
* **Navigation**: Single-page application (SPA) with smooth transitions
* **Safe Areas**: Proper inset handling for all device types
* **UX**: No confirmation dialogs, instant feedback, vibration on scan
* **Accessibility**: Optimized for Samsung devices and various screen sizes

---

## Data Model

### Course

* `courseCode`: `string` (unique, validated in real-time)
* `leaderName`: `string` (required)

### Student

* `studentId`: `string` (primary key, format: S + 8 digits)
* `studentName`: `string` (required)
* `sponsor`: `string` (required)

### Attendance

* `id`: `integer` (auto-increment primary key)
* `studentId`: `string` (foreign key to students)
* `studentName`: `string` (denormalized for export)
* `sponsor`: `string` (denormalized for export)
* `datetime`: `timestamp` (ISO string)
* `courseCode`: `string` (foreign key to courses)
* `leaderName`: `string` (denormalized for export)

---

## Home Page

* List of all created courses (Course Code + Leader Name)
* **Create Course** button (primary blue style, consistent with other buttons)
* Real-time course list updates
* Proper safe area handling

### Create Course Flow

* Input fields: `Course Code`, `Leader Name` (both required)
* Real-time validation with debounced course code uniqueness check
* Visual error indicators (red border, error text)
* Button disabled until all criteria met:
  - Both fields filled
  - Course code doesn't already exist
  - Not currently saving
* No error popups - visual feedback only
* Auto-redirect on successful creation
---

## Course Page

When a course is clicked:

* Header with back navigation
* Action buttons:
  * **Scan** button (primary action)
  * **Export** button (secondary action, disabled when no data)
* Body:
  * Real-time list of **attendance entries** for that course, ordered by latest
  * Simplified display: Student ID, Student Name, Date (no time or sponsor shown)
  * Consistent font sizing across all elements
  * Auto-updates every 2 seconds after new scans
* Proper safe area handling with optimized spacing

---

## Scan Page

* Full-screen barcode scanner interface with overlay
* Strict validation: Only accepts barcodes matching pattern `S\d{8}` (S + exactly 8 digits)
* Silent rejection of invalid barcodes (no error messages shown)
* Haptic feedback (200ms vibration) on successful scan
* After valid scan:
  * Navigate to **Save Attendance** page with scanned student ID
* Hardware back button support
* Proper safe area handling

---

## Save Attendance Page

**New Feature**: Comprehensive student data collection

* Pre-filled student ID (read-only)
* Student information form:
  * **Student Name** (editable text input)
  * **Sponsor** (editable text input)
* Smart form behavior:
  * If student exists in database: auto-fill name and sponsor
  * If new student: empty form for data entry
  * Form validation: both fields required
  * Save button disabled until form is valid
* On successful save:
  * Upsert student data to students table
  * Record attendance with full student details
  * Navigate back to scan page automatically
* Error handling without blocking user flow

---

## Export Feature

* Enhanced Excel export with comprehensive student data
* Export includes columns:
  * Student ID
  * Student Name  
  * Sponsor
  * Date (separate from time)
  * Time (separate from date)
  * Course Code
  * Leader Name
* Export only available when attendance data exists
* Silent export process (no success confirmations)
* Automatically trigger native device share sheet
* File naming: `{courseCode}-{leaderName}-attendance.xlsx`
* Error handling for failed exports

---

## Technical Features

### Database Management
* **SQLite** with automatic schema migration
* Handles upgrades from legacy attendance table structure
* Preserves existing data during migrations
* Foreign key relationships between tables
* Optimized queries with proper indexing

### User Experience
* **Hardware back button** support throughout app
* **Safe area insets** properly handled on all screens
* **Form validation** with real-time feedback
* **Haptic feedback** for user interactions
* **Silent operation** - minimal confirmation dialogs
* **Optimized spacing** for Samsung A55 and similar devices

### Performance
* **Offline-first** - no network dependencies
* **Real-time updates** without manual refresh
* **Debounced validation** to prevent excessive database calls
* **Efficient re-rendering** with proper React hooks usage

---

## Tech Stack

* **Frontend**: React Native (Expo) with TypeScript
* **Database**: SQLite (via `expo-sqlite`) with migration support
* **Barcode Scanner**: `expo-camera` (updated from deprecated expo-barcode-scanner)
* **Excel Export**: `xlsx` library with enhanced column structure
* **File Sharing**: `expo-sharing` + `expo-file-system`
* **Safe Areas**: `react-native-safe-area-context` with manual inset handling
* **Icons**: Lucide React Native
* **Styling**: StyleSheet with dark theme and consistent design system