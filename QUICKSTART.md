# Quick Start Guide

Get your video generator up and running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Firebase account
- Google Cloud account with Veo 3 API access

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
# Install pnpm if not already installed
npm install -g pnpm firebase-tools

# Install project dependencies
pnpm install
cd frontend && pnpm install
cd ../functions && pnpm install
cd ..
```

### 2. Firebase Setup (2 min)

```bash
# Login to Firebase
firebase login

# Create/select your Firebase project
firebase use --add
```

In Firebase Console (https://console.firebase.google.com):
- Enable **Authentication** > Email/Password
- Create **Firestore Database** (start in production mode)
- Enable **Cloud Storage**
- Upgrade to **Blaze Plan** (required for Cloud Functions)

### 3. Environment Variables (1 min)

Create `.env` in root directory:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `functions/.env`:
```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

Get Google AI API key: https://aistudio.google.com/app/apikey

### 4. Deploy Security Rules (30 sec)

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 5. Run Development Server (30 sec)

```bash
# Terminal 1 - Frontend
cd frontend
pnpm dev
```

Open http://localhost:5173 in your browser!

## First Video Generation

1. **Sign Up**: Create an account with email/password
2. **Fill the Form**:
   - Select model: "Veo 3.1 Fast" (cheapest for testing)
   - Enter prompt: "A cat playing with a ball of yarn"
   - Keep defaults: 16:9, 720p, 4 seconds
3. **Check Estimated Cost**: Should show ~$0.60
4. **Click "Generate Video"**
5. **Wait**: 30-60 seconds for generation
6. **Download**: Video appears with download button

## Deploy to Production

```bash
# Build everything
pnpm build:frontend
pnpm build:functions

# Deploy to Firebase
firebase deploy
```

Your app is now live at: `https://your-project-id.web.app`

## GitHub Actions Setup (Optional)

1. Get Firebase token:
   ```bash
   firebase login:ci
   ```

2. Add to GitHub Secrets:
   - `FIREBASE_TOKEN`
   - All environment variables from `.env`

3. Push to main branch - auto-deploys!

## Troubleshooting

### "Functions not deploying"
- Ensure you're on Blaze (pay-as-you-go) plan
- Check: `firebase functions:log`

### "Veo 3 API error"
- Verify API key is correct
- Enable billing on Google Cloud project
- Check quota: https://console.cloud.google.com

### "Permission denied"
- Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`
- Check Firebase Console > Storage > Rules

## Next Steps

- Read [FEATURES.md](FEATURES.md) for all capabilities
- Read [SETUP.md](SETUP.md) for detailed configuration
- Check [README.md](README.md) for architecture overview

## Cost Warning

⚠️ **Veo 3 API is a paid service**:
- Veo 3 Standard: $0.40/second
- Veo 3 Fast: $0.15/second

A 4-second video costs $0.60-$1.60. Monitor your usage!

## Support

- Firebase: https://firebase.google.com/support
- Veo 3 API: https://ai.google.dev/gemini-api/docs/video
- Issues: Open a GitHub issue

Happy video generating! 🎥
