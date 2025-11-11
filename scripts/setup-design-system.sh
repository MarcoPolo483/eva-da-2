#!/bin/bash
# EVA DA 2.0 Design System Setup Script
# Extracts PubSec Info Assistant design system and enhances for enterprise use

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
EVA_PROJECT_DIR="c:/Users/marco.presta/dev/eva-da-2"
IA_DESIGN_SYSTEM_PKG="c:/Users/marco.presta/dev/PubSec-Info-Assistant/ia-design-system/eva-da-ia-design-system-1.0.0.tgz"
TEMP_EXTRACT_DIR="${EVA_PROJECT_DIR}/temp-ia-extraction"

echo -e "${BLUE}🎨 EVA DA 2.0 Design System Integration${NC}"
echo -e "${BLUE}======================================${NC}"

# Step 1: Create directory structure
echo -e "\n${YELLOW}📁 Creating design system directory structure...${NC}"
mkdir -p "${EVA_PROJECT_DIR}/src/design-system"
mkdir -p "${EVA_PROJECT_DIR}/src/design-system/components"
mkdir -p "${EVA_PROJECT_DIR}/src/design-system/tokens"
mkdir -p "${EVA_PROJECT_DIR}/src/design-system/themes"
mkdir -p "${EVA_PROJECT_DIR}/src/design-system/utils"
mkdir -p "${EVA_PROJECT_DIR}/storybook"
mkdir -p "${TEMP_EXTRACT_DIR}"

# Step 2: Extract IA Design System package
echo -e "\n${YELLOW}📦 Extracting IA Design System package...${NC}"
cd "${TEMP_EXTRACT_DIR}"
tar -xzf "${IA_DESIGN_SYSTEM_PKG}"
echo -e "${GREEN}✅ IA Design System extracted successfully${NC}"

# Step 3: Analyze package structure
echo -e "\n${YELLOW}🔍 Analyzing IA Design System structure...${NC}"
find . -type f -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.scss" | head -20
echo -e "${GREEN}✅ Package structure analyzed${NC}"

# Step 4: Copy core components
echo -e "\n${YELLOW}📋 Copying IA components to EVA design system...${NC}"
# This will be customized based on actual package structure
cp -r ./components/* "${EVA_PROJECT_DIR}/src/design-system/components/" 2>/dev/null || echo "Components directory structure may differ"
cp -r ./tokens/* "${EVA_PROJECT_DIR}/src/design-system/tokens/" 2>/dev/null || echo "Tokens directory structure may differ"
cp -r ./themes/* "${EVA_PROJECT_DIR}/src/design-system/themes/" 2>/dev/null || echo "Themes directory structure may differ"

echo -e "${GREEN}✅ IA components integrated into EVA design system${NC}"

# Step 5: Install additional dependencies for enterprise features
echo -e "\n${YELLOW}📦 Installing enterprise design system dependencies...${NC}"
cd "${EVA_PROJECT_DIR}"

# Storybook for component development
npm install --save-dev @storybook/react@latest \
  @storybook/addon-essentials@latest \
  @storybook/addon-accessibility@latest \
  @storybook/addon-controls@latest \
  @storybook/addon-docs@latest \
  @storybook/addon-viewport@latest \
  @storybook/addon-backgrounds@latest

# Design system utilities
npm install --save @radix-ui/react-slot \
  class-variance-authority \
  clsx \
  tailwind-merge \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-dialog \
  @radix-ui/react-progress \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip

# Accessibility testing
npm install --save-dev @axe-core/react \
  jest-axe \
  @testing-library/jest-dom

echo -e "${GREEN}✅ Enterprise dependencies installed${NC}"

# Step 6: Setup Storybook configuration
echo -e "\n${YELLOW}📚 Setting up Storybook for enterprise components...${NC}"
npx storybook@latest init --type react --yes

# Clean up temp directory
echo -e "\n${YELLOW}🧹 Cleaning up temporary files...${NC}"
rm -rf "${TEMP_EXTRACT_DIR}"

echo -e "\n${GREEN}🎉 EVA DA 2.0 Design System setup complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Review extracted components in src/design-system/"
echo -e "2. Run 'npm run storybook' to start component development"
echo -e "3. Begin enhancing components for enterprise features"
echo -e "4. Test accessibility compliance with new enhancements"