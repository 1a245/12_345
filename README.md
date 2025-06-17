# M13 Business Management Application

A comprehensive business management application for Village, City, and Dairy operations with Android support.

## Features

- **Multi-category Management**: Village, City, and Dairy operations
- **Data Entry**: Comprehensive entry forms for different business types
- **Payment Tracking**: Track payments given and received
- **Reporting**: Generate CSV and PDF reports
- **Ledger Management**: Complete ledger view with running balances
- **Password Security**: Changeable password system
- **Android App**: Native Android application support

## Getting Started

### Web Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Android Development

```bash
# Build and setup Android
npm run android:build

# Sync changes to Android
npm run android:sync

# Run on Android device/emulator
npm run android:run
```

## Android Setup Requirements

1. **Android Studio**: Install Android Studio with SDK
2. **Java Development Kit**: JDK 11 or higher
3. **Android SDK**: API level 22 or higher
4. **Capacitor CLI**: Installed globally

### First Time Android Setup

1. Install Android Studio and SDK
2. Set ANDROID_HOME environment variable
3. Run `npm install` to install dependencies
4. Run `npm run android:build` to create Android project
5. Open Android Studio and import the android folder
6. Build and run the app

## Default Credentials

- **Username**: admin
- **Password**: admin123 (changeable in settings)

## Project Structure

```
src/
├── components/          # React components
│   ├── entry/          # Data entry components
│   ├── payment/        # Payment management
│   ├── settings/       # Settings and configuration
│   └── view/           # Data viewing and reports
├── context/            # React context providers
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Business Logic

### Village Operations
- Morning and Evening milk collection
- Fat percentage calculations
- Rate-based amount calculations

### City Operations
- Value-based transactions
- Simple rate multiplication

### Dairy Operations
- Complex calculations with fat and meter readings
- Session-based entries (morning/evening)
- Multiple calculation formulas

## Mobile Features

- **Touch Optimized**: All interactions optimized for touch
- **Responsive Design**: Works on all screen sizes
- **Offline Capable**: Data stored locally
- **Native Feel**: Android-specific optimizations
- **Haptic Feedback**: Touch feedback on supported devices

## Data Export

- **CSV Export**: All data exportable to CSV format
- **PDF Reports**: Professional PDF reports with calculations
- **Share Functionality**: Native sharing on mobile devices

## Security

- **Password Protection**: Secure login system
- **Local Storage**: All data stored locally on device
- **Password Change**: Users can change their password
- **Session Management**: Automatic logout handling

## Development

The application is built with:
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Capacitor**: Native mobile app framework
- **Vite**: Fast build tool and dev server

## Building for Production

### Web Build
```bash
npm run build
```

### Android Build
```bash
npm run android:build
cd android
./gradlew assembleDebug
```

The APK will be generated in `android/app/build/outputs/apk/debug/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and Android
5. Submit a pull request

## License

This project is licensed under the MIT License.