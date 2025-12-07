# Video Generator - Google Veo 3

A comprehensive Firebase application for generating videos using Google Veo 3 API with real-time pricing estimates and usage tracking.

## Features

- **Video Generation**: Generate videos using all Veo 3 models (Veo 3, Veo 3.1, Fast variants)
- **Complete Veo 3 Options**: All API parameters including aspect ratios, resolution, duration, negative prompts
- **Image-to-Video**: Upload reference images for video generation
- **Video Extension**: Extend existing videos up to 7 additional seconds
- **Real-time Pricing**: Estimated and actual cost tracking
- **Firebase Authentication**: Custom UI with email/password authentication
- **Cloud Storage**: Secure video and image storage
- **Usage Analytics**: Track spending and generation history

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Firebase SDK v10
- React Router
- React Hook Form

### Backend
- Firebase Functions (Node.js 20)
- TypeScript
- Firestore
- Cloud Storage
- Google AI Generative API

### DevOps
- GitHub Actions for CI/CD
- pnpm for package management

## Project Structure

```
video-generator/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Auth and app contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # Firebase services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
├── functions/            # Firebase functions
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Function exports
│   └── package.json
└── firebase.json         # Firebase configuration
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Firebase CLI: `npm install -g firebase-tools`
- Google Cloud Project with Veo 3 API enabled
- Firebase project

## Setup

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   pnpm setup
   ```

2. **Configure Firebase**:
   ```bash
   firebase login
   firebase init
   ```

3. **Set environment variables**:

   Copy `.env.example` to `.env` in the root directory and fill in your Firebase configuration:
   ```bash
   cp .env.example .env
   ```

   Also create `functions/.env`:
   ```bash
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Deploy Firebase security rules**:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

## Development

### Run Frontend
```bash
pnpm dev:frontend
```
Frontend will be available at `http://localhost:5173`

### Run Functions Locally
```bash
pnpm dev:functions
```

## Building

### Build Frontend
```bash
pnpm build:frontend
```

### Build Functions
```bash
pnpm build:functions
```

## Deployment

### Deploy Everything
```bash
pnpm deploy
```

### Deploy Functions Only
```bash
pnpm deploy:functions
```

### Deploy Hosting Only
```bash
pnpm deploy:hosting
```

## Veo 3 Pricing

- **Veo 3 / Veo 3.1**: $0.40 per second
- **Veo 3 Fast / Veo 3.1 Fast**: $0.15 per second

All pricing is calculated automatically in the UI based on selected options.

## VSCode Debugging

This project includes VSCode launch configurations for debugging:
- Frontend debugging with Chrome
- Firebase Functions debugging

See [.vscode/launch.json](.vscode/launch.json) for configuration.

## CI/CD

GitHub Actions workflow automatically:
- Runs tests
- Builds the application
- Deploys to Firebase on push to main branch

Configure GitHub secrets:
- `FIREBASE_TOKEN`: Firebase CI token (get with `firebase login:ci`)

## License

MIT
