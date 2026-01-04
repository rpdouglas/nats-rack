#!/bin/bash

# ==========================================
# PRODUCTION RELEASE SCRIPT (Staging -> Main)
# ==========================================
# Merges 'staging' into 'main', pushes, and tags.

# --- Configuration ---
MAIN_BRANCH="main"
STAGING_BRANCH="staging"

# --- Colors for Output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Production Release Process...${NC}"

# 1. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then 
  echo -e "${RED}ERROR: Your working directory is not clean.${NC}"
  echo "Please commit or stash your changes before deploying."
  exit 1
fi

# 2. Update Staging Branch
echo -e "${GREEN}Step 1: Pulling latest changes for $STAGING_BRANCH...${NC}"
git checkout $STAGING_BRANCH
git pull origin $STAGING_BRANCH

# 3. Update Main Branch
echo -e "${GREEN}Step 2: Pulling latest changes for $MAIN_BRANCH...${NC}"
git checkout $MAIN_BRANCH
git pull origin $MAIN_BRANCH

# 4. Merge Staging into Main
echo -e "${GREEN}Step 3: Merging $STAGING_BRANCH into $MAIN_BRANCH...${NC}"
git merge $STAGING_BRANCH --no-ff -m "Merge branch '$STAGING_BRANCH' into $MAIN_BRANCH for production release"

# Check if merge failed
if [ $? -ne 0 ]; then
  echo -e "${RED}Merge conflict detected! Aborting auto-push.${NC}"
  echo "Please resolve conflicts manually, commit, and then push."
  exit 1
fi

# 5. Push Code
echo -e "${GREEN}Step 4: Pushing to production...${NC}"
git push origin $MAIN_BRANCH

# 6. Tagging (Optional)
read -p "Do you want to tag this release? (y/n): " TAG_CONFIRM
if [[ $TAG_CONFIRM == "y" || $TAG_CONFIRM == "Y" ]]; then
  read -p "Enter version number (e.g., v1.0.1): " VERSION_TAG
  git tag -a "$VERSION_TAG" -m "Production release $VERSION_TAG"
  git push origin "$VERSION_TAG"
  echo -e "${GREEN}Tag $VERSION_TAG pushed!${NC}"
fi

# 7. Return to Staging
echo -e "${GREEN}Step 5: Returning to $STAGING_BRANCH...${NC}"
git checkout $STAGING_BRANCH

echo -e "${GREEN}SUCCESS: Production merge complete!${NC}"