# Mobile App Documentation

## Overview

The Dental Hospital Records Management System includes a React Native mobile application for iOS and Android platforms.

## Technology Stack

- **Framework**: React Native 0.73
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **UI Library**: React Native Paper
- **API Client**: Axios
- **Image Handling**: React Native Image Picker
- **Internationalization**: i18next
- **Storage**: AsyncStorage

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/             # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── patients/       # Patient management screens
│   │   └── procedures/     # Procedure management screens
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API services
│   │   ├── api.ts          # Axios instance
│   │   ├── authService.ts  # Authentication API
│   │   ├── patientService.ts
│   │   ├── procedureService.ts
│   │   └── imageService.ts
│   ├── store/              # Zustand stores
│   │   └── authStore.ts
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── constants/          # App constants
│   │   ├── theme.ts
│   │   └── config.ts
│   └── i18n/               # Internationalization
│       ├── index.ts
│       └── locales/
│           ├── en.json
│           ├── hi.json
│           ├── raj.json
│           └── mwr.json
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # Root component
└── index.js                # Entry point
```

## Features

### Authentication
- Login with mobile number and password
- Password reset via OTP
- JWT token management
- Automatic token refresh

### Patient Management
- View patient list
- Search patients by name or mobile number
- View patient details
- Create/edit patients (Doctor/Assistant roles)

### Procedure Management
- View procedures list
- Filter by status (Draft, In Progress, Closed, Cancelled)
- View procedure details
- Create procedures (Doctor/Assistant roles)
- Track procedure steps

### Image Management
- Capture images from camera
- Select images from gallery
- Upload procedure images
- View image thumbnails
- View full-size images

### Multi-language Support
- English (default)
- Hindi
- Rajasthani
- Marwari
- Auto-detect from device settings
- Manual language selection

### Role-based Access
- **Patient**: View own procedures only
- **Doctor**: Full access to all features
- **Doctor Assistant**: Same as Doctor
- **RGHS Agent**: View and download images
- **Hospital Admin**: Full system access

## Setup Instructions

### Prerequisites

1. **Node.js 18+**
2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```
3. **Android Studio** (for Android development)
4. **Xcode** (for iOS development, macOS only)
5. **CocoaPods** (for iOS)
   ```bash
   sudo gem install cocoapods
   ```

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **iOS setup** (macOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint
   ```

### Running the App

**Android**:
```bash
npm run android
```

**iOS** (macOS only):
```bash
npm run ios
```

**Start Metro bundler**:
```bash
npm start
```

## Building for Production

### Android

1. **Generate release APK**:
   ```bash
   npm run build:android
   ```

2. **Generate signed AAB** (for Play Store):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

### iOS

1. **Build for device**:
   ```bash
   npm run build:ios
   ```

2. **Archive for App Store**:
   - Open Xcode
   - Select "Product" → "Archive"
   - Follow App Store submission process

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
API_BASE_URL=https://your-api-gateway-url.amazonaws.com
API_VERSION=v1
NODE_ENV=production
ENABLE_OFFLINE_MODE=true
ENABLE_IMAGE_COMPRESSION=true
```

## API Integration

The mobile app communicates with the backend API through:

- **Base URL**: Configured in `.env` file
- **Authentication**: JWT tokens (Access + Refresh)
- **Error Handling**: Automatic token refresh on 401
- **Request Interceptors**: Add auth token to headers
- **Response Interceptors**: Handle token refresh

## State Management

Using Zustand for state management:

- **Auth Store**: User authentication state
- **Patient Store**: Patient data (future)
- **Procedure Store**: Procedure data (future)

## Navigation

- **Auth Navigator**: Login, Password Reset, OTP Verification
- **Main Navigator**: Dashboard, Patients, Procedures, Profile
- **Tab Navigation**: Bottom tabs for main screens
- **Stack Navigation**: Nested navigation for detail screens

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### iOS build issues
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
```

### Clear all caches
```bash
npm run clean
rm -rf node_modules
npm install
```

## Deployment

### Android (Google Play Store)

1. Build signed AAB
2. Create app in Google Play Console
3. Upload AAB
4. Complete store listing
5. Submit for review

### iOS (App Store)

1. Build and archive in Xcode
2. Upload to App Store Connect
3. Complete app information
4. Submit for review

## Security Considerations

- API tokens stored securely in AsyncStorage
- HTTPS only for API calls
- Image encryption handled by backend
- No sensitive data in logs
- Certificate pinning (recommended for production)

## Performance Optimization

- Image compression before upload
- Lazy loading for lists
- Memoization for expensive components
- Optimized bundle size
- Code splitting (future)

## Future Enhancements

- Offline mode with sync
- Push notifications
- Biometric authentication
- Dark mode
- Image annotation (for doctors)
- Denture visualization
- Procedure step checklist
- Bulk image download (RGHS agents)

---

**Last Updated**: 2025-01-15

