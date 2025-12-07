#!/bin/bash

# Firebase Project Setup Script
# This script configures a new or existing Firebase project with all necessary services

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    printf "${BLUE}ℹ${NC} %s\n" "$1"
}

log_success() {
    printf "${GREEN}✓${NC} %s\n" "$1"
}

log_warning() {
    printf "${YELLOW}⚠${NC} %s\n" "$1"
}

log_error() {
    printf "${RED}✗${NC} %s\n" "$1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    log_info "Checking Firebase CLI installation..."
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed"
        log_info "Install it with: npm install -g firebase-tools"
        exit 1
    fi
    local version=$(firebase --version)
    log_success "Firebase CLI installed: $version"
}

# Login to Firebase
firebase_login() {
    log_info "Checking Firebase authentication..."
    if ! firebase projects:list &> /dev/null; then
        log_warning "Not logged in to Firebase"
        log_info "Opening browser for authentication..."
        firebase login
    else
        log_success "Already authenticated with Firebase"
    fi
}

# Select or create Firebase project
setup_project() {
    log_info "Setting up Firebase project..."

    echo ""
    echo "Choose an option:"
    echo "1) Use existing project (veostudio-305df)"
    echo "2) Create new project"
    echo "3) Select different existing project"
    read -p "Enter choice [1-3]: " choice

    case $choice in
        1)
            PROJECT_ID="veostudio-305df"
            log_info "Using existing project: $PROJECT_ID"
            ;;
        2)
            read -p "Enter new project ID: " PROJECT_ID
            log_info "Creating new project: $PROJECT_ID..."
            firebase projects:create "$PROJECT_ID"
            ;;
        3)
            log_info "Available projects:"
            firebase projects:list
            read -p "Enter project ID: " PROJECT_ID
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac

    # Update .firebaserc
    cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

    log_success "Project configured: $PROJECT_ID"
}

# Get Firebase project configuration
get_firebase_config() {
    log_info "Fetching Firebase project configuration..."

    # Check if web app exists
    log_info "Checking for web app configuration..."
    local apps_list=$(firebase apps:list 2>&1)

    if echo "$apps_list" | grep -q "No apps found"; then
        log_warning "No web app found. Creating one..."
        read -p "Enter web app name (default: video-generator-web): " app_name
        app_name=${app_name:-"video-generator-web"}

        log_info "Creating web app '$app_name'..."
        firebase apps:create web "$app_name"
        sleep 3
    fi

    # Create a temporary config file
    local config_file=$(mktemp)

    # Get the web app config
    log_info "Retrieving web app configuration..."
    firebase apps:sdkconfig web > "$config_file" 2>&1

    # Display the config for debugging
    log_info "Retrieved configuration:"
    cat "$config_file"
    echo ""

    # Parse the configuration - handle both JSON and JavaScript output
    API_KEY=$(grep -Eo '"?apiKey"?\s*:\s*"[^"]*"' "$config_file" | grep -Eo '"[^"]*"$' | tr -d '"' | head -1)
    AUTH_DOMAIN=$(grep -Eo '"?authDomain"?\s*:\s*"[^"]*"' "$config_file" | grep -Eo '"[^"]*"$' | tr -d '"' | head -1)
    STORAGE_BUCKET=$(grep -Eo '"?storageBucket"?\s*:\s*"[^"]*"' "$config_file" | grep -Eo '"[^"]*"$' | tr -d '"' | head -1)
    MESSAGING_SENDER_ID=$(grep -Eo '"?messagingSenderId"?\s*:\s*"[^"]*"' "$config_file" | grep -Eo '"[^"]*"$' | tr -d '"' | head -1)
    APP_ID=$(grep -Eo '"?appId"?\s*:\s*"[^"]*"' "$config_file" | grep -Eo '"[^"]*"$' | tr -d '"' | head -1)

    # Clean up
    rm -f "$config_file"

    # Verify we got all values
    if [ -z "$API_KEY" ] || [ -z "$AUTH_DOMAIN" ] || [ -z "$APP_ID" ]; then
        log_error "Failed to parse Firebase configuration automatically"
        log_info "You can manually get the config from:"
        log_info "https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
        echo ""

        read -p "Would you like to enter the values manually? (y/n): " manual_entry
        if [[ $manual_entry == "y" || $manual_entry == "Y" ]]; then
            read -p "API Key: " API_KEY
            read -p "Auth Domain: " AUTH_DOMAIN
            read -p "Storage Bucket: " STORAGE_BUCKET
            read -p "Messaging Sender ID: " MESSAGING_SENDER_ID
            read -p "App ID: " APP_ID
        else
            exit 1
        fi
    fi

    log_success "Firebase configuration retrieved successfully"
    echo ""
    log_info "Configuration values:"
    echo "  API Key: ${API_KEY:0:20}..."
    echo "  Auth Domain: $AUTH_DOMAIN"
    echo "  Project ID: $PROJECT_ID"
    echo "  Storage Bucket: $STORAGE_BUCKET"
    echo "  Messaging Sender ID: $MESSAGING_SENDER_ID"
    echo "  App ID: ${APP_ID:0:30}..."
    echo ""
}

