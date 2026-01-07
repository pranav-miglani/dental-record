# Dental Hospital Records - Mobile App

React Native mobile application for the Dental Hospital Records Management System.

## 📱 Features

- **Authentication**: Login with mobile number and password
- **Patient Management**: View and manage patient records
- **Procedure Management**: Create and track dental procedures
- **Image Capture**: Capture and upload procedure images
- **Multi-language Support**: Hindi, Rajasthani, Marwari, and English
- **Offline Support**: Basic offline functionality with AsyncStorage
- **Role-based Access**: Different UI based on user role (Patient, Doctor, Assistant, RGHS Agent, Admin)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS)

### Installation

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **iOS setup** (macOS only):
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API endpoint
   ```

4. **Run the app**:
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

## 📁 Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/        # API services
│   ├── store/          # State management (Zustand)
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   ├── constants/      # App constants
│   └── i18n/           # Internationalization
├── android/            # Android native code
├── ios/                # iOS native code
├── App.tsx             # Root component
└── index.js            # Entry point
```

## 🏗️ Architecture

- **Framework**: React Native 0.73
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **UI Library**: React Native Paper
- **API Client**: Axios
- **Image Handling**: React Native Image Picker
- **Internationalization**: i18next
- **Storage**: AsyncStorage

## 📱 Supported Platforms

- **Android**: 6.0+ (API 23+)
- **iOS**: 12.0+

## 🔧 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Building

**Android**:
```bash
npm run build:android
```

**iOS**:
```bash
npm run build:ios
```

## 🌐 Multi-language Support

The app supports:
- English (en) - Default
- Hindi (hi)
- Rajasthani (raj)
- Marwari (mwr)

Language is auto-detected from device settings and can be changed in app settings.

## 📝 Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
API_BASE_URL=https://your-api-gateway-url.amazonaws.com
API_VERSION=v1
```

## 🔐 Security

- API tokens stored securely in AsyncStorage
- HTTPS only for API calls
- Image encryption handled by backend
- No sensitive data in logs

## 📚 Documentation

- [API Integration](./docs/API_INTEGRATION.md)
- [Navigation Guide](./docs/NAVIGATION.md)
- [State Management](./docs/STATE_MANAGEMENT.md)
- [Internationalization](./docs/I18N.md)

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Submit pull requests

## 📄 License

Private - All rights reserved

