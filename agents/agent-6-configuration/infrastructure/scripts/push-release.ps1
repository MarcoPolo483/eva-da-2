# scripts/push-release.ps1
# Create a git tag and push to origin. Run locally where your git remote is configured.

param(
  [string]$Version = "0.75",
  [string]$Remote = "origin"
)

$tag = "v$Version"
Write-Host "Creating tag $tag and pushing to $Remote..."

git tag -a $tag -m "Release $tag"
if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to create tag. Aborting." -ForegroundColor Red
  exit 1
}

git push $Remote $tag
if ($LASTEXITCODE -ne 0) {
  Write-Host "Failed to push tag. Check your remote and credentials." -ForegroundColor Red
  exit 1
}

Write-Host "Tag pushed. You may also push branches if needed: git push $Remote main"
