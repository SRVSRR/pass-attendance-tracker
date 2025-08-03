# PASS Attendance Tracker

A minimal offline-first mobile app to track student attendance via barcode scanning.

## Features

- ✅ Create courses with unique course codes and leader names
- ✅ Scan student ID barcodes (must start with 'S')
- ✅ Store attendance records in local SQLite database
- ✅ Export attendance data as Excel files
- ✅ Dark theme with consistent Lucide icons
- ✅ Single-page application (SPA) navigation
- ✅ Completely offline functionality

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Database**: SQLite (expo-sqlite)
- **Barcode Scanner**: expo-camera (with built-in barcode scanning)
- **Excel Export**: xlsx + expo-sharing + expo-file-system
- **Icons**: lucide-react-native

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with the Expo Go app to run on your device

### Building for Production

For Android:
```bash
npx expo build:android
```

For iOS:
```bash
npx expo build:ios
```

## Usage

### Home Screen
- View all created courses
- Tap "Create Course" to add a new course
- Tap on any course to view its details

### Create Course
- Enter unique course code
- Enter leader name
- App validates course code uniqueness

### Course Screen
- View course details and attendance records
- Tap "Scan" to scan student ID barcodes
- Tap "Export" to export attendance as Excel file

### Scan Screen
- Camera opens for barcode scanning
- Only accepts barcodes starting with 'S'
- Automatically records attendance with timestamp
- Returns to course screen after successful scan

### Export Feature
- Generates Excel file with attendance data
- Filename format: `{courseCode}-{leaderName}.xlsx`
- Uses native share sheet for file distribution

## Project Structure

```
src/
├── components/        # Reusable components
├── database/         # SQLite database setup and operations
├── screens/          # Main app screens
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Data Model

### Course
- `courseCode`: string (unique)
- `leaderName`: string

### Attendance
- `id`: number (auto-increment)
- `studentId`: string (must start with 'S')
- `datetime`: ISO string
- `courseCode`: string (foreign key)
- `leaderName`: string

## Permissions

The app requires camera permission for barcode scanning. This is handled automatically by Expo.

## Development Notes

- App uses SQLite for offline data storage
- No network connectivity required
- Real-time attendance list updates
- Form validation for course creation
- Error handling for all database operations

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure camera permissions are granted
2. **Database errors**: Check if app has storage permissions
3. **Export not working**: Verify file system permissions

### Debug Mode

To view console logs, use:
```bash
npx expo start --dev
```

## License

MIT License - see LICENSE file for details
