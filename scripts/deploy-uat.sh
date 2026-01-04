#!/bin/bash

# ==========================================
# UAT DEPLOYMENT SCRIPT (Feature -> Staging)
# ==========================================
# Merges the CURRENT branch into 'staging' and pushes.

# --- Configuration ---
UAT_BRANCH="staging"

# --- Colors for Output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Get Current Branch Name
FEATURE_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Prevent merging staging into itself
if [ "$FEATURE_BRANCH" == "$UAT_BRANCH" ] || [ "$FEATURE_BRANCH" == "main" ]; then
  echo -e "${RED}ERROR: You are currently on $FEATURE_BRANCH.${NC}"
  echo "Please checkout the feature branch you want to merge first."
  exit 1
fi

echo -e "${YELLOW}Preparing to merge '$FEATURE_BRANCH' into '$UAT_BRANCH'...${NC}"

# 2. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then 
  echo -e "${RED}ERROR: Your working directory is not clean.${NC}"
  echo "Please commit or stash your changes before merging."
  exit 1
fi

# 3. Update UAT/Staging Branch
echo -e "${GREEN}Step 1: Pulling latest changes for $UAT_BRANCH...${NC}"
git checkout $UAT_BRANCH
git pull origin $UAT_BRANCH

# 4. Merge Feature into UAT
echo -e "${GREEN}Step 2: Merging $FEATURE_BRANCH into $UAT_BRANCH...${NC}"
git merge $FEATURE_BRANCH --no-ff -m "Merge branch '$FEATURE_BRANCH' into $UAT_BRANCH"

# Check if merge failed
if [ $? -ne 0 ]; then
  echo -e "${RED}Merge conflict detected! Aborting auto-push.${NC}"
  echo "Please resolve conflicts manually, commit, and then push."
  exit 1
fi

# 5. Push Code
echo -e "${GREEN}Step 3: Pushing to UAT...${NC}"
git push origin $UAT_BRANCH

# 6. Return to Feature Branch
echo -e "${GREEN}Step 4: Returning to $FEATURE_BRANCH...${NC}"
git checkout $FEATURE_BRANCH

echo -e "${GREEN}SUCCESS: $FEATURE_BRANCH has been deployed to UAT!${NC}"