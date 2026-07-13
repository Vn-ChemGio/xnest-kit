# SKILL.md - Development Workflow Skills

## Build & Compile

```bash
# Full build
npm run build

# Build only (clean)
npm run build:all
```

## Lint & Format

```bash
# Lint with auto-fix
npm run lint

# Lint check only (no fix)
npm run lint:check

# Format code
npm run format

# Check formatting
npx prettier --check "src/**/*.ts"
```

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Pre-commit Checks

Before committing, always run:

```bash
npm run lint:check && npm run build && npm run test
```

## Git Workflow

### Branch Naming

```
feat/<feature-name>    # New feature
fix/<bug-name>         # Bug fix
docs/<doc-name>        # Documentation
refactor/<name>        # Code refactoring
test/<name>            # Adding tests
chore/<name>           # Maintenance
```

### Commit Messages

```
feat(module): add new feature
fix(module): fix bug
docs: update documentation
test(module): add tests
chore: update dependencies
```

### Release Process

1. Ensure all tests pass
2. Update CHANGELOG.md
3. Create release PR from `dev` to `master`
4. Merge PR
5. Create and push tag:
   ```bash
   git tag v0.1.0-alpha.1
   git push origin v0.1.0-alpha.1
   ```
6. GitHub Actions will publish to npm

## Common Tasks

### Add New Module

1. Create directory: `src/<module-name>/`
2. Create `index.ts` with exports
3. Create module file: `<module-name>.module.ts`
4. Create config file: `<module-name>.config.ts`
5. Add to root `src/index.ts`
6. Add to `package.json` exports
7. Create documentation in `docs/api/<module-name>.md`

### Update Dependencies

```bash
# Check outdated
npm outdated

# Update all
npm update

# Update specific
npm install <package>@latest
```

### Clean Build

```bash
rm -rf dist && npm run build
```

## IDE Setup

### VS Code Extensions

- ESLint
- Prettier
- TypeScript
- Jest

### Recommended Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Documentation

### Serve Docs Locally

```bash
# Install docsify-cli
npm install -g docsify-cli

# Serve documentation
docsify serve docs
```

### Documentation Structure

```
docs/
  index.html          # Docsify entry point
  _sidebar.md         # Navigation
  _coverpage.md       # Cover page
  README.md           # Home page
  guide/              # User guides
  api/                # API reference
  examples.md         # Usage examples
```

## Troubleshooting

### Build Fails

1. Check TypeScript errors: `npx tsc --noEmit`
2. Clear cache: `rm -rf dist node_modules/.cache`
3. Reinstall: `rm -rf node_modules && npm install`

### Tests Fail

1. Check test environment
2. Verify mocks are set up correctly
3. Run with verbose: `npm run test -- --verbose`

### Lint Errors

1. Auto-fix: `npm run lint`
2. Check specific file: `npx eslint src/path/to/file.ts`
