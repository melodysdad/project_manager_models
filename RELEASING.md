# Releasing Packages

This repository uses automated releases with [semantic-release](https://semantic-release.gitbook.io/) and [conventional commits](https://www.conventionalcommits.org/).

## How It Works

1. **Commit with conventional commit messages** to describe your changes
2. **Push to `main`** - GitHub Actions will automatically:
   - Analyze commits since last release
   - Determine version bump (major/minor/patch)
   - Update versions in package.json files
   - Publish to GitHub Packages
   - Create a GitHub release with release notes

## Conventional Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature (bumps **minor** version)
- **fix**: A bug fix (bumps **patch** version)
- **refactor**: Code refactoring (bumps **patch** version)
- **perf**: Performance improvement (bumps **patch** version)
- **docs**: Documentation changes (no version bump)
- **style**: Code style changes (no version bump)
- **test**: Test changes (no version bump)
- **chore**: Maintenance tasks (no version bump)
- **revert**: Reverts a previous commit (bumps **patch** version)

### Breaking Changes

Add `BREAKING CHANGE:` in the footer to bump a **major** version:

```
feat(auth): redesign login flow

BREAKING CHANGE: login endpoint now requires OAuth token instead of username/password
```

## Examples

### Bug Fix
```
fix(handlers): correct CloudEvent validation logic

Fixes #42
```

### New Feature
```
feat(models): add TaskAssignment primitive type

Includes fields for task_id, assigned_to, and status tracking.
```

### Breaking Change
```
feat(models)!: rename Conversation.actor_ids to Conversation.participants

BREAKING CHANGE: actor_ids field removed, use participants instead
```

## Publishing Manually

To trigger a release without automatic semver:

```bash
npm install
npx semantic-release
```

## Release History

All releases are documented in the [GitHub Releases](https://github.com/melodysdad/project_manager_models/releases) page.
