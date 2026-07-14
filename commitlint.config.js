/**
 * @file Commitlint configuration for xnest-kit.
 * @description Enforces conventional commit messages for consistent git history.
 * @see https://commitlint.js.org/
 */

/**
 * Available scopes are the feature module names in src/.
 * Use the module name (without src/ prefix) as the scope value.
 */
const SCOPES = [
  'root',
  'swagger',
  'cache',
  'typeorm',
  'queue',
  'validation',
  'notification',
  'activity-feed',
  'audit-log',
  'logger',
  'metrics',
  'rate-limit',
  'storage',
  'stripe',
  'webhook',
  'excel',
];

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, semicolons, etc.)
        'refactor', // Code refactoring without functionality changes
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'build', // Build system or dependency changes
        'ci', // CI configuration changes
        'chore', // Maintenance tasks
        'revert', // Reverting a previous commit
      ],
    ],
    // Scope must be one of the available module names (or empty)
    'scope-enum': [2, 'always', SCOPES],
    // Allow lowercase type
    'type-case': [0],
    // Allow empty scope
    'scope-empty': [0],
    // Scope must be lowercase
    'scope-case': [2, 'always', 'lower-case'],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Allow any subject format
    'subject-case': [0],
    // Header max length (72 characters recommended)
    'header-max-length': [2, 'always', 100],
    // Body max line length (unlimited for detailed descriptions)
    'body-max-line-length': [0],
    // Footer max line length (unlimited)
    'footer-max-line-length': [0],
  },
};
