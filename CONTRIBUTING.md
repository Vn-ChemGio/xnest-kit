# Contributing to xnest-kit

Thank you for your interest in contributing to xnest-kit! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive experience for everyone.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/xnest-kit.git
   cd xnest-kit
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch from `dev`:
   ```bash
   git checkout dev
   git checkout -b feat/your-feature-name
   ```

## Development Setup

### Prerequisites

- Node.js >= 18
- npm >= 9

### Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Lint
npm run lint

# Lint (check only)
npm run lint:check

# Format
npm run format

# Test
npm run test

# Test with coverage
npm run test:cov
```

## Branching Strategy

We use **master + dev** branching model:

- `master` - Stable release branch. Only merged from `dev` via release PRs.
- `dev` - Development branch. All feature branches merge here.

### Branch Naming

| Prefix | Description | Example |
|--------|-------------|---------|
| `feat/` | New feature | `feat/add-redis-cache` |
| `fix/` | Bug fix | `fix/excel-parsing-error` |
| `docs/` | Documentation | `docs/update-readme` |
| `refactor/` | Code refactoring | `refactor/swagger-module` |
| `test/` | Adding tests | `test/cache-module` |
| `chore/` | Maintenance | `chore/update-deps` |

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(cache): add Redis cluster support` |
| `fix` | Bug fix | `fix(excel): fix parsing large files` |
| `docs` | Documentation | `docs: update API examples` |
| `style` | Formatting | `style: fix indentation` |
| `refactor` | Code refactoring | `refactor(swagger): simplify config` |
| `perf` | Performance | `perf(typeorm): optimize queries` |
| `test` | Tests | `test(queue): add unit tests` |
| `build` | Build system | `build: update tsconfig` |
| `ci` | CI/CD | `ci: add release workflow` |
| `chore` | Maintenance | `chore: update dependencies` |
| `revert` | Revert | `revert: undo cache changes` |

### Available Scopes

Scopes must match the feature module names in `src/`:

| Scope | Module | Description |
|-------|--------|-------------|
| `root` | Root level | package.json, tsconfig, CI, etc. |
| `swagger` | [swagger](./src/swagger) | Swagger/Scalar config & decorators |
| `cache` | [cache](./src/cache) | CacheManager with Redis/Valkey |
| `typeorm` | [typeorm](./src/typeorm) | TypeORM config & entity decorators |
| `queue` | [queue](./src/queue) | BullMQ config & decorators |
| `validation` | [validation](./src/validation) | Request validation with i18n |
| `notification` | [notification](./src/notification) | Multi-adapter notifications |
| `activity-feed` | [activity-feed](./src/activity-feed) | Activity tracking |
| `audit-log` | [audit-log](./src/audit-log) | Audit logging |
| `logger` | [logger](./src/logger) | Enhanced logging |
| `metrics` | [metrics](./src/metrics) | Prometheus metrics |
| `rate-limit` | [rate-limit](./src/rate-limit) | Rate limiting |
| `storage` | [storage](./src/storage) | S3/GCS/Azure storage |
| `stripe` | [stripe](./src/stripe) | Stripe integration |
| `webhook` | [webhook](./src/webhook) | Webhook handling |
| `excel` | [excel](./src/excel) | Excel file processing |

> Scope is optional. Omit it for cross-cutting changes:
> ```bash
> git commit -m "docs: update README"
> git commit -m "chore: update dependencies"
> ```

### Examples

```bash
# Feature
git commit -m "feat(excel): add Excel upload decorator"

# Bug fix
git commit -m "fix(cache): fix Redis connection timeout"

# Breaking change
git commit -m "feat(api)!: change configSwagger signature

BREAKING CHANGE: configSwagger now requires options object"
```

## Pull Request Process

1. **Create a PR** from your feature branch to `dev`
2. **Fill out the PR template** with:
   - Description of changes
   - Related issue number
   - Type of change (feat, fix, docs, etc.)
3. **Ensure CI passes** (lint, build, test)
4. **Request review** from maintainers
5. **Address feedback** and make requested changes
6. **Merge** after approval

### PR Title

Follow the same commit convention:
```
feat(cache): add Redis Sentinel support
```

### PR Description Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue

Closes #123

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Coding Standards

### TypeScript

- Use TypeScript strict mode features when possible
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` type - use `unknown` or proper types

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Single quotes for strings
- Trailing commas
- 2 spaces indentation

### File Structure

```
src/
  <module>/
    index.ts          # Public exports
    <module>.config.ts # Configuration
    <module>.module.ts # NestJS module
    decorators/       # Custom decorators
    README.md         # Module documentation
```

### Comments

- Write comments in English
- Use JSDoc for public APIs
- Explain complex logic
- Don't comment obvious code

```typescript
/**
 * Configure OpenAPI documentation for the NestJS application.
 *
 * @param app - The NestJS application instance
 * @param options - Configuration options
 * @returns void
 *
 * @example
 * configSwagger(app, { title: 'My API' });
 */
export function configSwagger(app: INestApplication, options: SwaggerOptions): void {
  // Implementation
}
```

## Testing

### Unit Tests

- Test one function/method per test
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```typescript
describe('configSwagger', () => {
  it('should configure Swagger documentation', () => {
    // Arrange
    const app = createMock<INestApplication>();
    const options = { title: 'Test API' };

    // Act
    configSwagger(app, options);

    // Assert
    expect(mockSwagger.setup).toHaveBeenCalled();
  });
});
```

### Test File Location

- Co-locate tests with source: `src/module/module.spec.ts`
- Use `.spec.ts` suffix for unit tests
- Use `.e2e-spec.ts` suffix for e2e tests

## Documentation

- Update README.md for new features
- Add JSDoc for new public APIs
- Update CHANGELOG.md with notable changes
- Add examples in module README.md

## Questions?

If you have questions, feel free to:
- Open an issue
- Start a discussion on GitHub
- Contact the maintainer at vn.chemgio@yahoo.com

Thank you for contributing!
