# GroApp26 - Grocery Shopping Mobile App

A React Native mobile application built with Expo for browsing and purchasing grocery products with Firebase authentication.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Firebase Setup](#firebase-setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: Sign up and login with Firebase email/password authentication
- **Product Browsing**: Browse 24+ grocery products organized by 8 categories
- **Shopping Cart**: Add/remove products with quantity management and real-time item count
- **User Profile**: View profile information and manage account settings
- **Product Images**: Local JPEG images for visual product representation
- **Persistent Storage**: Cart data persists using AsyncStorage
- **Bottom Tab Navigation**: Easy navigation between Home, Products, Cart, and Profile screens

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54.0.30
- **Language**: TypeScript
- **State Management**: React Context API + AsyncStorage
- **Authentication**: Firebase v12.7.0 (Email/Password)
- **Navigation**: React Navigation (native-stack, bottom-tabs)
- **UI**: React Native built-in components
- **Icons**: Expo Vector Icons (Ionicons)
- **Storage**: AsyncStorage for local data persistence

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Expo CLI** (for development)
   ```bash
   npm install -g expo-cli
   ```

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

4. **Expo Go Mobile App** (to test on your phone)
   - Download from App Store (iOS) or Google Play (Android)

5. **Code Editor** (recommended: VS Code)
   - Download from: https://code.visualstudio.com/

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Samuel132001/GroApp26-.git
cd GroApp26-
```

### 2. Navigate to the App Directory

```bash
cd grocery-app
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- react-native
- expo
- firebase
- react-navigation
- async-storage
- and other dependencies

## 🔐 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `GroApp26` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable it and click **Save**

### 3. Get Your Firebase Config

1. Go to **Project Settings** (gear icon at top)
2. Scroll to **Your apps** section
3. Click on the web app icon `</>`
4. Copy your Firebase config object

### 4. Update Firebase Configuration

Update the file `src/config/firebase.ts` with your Firebase credentials:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

Replace the placeholder values with your actual Firebase credentials.

## 🚀 Running the App

### Option 1: Using Expo CLI (Recommended)

```bash
cd grocery-app
npm start
```

or

```bash
npx expo start
```

This will display a QR code in your terminal. You can:

**On Mobile Device:**
1. Open Expo Go app
2. Scan the QR code with your phone camera or Expo Go
3. App will load on your device

**On Emulator/Simulator:**
- Press `i` for iOS Simulator (macOS only)
- Press `a` for Android Emulator

### Option 2: Using npm

```bash
cd grocery-app
npm start
```

## 📁 Project Structure

```
grocery-app/
├── assets/
│   └── products/
│       ├── bread.jpeg          # Bread/bakery products image
│       ├── milk.jpeg           # Dairy/beverage products image
│       ├── yogurt.jpeg         # Yogurt/dessert products image
│       ├── cake.jpeg           # Cake/baked goods image
│       └── pasta.jpeg          # Pasta/dry goods image
├── src/
│   ├── config/
│   │   └── firebase.ts         # Firebase configuration
│   └── screens/
│       ├── HomeScreen.tsx      # Main product browsing screen
│       ├── ProductsScreen.tsx  # Featured products list
│       ├── CartScreen.tsx      # Shopping cart
│       ├── ProfileScreen.tsx   # User profile
│       ├── LoginScreen.tsx     # Login screen
│       └── SignUpScreen.tsx    # Sign up screen
├── App.tsx                     # Main app component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Troubleshooting

### Issue: App doesn't start after `npm start`

**Solution:**
```bash
# Clear cache and reinstall
rm -r node_modules
npm install
npm start
```

### Issue: "Module not found" error for images

**Solution:**
- Ensure image files exist in `assets/products/`
- Check that filenames match exactly (case-sensitive):
  - `bread.jpeg` (lowercase)
  - `milk.jpeg` (lowercase)
  - `yogurt.jpeg` (lowercase)
  - `cake.jpeg` (lowercase)
  - `pasta.jpeg` (lowercase)

### Issue: Firebase connection error

**Solution:**
1. Verify Firebase credentials in `src/config/firebase.ts`
2. Check internet connection
3. Ensure Firebase project is active in Firebase Console
4. Check that Email/Password authentication is enabled

### Issue: "Cannot find module 'react-native'"

**Solution:**
```bash
npm install
npm install react-native
```

### Issue: Expo Go app not connecting

**Solution:**
1. Ensure phone and computer are on the same WiFi network
2. Restart Expo: Press `Ctrl+C` and run `npm start` again
3. Clear Expo app cache: Open Expo Go app > Profile > Clear cache
4. Try using tunnel mode: `npx expo start --tunnel`

### Issue: TypeScript errors

**Solution:**
```bash
# Rebuild the project
npm start -- --clear
```

## 📱 Testing the App

### Create a Test Account

1. Click "Sign Up" on the login screen
2. Enter email: `test@example.com`
3. Enter password: `test123456` (minimum 6 characters)
4. Click "Sign Up"

### Test Features

1. **Browse Products**: Navigate to Home/Products tabs
2. **Add to Cart**: Tap any product to add it to cart
3. **View Cart**: Go to Cart tab to see items
4. **Adjust Quantity**: Use +/- buttons to change quantities
5. **View Profile**: Go to Profile tab to see logged-in user info
6. **Logout**: Click logout button on Profile screen

## 📝 Available Scripts

```bash
# Start development server
npm start

# Run tests (if configured)
npm test

# Build for production
expo build:android    # Build Android APK
expo build:ios        # Build iOS IPA

# Clear cache
npm start -- --clear
```

## 🐛 Reporting Issues

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review error messages in the Expo console
3. Check Firebase Console for authentication errors
4. Ensure all dependencies are installed: `npm install`

## 📄 License

This project is provided as-is for educational and development purposes.

## 👤 Author

**Samuel132001**
- GitHub: https://github.com/Samuel132001

## 🤝 Contributing

Feel free to fork this repository and submit pull requests for any improvements!

---

**Happy Coding! 🎉**

For more help, visit:
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
