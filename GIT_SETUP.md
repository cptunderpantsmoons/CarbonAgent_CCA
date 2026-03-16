# Git Repository Setup

## Current Status

✅ **Git Repository Initialized**
- Commit created: "Initial commit - Praxis Agent Carbon Platform with deployment documentation"
- 62 files committed
- Branch: main

## Next Steps - Push to GitHub

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `CarbonAgent` (or your preferred name)
3. Description: "Praxis Agent Carbon Platform - Intelligent email processing and carbon credit trading with autonomous agent orchestration"
4. Visibility: Public (recommended) or Private
5. Initialize with README
6. Click "Create repository"

### 2. Connect Local Repository to GitHub

Replace `<YOUR_USERNAME>` with your GitHub username:

```bash
# Set GitHub remote
git remote add origin https://github.com/<YOUR_USERNAME>/CarbonAgent.git

# Verify remote
git remote -v

# Should show: origin https://github.com/<YOUR_USERNAME>/CarbonAgent.git
```

### 3. Push to GitHub

```bash
# Push main branch to GitHub
git push -u origin main

# First time? You'll be prompted for GitHub credentials
# After first push, credentials are cached locally
```

### 4. Verify Push

```bash
# Check remote status
git status
# Should show: "nothing to commit, working tree clean"

# Check recent commits
git log --oneline -5

# Verify on GitHub
# Go to https://github.com/<YOUR_USERNAME>/CarbonAgent
# Should see all files and commit history
```

## Troubleshooting

### "Permission Denied" Error

```bash
# If you get permission denied, try:
git push -u origin main --force
```

### "Remote Already Exists" Error

```bash
# Remove existing remote and add new one
git remote remove origin
git remote add origin https://github.com/<YOUR_USERNAME>/CarbonAgent.git
```

### Branch Name Issues

```bash
# If you want to rename master to main:
git checkout -b main
git branch -D master
git push -u origin main
```

## After Push to GitHub

Once pushed to GitHub, you can deploy to:

1. **Hostinger** (see HOSTINGER_DEPLOYMENT.md)
2. **Railway** (see COMPLETE_DEPLOYMENT_GUIDE.md)
3. **VPS/Cloud Provider** (use docker-compose.unified.yml)

## Quick Reference

| Command | Purpose |
|----------|---------|
| `git status` | Check working tree status |
| `git add .` | Stage all files |
| `git commit -m "message"` | Commit changes |
| `git push -u origin main` | Push to GitHub |
| `git log --oneline` | View recent commits |
| `git remote -v` | Check remote configuration |

---

**Ready to push!** Complete steps 1-4 above to push your code to GitHub.
