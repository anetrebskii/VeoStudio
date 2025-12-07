# Firebase Setup Scripts

This directory contains scripts to help configure and manage your Firebase project.

## setup-firebase.sh

Automated Firebase project configuration script.

### What it does:

1. **Checks prerequisites**: Verifies Firebase CLI is installed
2. **Authenticates**: Logs you into Firebase (if needed)
3. **Project setup**: Creates or selects a Firebase project
4. **Retrieves configuration**: Gets your project's API keys and credentials
5. **Environment setup**: Creates `.env` files with actual project values
6. **Service enablement**: Guides you to enable required Firebase services
7. **Rules deployment**: Deploys Firestore and Storage security rules
8. **Index deployment**: Sets up Firestore indexes for optimal queries

### Prerequisites:

- Node.js 20+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google account with Firebase access

### Usage:

```bash
# Run from the project root
./scripts/setup-firebase.sh
```

### Interactive prompts:

The script will ask you to:
1. Choose between existing project (veostudio-305df), create new, or select different
2. Confirm Firebase login (opens browser if needed)
3. Enable services in Firebase Console
4. Choose whether to deploy Firestore rules and indexes
5. Choose whether to deploy Storage rules

### What gets created/updated:

- `.firebaserc` - Project configuration
- `frontend/.env` - Frontend environment variables with real Firebase config
- `functions/.env` - Functions environment variables (if doesn't exist)
- `firestore.rules` - Firestore security rules (if doesn't exist)
- `firestore.indexes.json` - Firestore indexes (if doesn't exist)
- `storage.rules` - Storage security rules (if doesn't exist)

### After running:

1. Add your Google AI API key to `functions/.env`
2. Install dependencies: `pnpm install`
3. Start development:
   - Terminal 1: `pnpm dev` (Firebase emulators)
   - Terminal 2: `pnpm dev:frontend` (Vite dev server)

### Production deployment:

1. Update `frontend/.env`: Set `VITE_USE_EMULATORS=false`
2. Build: `pnpm build:frontend && pnpm build:functions`
3. Deploy: `pnpm deploy`

### Troubleshooting:

**Firebase CLI not found:**
```bash
npm install -g firebase-tools
```

**Authentication issues:**
```bash
firebase logout
firebase login
```

**Missing permissions:**
Ensure your Google account has Owner or Editor role on the Firebase project.

**Environment variables not loading:**
Make sure `.env` files are in the correct locations and restart your dev server.

## Manual Setup Alternative

If you prefer manual setup, follow these steps:

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, Storage, Functions, and Hosting
3. Create a web app in Project Settings
4. Copy configuration to `frontend/.env`
5. Deploy rules: `firebase deploy --only firestore,storage`

## Security Notes

- Never commit `.env` files with real credentials
- Use emulators for local development
- Review security rules before deploying to production
- Regularly rotate API keys and secrets
