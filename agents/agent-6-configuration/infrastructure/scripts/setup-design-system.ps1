# EVA DA 2.0 Design System Setup Script (PowerShell)
# Extracts PubSec Info Assistant design system and enhances for enterprise use

param(
    [string]$ProjectPath = "C:\Users\marco.presta\dev\eva-da-2",
    [string]$IAPackagePath = "C:\Users\marco.presta\dev\PubSec-Info-Assistant\ia-design-system\eva-da-ia-design-system-1.0.0.tgz"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🎨 EVA DA 2.0 Design System Integration" -ForegroundColor Blue
Write-Host "======================================" -ForegroundColor Blue

# Function to create directory if it doesn't exist
function New-DirectoryIfNotExists {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "✅ Created directory: $Path" -ForegroundColor Green
    }
}

# Step 1: Create directory structure
Write-Host "`n📁 Creating design system directory structure..." -ForegroundColor Yellow

$Directories = @(
    "$ProjectPath\src\design-system",
    "$ProjectPath\src\design-system\components",
    "$ProjectPath\src\design-system\tokens",
    "$ProjectPath\src\design-system\themes", 
    "$ProjectPath\src\design-system\utils",
    "$ProjectPath\src\design-system\assets",
    "$ProjectPath\.storybook",
    "$ProjectPath\scripts"
)

foreach ($Dir in $Directories) {
    New-DirectoryIfNotExists -Path $Dir
}

# Step 2: Check if IA Design System package exists
Write-Host "`n📦 Checking IA Design System package..." -ForegroundColor Yellow

