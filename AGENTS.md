# AGENTS.md - AI Agent Instructions for xnest-kit

## Project Overview

xnest-kit is a modular NestJS toolkit published as an npm package. It provides 15 feature modules for common NestJS integrations.

## Coding Standards

### TypeScript

- **Language**: Always write code and comments in **English**
- **TypeScript**: Use strict TypeScript features when possible
- **Types**: Prefer interfaces over types for object shapes
- **Any**: Avoid `any` type - use `unknown` or proper types
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/interfaces

### Code Style

- **Formatter**: Prettier with single quotes, trailing commas
- **Linter**: ESLint with TypeScript rules
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Line length**: Max 100 characters

### Comments & Documentation

- **JSDoc**: Required for all public APIs
- **Language**: Write comments in English
- **Format**: Use JSDoc format for functions, classes, and interfaces

```typescript
/**
 * Configure OpenAPI documentation for the NestJS application.
 *
 * @param app - The NestJS application instance
 * @param options - Configuration options
 * @returns void
 *
 * @example
 * configOpenApi(app, { title: 'My API' });
 */
export function configOpenApi(app: INestApplication, options: OpenApiOptions): void {
  // Implementation
}
```

### Testing

- **Framework**: Jest
- **File naming**: `*.spec.ts` for unit tests, `*.e2e-spec.ts` for e2e tests
- **Location**: Co-locate tests with source files
- **Coverage**: Aim for >80% coverage on implemented modules
- **Pattern**: AAA (Arrange, Act, Assert)

```typescript
describe('configOpenApi', () => {
  it('should configure Swagger documentation', () => {
    // Arrange
    const app = createMock<INestApplication>();
    const options = { title: 'Test API' };

    // Act
    configOpenApi(app, options);

    // Assert
    expect(mockSwagger.setup).toHaveBeenCalled();
  });
});
```

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Available Scopes (feature module names):
`root`, `openapi`, `cache`, `typeorm`, `queue`, `validation`, `notification`, `activity-feed`, `audit-log`, `logger`, `metrics`, `rate-limit`, `storage`, `stripe`, `webhook`, `excel`

Use `root` scope for root-level changes (package.json, tsconfig, CI, etc.)

Scope is optional. Omit for cross-cutting changes.

Example:
```
feat(excel): add Excel upload decorator
fix(cache): fix Redis connection timeout
docs: update API examples
```

## Module Structure

Each feature module follows this structure:

```
src/<module>/
  index.ts              # Public exports
  <module>.config.ts    # Configuration functions
  <module>.module.ts    # NestJS module
  decorators/           # Custom decorators (optional)
  README.md             # Module documentation
```

## Before Committing

Always run these checks:

```bash
# Lint
npm run lint:check

# Build
npm run build

# Test
npm run test

# Format check
npx prettier --check "src/**/*.ts"
```

## Forbidden Patterns

- Never commit secrets, API keys, or credentials
- Never use `console.log` in production code (use NestJS Logger)
- Never skip tests without documented reason
- Never merge broken CI
- Never use `@ts-ignore` without documented reason

## Language Rules

- **Code comments**: Always in English
- **Commit messages**: Always in English
- **Documentation**: Always in English
- **Agent communication**: Can use the language of the user's question
- **Explanations**: Can use the language of the user's question
