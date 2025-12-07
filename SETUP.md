# Setup Guide

## Prerequisites

1. **Node.js and pnpm**
   ```bash
   # Install Node.js 20+
   # Install pnpm
   npm install -g pnpm
   ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Google Cloud Project**
   - Create a project at https://console.cloud.google.com
   - Enable Veo 3 API
   - Get API key from https://aistudio.google.com/app/apikey

4. **Firebase Project**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Cloud Storage
   - Enable Cloud Functions

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
cd frontend && pnpm install
cd ../functions && pnpm install
cd ..
```

### 2. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

### 3. Environment Variables

#### Frontend (.env in root)
```bash
cp .env.example .env
```

Edit `.env` with your Firebase config from Firebase Console > Project Settings:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Functions (functions/.env)
```bash
cd functions
cp .env.example .env
```

Edit `functions/.env`:
```
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Deploy Firebase Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 5. Set Environment Variables for Functions

```bash
firebase functions:config:set google.ai_api_key="your_google_ai_api_key"
```

### 6. Run Development Server

#### Terminal 1 - Frontend
```bash
cd frontend
pnpm dev
```

#### Terminal 2 - Functions (optional, for local testing)
```bash
firebase emulators:start
```

### 7. Build and Deploy

```bash
# Build everything
pnpm build:frontend
pnpm build:functions

# Deploy to Firebase
firebase deploy
```

## GitHub Actions Setup

### Required Secrets

Go to your GitHub repository > Settings > Secrets and add:

1. **FIREBASE_TOKEN**
   ```bash
   firebase login:ci
   # Copy the token and add it to GitHub secrets
   ```

2. **Firebase Config Secrets**
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Google AI Secret**
   - `GOOGLE_AI_API_KEY`

## VSCode Debugging

### Debug Frontend
1. Press F5 or use "Frontend: Chrome" configuration
2. Chrome will open with debugging enabled

### Debug Functions
1. Start Firebase Emulators with debugging:
   ```bash
   firebase emulators:start --inspect-functions
   ```
2. Use "Functions: Attach" configuration in VSCode

### Full Stack Debug
Use the "Full Stack Debug" compound configuration to debug both frontend and backend simultaneously.

## Troubleshooting

### Functions Not Deploying
- Ensure you're on the Blaze (pay-as-you-go) plan
- Check functions logs: `firebase functions:log`

### Veo 3 API Errors
- Verify API key is correct
- Check quota limits at https://console.cloud.google.com
- Ensure billing is enabled for Google Cloud project

### Storage Permission Errors
- Verify storage rules are deployed
- Check bucket exists in Firebase Console

### Build Errors
- Delete node_modules and reinstall: `pnpm install`
- Clear Firebase cache: `firebase cache:clear`

## Useful Commands

```bash
# View functions logs
firebase functions:log

# View Firestore data
firebase firestore:indexes

# Clear all emulator data
firebase emulators:start --import=./emulator-data --export-on-exit

# Deploy specific targets
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Cost Optimization

- Use Veo 3 Fast models for testing ($0.15/sec vs $0.40/sec)
- Set Firestore and Storage security rules properly
- Monitor usage in Firebase Console
- Set up budget alerts in Google Cloud Console

## Support

- Firebase Docs: https://firebase.google.com/docs
- Veo 3 API Docs: https://ai.google.dev/gemini-api/docs/video
- GitHub Issues: Create an issue in your repository