if (-not (Test-Path $IAPackagePath)) {
    Write-Host "❌ IA Design System package not found at: $IAPackagePath" -ForegroundColor Red
    Write-Host "Please ensure the package exists at the specified location." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ IA Design System package found" -ForegroundColor Green

# Step 3: Extract IA Design System package
Write-Host "`n📂 Extracting IA Design System package..." -ForegroundColor Yellow

$TempExtractDir = "$ProjectPath\temp-ia-extraction"
New-DirectoryIfNotExists -Path $TempExtractDir

try {
    # Use tar command (available in Windows 10+) to extract
    Set-Location $TempExtractDir
    tar -xzf $IAPackagePath
    Write-Host "✅ IA Design System extracted successfully" -ForegroundColor Green
    
    # List extracted contents
    Write-Host "`n🔍 Analyzing package contents..." -ForegroundColor Yellow
    Get-ChildItem -Recurse -File | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $($_.FullName.Replace($TempExtractDir, '.'))" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Failed to extract package: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Copy components to EVA design system (adapt based on actual structure)
Write-Host "`n📋 Integrating IA components into EVA design system..." -ForegroundColor Yellow

Set-Location $ProjectPath

try {
    # Copy components if they exist
    $ComponentsSource = "$TempExtractDir\components"
    $TokensSource = "$TempExtractDir\tokens"
    $ThemesSource = "$TempExtractDir\themes"
    
    if (Test-Path $ComponentsSource) {
        Copy-Item -Path "$ComponentsSource\*" -Destination "$ProjectPath\src\design-system\components" -Recurse -Force
        Write-Host "✅ Components copied" -ForegroundColor Green
    }
    
    if (Test-Path $TokensSource) {
        Copy-Item -Path "$TokensSource\*" -Destination "$ProjectPath\src\design-system\tokens" -Recurse -Force  
        Write-Host "✅ Tokens copied" -ForegroundColor Green
    }
    
    if (Test-Path $ThemesSource) {
        Copy-Item -Path "$ThemesSource\*" -Destination "$ProjectPath\src\design-system\themes" -Recurse -Force
        Write-Host "✅ Themes copied" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Some components may not have been copied due to package structure differences" -ForegroundColor Yellow
}

# Step 5: Install dependencies
Write-Host "`n📦 Installing enterprise design system dependencies..." -ForegroundColor Yellow

try {
    # Core Storybook dependencies
    npm install --save-dev "@storybook/react@latest" "@storybook/addon-essentials@latest" "@storybook/addon-accessibility@latest" "@storybook/addon-controls@latest" "@storybook/addon-docs@latest" "@storybook/addon-viewport@latest" "@storybook/addon-backgrounds@latest" "@storybook/react-webpack5@latest"
    
    Write-Host "✅ Storybook dependencies installed" -ForegroundColor Green
    
    # Design system utilities
    npm install --save "@radix-ui/react-slot" "class-variance-authority" "clsx" "tailwind-merge" "@radix-ui/react-dropdown-menu" "@radix-ui/react-dialog" "@radix-ui/react-progress" "@radix-ui/react-switch" "@radix-ui/react-tabs" "@radix-ui/react-tooltip"
    
    Write-Host "✅ Design system utilities installed" -ForegroundColor Green
    
    # Accessibility testing dependencies
    npm install --save-dev "@axe-core/react" "jest-axe" "@testing-library/jest-dom"
    
    Write-Host "✅ Accessibility testing dependencies installed" -ForegroundColor Green
    
} catch {
    Write-Host "⚠️ Some dependencies may have failed to install: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 6: Create package.json scripts if they don't exist
Write-Host "`n📝 Setting up npm scripts..." -ForegroundColor Yellow

$PackageJsonPath = "$ProjectPath\package.json"
if (Test-Path $PackageJsonPath) {
    $PackageJson = Get-Content $PackageJsonPath | ConvertFrom-Json
    
    if (-not $PackageJson.scripts) {
        $PackageJson | Add-Member -Type NoteProperty -Name "scripts" -Value @{}
    }
    
    # Add Storybook scripts
    $PackageJson.scripts | Add-Member -Type NoteProperty -Name "storybook" -Value "storybook dev -p 6006" -Force
    $PackageJson.scripts | Add-Member -Type NoteProperty -Name "build-storybook" -Value "storybook build" -Force
    $PackageJson.scripts | Add-Member -Type NoteProperty -Name "test-storybook" -Value "test-storybook" -Force
    
    # Save updated package.json
    $PackageJson | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
    Write-Host "✅ npm scripts added to package.json" -ForegroundColor Green
}

# Step 7: Clean up temporary files
Write-Host "`n🧹 Cleaning up temporary files..." -ForegroundColor Yellow

try {
    Remove-Item -Path $TempExtractDir -Recurse -Force
    Write-Host "✅ Temporary files cleaned up" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not clean up temporary directory: $TempExtractDir" -ForegroundColor Yellow
}

# Step 8: Create initial design system structure
Write-Host "`n📂 Creating initial design system structure..." -ForegroundColor Yellow

# Create index file for design system
$IndexContent = @"
// EVA DA 2.0 Design System
// Built on PubSec Info Assistant design system foundation

// Export core components
export * from './components';
export * from './tokens';
export * from './themes';
export * from './utils';

// Design system version
export const DESIGN_SYSTEM_VERSION = '2.0.0';
"@

Set-Content -Path "$ProjectPath\src\design-system\index.ts" -Value $IndexContent
Write-Host "✅ Design system index created" -ForegroundColor Green

# Create components index
$ComponentsIndexContent = @"
// EVA DA 2.0 Components
// Enhanced components based on IA design system

// Core UI Components
export * from './Button';
export * from './Card';
export * from './Form';
export * from './Modal';
export * from './Navigation';
export * from './Table';

// Enterprise Components  
export * from './AgentOrchestrationDashboard';
export * from './ParameterRegistryAdmin';
export * from './RealTimeMetrics';
export * from './AccessibilityCompliance';
"@

New-DirectoryIfNotExists -Path "$ProjectPath\src\design-system\components"
Set-Content -Path "$ProjectPath\src\design-system\components\index.ts" -Value $ComponentsIndexContent
Write-Host "✅ Components index created" -ForegroundColor Green

# Final success message
Write-Host "`n🎉 EVA DA 2.0 Design System setup complete!" -ForegroundColor Green

Write-Host "`n📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Review extracted components in src/design-system/" -ForegroundColor White
Write-Host "2. Run 'npm run storybook' to start component development" -ForegroundColor White  
Write-Host "3. Begin enhancing components for enterprise features" -ForegroundColor White
Write-Host "4. Test accessibility compliance with new enhancements" -ForegroundColor White

Write-Host "`n📚 Useful commands:" -ForegroundColor Blue
Write-Host "  npm run storybook          # Start Storybook development server" -ForegroundColor Gray
Write-Host "  npm run build-storybook    # Build Storybook for deployment" -ForegroundColor Gray
Write-Host "  npm run test-storybook     # Run Storybook tests" -ForegroundColor Gray

Write-Host "`n✨ Design system integration ready for enterprise development!" -ForegroundColor Green