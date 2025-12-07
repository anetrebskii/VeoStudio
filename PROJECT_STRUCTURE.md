# Project Structure

## Directory Overview

```
video-generator/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline for automated deployment
├── .vscode/
│   ├── launch.json                 # VSCode debugging configurations
│   └── settings.json               # VSCode workspace settings
├── frontend/                       # React application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── Auth/              # Authentication components
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   └── SignUpForm.tsx
│   │   │   └── VideoGenerator/    # Video generation components
│   │   │       ├── GeneratorForm.tsx
│   │   │       ├── GenerationsList.tsx
│   │   │       ├── PricingDisplay.tsx
│   │   │       └── UsageStats.tsx
│   │   ├── contexts/              # React contexts
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   ├── pages/                 # Page components
│   │   │   ├── AuthPage.tsx       # Login/Signup page
│   │   │   └── DashboardPage.tsx  # Main dashboard
│   │   ├── services/              # API services
│   │   │   └── videoService.ts    # Video generation API calls
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── index.ts           # Shared types
│   │   ├── utils/                 # Utility functions
│   │   │   └── pricing.ts         # Pricing calculations
│   │   ├── config/                # Configuration
│   │   │   └── firebase.ts        # Firebase initialization
│   │   ├── App.tsx                # Root component with routing
│   │   ├── main.tsx               # Application entry point
│   │   └── index.css              # Global styles (Tailwind)
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   ├── vite.config.ts             # Vite bundler configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   └── postcss.config.js          # PostCSS configuration
├── functions/                      # Firebase Cloud Functions
│   ├── src/
│   │   ├── services/              # Business logic
│   │   │   ├── veoService.ts      # Veo 3 API integration
│   │   │   └── usageService.ts    # Usage tracking logic
│   │   ├── types/                 # TypeScript definitions
│   │   │   └── index.ts           # Shared types
│   │   └── index.ts               # Function exports
│   ├── package.json               # Functions dependencies
│   ├── tsconfig.json              # TypeScript configuration
│   └── .env.example               # Environment variables template
├── firebase.json                   # Firebase project configuration
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Firestore composite indexes
├── storage.rules                   # Cloud Storage security rules
├── package.json                    # Root package.json (workspace)
├── pnpm-workspace.yaml             # pnpm workspace configuration
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore patterns
├── .prettierrc                     # Prettier code formatting
├── README.md                       # Project overview
├── QUICKSTART.md                   # Quick start guide
├── SETUP.md                        # Detailed setup instructions
├── FEATURES.md                     # Features documentation
├── PROJECT_STRUCTURE.md            # This file
└── LICENSE                         # MIT License

```

## Component Responsibilities

### Frontend Components

#### Authentication (`frontend/src/components/Auth/`)
- **SignInForm.tsx**: Email/password login form with validation
- **SignUpForm.tsx**: User registration form with password confirmation

#### Video Generator (`frontend/src/components/VideoGenerator/`)
- **GeneratorForm.tsx**: Main form with all Veo 3 options
  - Model selection (4 variants)
  - Prompt input (1024 chars max)
  - Negative prompt (optional)
  - Aspect ratio (16:9, 9:16)
  - Resolution (720p, 1080p)
  - Duration (4, 6, 8 seconds)
  - Person generation settings

- **PricingDisplay.tsx**: Real-time cost calculator
  - Price per second display
  - Total estimated cost
  - Updates dynamically with form changes

- **GenerationsList.tsx**: Video generation history
  - Status tracking (pending, processing, completed, failed)
  - Video preview and download
  - Estimated vs actual cost comparison
  - Generation metadata display

- **UsageStats.tsx**: User usage analytics
  - Total generations count
  - Total spending
  - Per-model breakdown
  - Visual statistics

### Pages

#### AuthPage (`frontend/src/pages/AuthPage.tsx`)
- Tabbed interface for sign in/sign up
- Branded landing experience
- Responsive design

#### DashboardPage (`frontend/src/pages/DashboardPage.tsx`)
- Main application interface
- Video generator form
- Generation history
- Usage statistics sidebar
- User profile and logout