# Create environment files
create_env_files() {
    log_info "Creating environment files..."

    # Frontend .env
    cat > frontend/.env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=$API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=$APP_ID

# Set to 'true' to use Firebase emulators for local development
# Set to 'false' for production
VITE_USE_EMULATORS=true
EOF

    log_success "Created frontend/.env"

    # Functions .env (if not exists)
    if [ ! -f "functions/.env" ]; then
        cat > functions/.env << EOF
# Google AI API Key for Veo 3
# Get your key from: https://aistudio.google.com/app/apikey
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
EOF
        log_success "Created functions/.env"
        log_warning "Don't forget to add your Google AI API key in functions/.env"
    else
        log_info "functions/.env already exists, skipping..."
    fi
}

# Enable Firebase services
enable_services() {
    log_info "Enabling Firebase services..."

    log_info "Please enable the following services manually in Firebase Console:"
    log_info "1. Authentication (Email/Password provider)"
    log_info "2. Firestore Database"
    log_info "3. Cloud Storage"
    log_info "4. Cloud Functions"
    log_info "5. Hosting"

    echo ""
    log_info "Opening Firebase Console..."
    echo -e "${YELLOW}Firebase Console URL:${NC} https://console.firebase.google.com/project/$PROJECT_ID"

    echo ""
    read -p "Press Enter once you've enabled the services above..."
}

# Deploy Firestore rules and indexes
deploy_firestore() {
    log_info "Deploying Firestore rules and indexes..."

    if [ ! -f "firestore.rules" ]; then
        log_warning "firestore.rules not found, creating default..."
        cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Videos
    match /videos/{videoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
EOF
    fi

    if [ ! -f "firestore.indexes.json" ]; then
        log_warning "firestore.indexes.json not found, creating default..."
        cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "videos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    fi

    firebase deploy --only firestore:rules,firestore:indexes
    log_success "Firestore rules and indexes deployed"
}

# Deploy Storage rules
deploy_storage() {
    log_info "Deploying Storage rules..."

    if [ ! -f "storage.rules" ]; then
        log_warning "storage.rules not found, creating default..."
        cat > storage.rules << 'EOF'
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Videos folder
    match /videos/{userId}/{videoId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // User uploads
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
EOF
    fi

    firebase deploy --only storage
    log_success "Storage rules deployed"
}

# Display next steps
show_next_steps() {
    echo ""
    printf "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
    log_success "Firebase project setup complete!"
    printf "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
    echo ""
    log_info "Configuration Summary:"
    echo "  ✓ Project ID: $PROJECT_ID"
    echo "  ✓ Frontend .env: frontend/.env"
    echo "  ✓ Functions .env: functions/.env"
    echo ""
    log_info "Next steps for local development:"
    echo "  1. Add your Google AI API key to functions/.env"
    echo "  2. Run 'pnpm install' to install dependencies"
    echo "  3. Run 'pnpm dev' to start the emulators"
    echo "  4. Run 'pnpm dev:frontend' in another terminal to start the frontend"
    echo ""
    log_info "GitHub Actions Secrets (for CI/CD):"
    echo "  Add these secrets to your GitHub repository:"
    echo "  Settings → Secrets and variables → Actions → New repository secret"
    echo ""
    echo "  VITE_FIREBASE_API_KEY=$API_KEY"
    echo "  VITE_FIREBASE_AUTH_DOMAIN=$AUTH_DOMAIN"
    echo "  VITE_FIREBASE_PROJECT_ID=$PROJECT_ID"
    echo "  VITE_FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET"
    echo "  VITE_FIREBASE_MESSAGING_SENDER_ID=$MESSAGING_SENDER_ID"
    echo "  VITE_FIREBASE_APP_ID=$APP_ID"
    echo ""
    log_info "For production deployment:"
    echo "  1. Set VITE_USE_EMULATORS=false in frontend/.env"
    echo "  2. Run 'pnpm build:frontend' to build the frontend"
    echo "  3. Run 'pnpm build:functions' to build the functions"
    echo "  4. Run 'pnpm deploy' to deploy everything"
    echo ""
    log_info "Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
    echo ""
}

# Main execution
main() {
    printf "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         Firebase Project Configuration Script             ║"
    echo "║                  Video Generator App                       ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    printf "${NC}\n"
    echo ""

    check_firebase_cli
    firebase_login
    setup_project
    get_firebase_config
    create_env_files
    enable_services

    echo ""
    read -p "Do you want to deploy Firestore rules and indexes? (y/n): " deploy_choice
    if [[ $deploy_choice == "y" || $deploy_choice == "Y" ]]; then
        deploy_firestore
    fi

    read -p "Do you want to deploy Storage rules? (y/n): " deploy_storage_choice
    if [[ $deploy_storage_choice == "y" || $deploy_storage_choice == "Y" ]]; then
        deploy_storage
    fi

    show_next_steps
}

# Run main function
main
