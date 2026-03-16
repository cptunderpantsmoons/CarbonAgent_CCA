# InsForge Docker Build Issue

## Problem

InsForge Docker build fails during `npm ci` due to shared-schemas workspace attempting to run TypeScript compilation during install.

## Root Cause

The `shared-schemas/package.json` contains:
```json
"scripts": {
  "prepare": "npm run build",
  "prepublishOnly": "npm run build"
}
```

During Docker build, `npm ci` automatically runs lifecycle scripts including `prepare`, which attempts to compile TypeScript with `tsc`. This fails because:
1. TypeScript compiler isn't available in the build environment at that stage
2. The workspace has dependency issues in the Docker build context
3. The shared-schemas package.json references ES2022 target but build environment uses incompatible Node/TypeScript versions

## Attempted Solutions

1. **Remove prepare script with jq** - Failed because jq not available in deps stage
2. **Use --ignore-scripts flag** - Still fails because prepare script runs during install
3. **Pre-build shared-schemas locally** - Would work but breaks reproducible builds
4. **Copy pre-built dist** - Failed because prepare script still runs

## Current Status

**BLOCKING ISSUE** - InsForge Docker image cannot be built

## Workaround

For now, we'll deploy without InsForge and use the pre-built `ghcr.io/insforge/postgres` image for database needs.

## Next Steps

Option 1: Contact InsForge maintainers for guidance on Docker build process
Option 2: Fork InsForge and fix the Dockerfile to handle shared-schemas build correctly
Option 3: Use InsForge cloud service directly instead of local deployment