### Backend Services

#### Veo Service (`functions/src/services/veoService.ts`)
- **generateVideo()**: Calls Veo 3 API with all parameters
- **downloadAndUploadVideo()**: Downloads from Google, uploads to Cloud Storage
- Handles all Veo 3 API interactions
- Error handling and retry logic

#### Usage Service (`functions/src/services/usageService.ts`)
- **updateUserUsage()**: Updates usage statistics atomically
- Tracks total generations and spending
- Per-model usage tracking
- Transaction-based updates for consistency

## Data Models

### Firestore Collections

#### users/
```typescript
{
  uid: string;
  email: string;
  createdAt: Timestamp;
}
```

#### generations/
```typescript
{
  id: string;
  userId: string;
  request: VideoGenerationRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  estimatedCost: number;
  actualCost?: number;
  error?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### usage/
```typescript
{
  userId: string;
  totalGenerations: number;
  totalSpent: number;
  generationsByModel: {
    'veo-3.0-generate-001': number;
    'veo-3.0-fast-generate-001': number;
    'veo-3.1-generate-preview': number;
    'veo-3.1-fast-generate-preview': number;
  };
  spentByModel: { ... };
  lastGenerationAt?: Timestamp;
  updatedAt: Timestamp;
}
```

### Cloud Storage Structure

```
gs://your-bucket/
├── videos/
│   └── {userId}/
│       └── {generationId}.mp4
└── images/
    └── {userId}/
        └── {timestamp}_{filename}
```

## Configuration Files

### Build & Development
- **vite.config.ts**: Frontend build configuration, dev server, path aliases
- **tsconfig.json**: TypeScript compiler options (frontend & functions)
- **tailwind.config.js**: Tailwind CSS theming and utilities
- **postcss.config.js**: PostCSS plugins (Tailwind, Autoprefixer)

### Code Quality
- **.prettierrc**: Code formatting rules
- **.eslintrc.cjs**: Linting rules for TypeScript/React

### CI/CD
- **.github/workflows/deploy.yml**: Automated deployment pipeline
  - Builds on push to main
  - Preview deployments on PRs
  - Environment variable injection

### Firebase
- **firebase.json**: Hosting, Functions, Firestore, Storage config
- **firestore.rules**: Database security rules
- **firestore.indexes.json**: Composite indexes for queries
- **storage.rules**: File storage security rules

## Technology Stack Summary

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Hook Form**: Form validation
- **Firebase SDK**: Authentication, Firestore, Storage, Functions
- **Lucide React**: Icon library
- **date-fns**: Date formatting

### Backend
- **Firebase Functions**: Serverless compute (Node.js 20)
- **TypeScript**: Type safety
- **Firebase Admin SDK**: Server-side Firebase operations
- **Google Generative AI SDK**: Veo 3 API integration
- **Firestore**: NoSQL database
- **Cloud Storage**: File storage

### DevOps
- **pnpm**: Fast package manager with workspaces
- **GitHub Actions**: CI/CD automation
- **Firebase Hosting**: Static site hosting
- **VSCode**: Debugging configurations

## Security Layers

1. **Firebase Authentication**: Email/password authentication
2. **Firestore Rules**: Database-level access control
3. **Storage Rules**: File-level access control
4. **Function Authentication**: Require auth for all function calls
5. **User Isolation**: All data scoped to user ID

## Performance Optimizations

1. **Code Splitting**: Automatic with Vite
2. **Lazy Loading**: Route-based code splitting
3. **Caching**: HTTP caching headers for static assets
4. **Firestore Indexes**: Optimized queries
5. **Transaction-based Updates**: Consistent usage tracking

## Extensibility Points

1. **Add Models**: Update types and MODEL_PRICING constant
2. **New Features**: Add to GeneratorForm and veoService
3. **Custom Hooks**: Add to frontend/src/hooks/
4. **Additional Services**: Add to functions/src/services/
5. **New Pages**: Add to frontend/src/pages/ and update App.tsx routing
