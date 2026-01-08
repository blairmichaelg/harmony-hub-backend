# Contributing to HarmonyHub Backend

Thank you for your interest in contributing to HarmonyHub Backend! We welcome contributions from the community and are excited to work with you.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Changes](#submitting-changes)
- [Development Guidelines](#development-guidelines)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)
  - [Testing](#testing)
  - [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/harmony-hub-backend.git
   cd harmony-hub-backend
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/blairmichaelg/harmony-hub-backend.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```
6. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear and descriptive title**
- **Detailed description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Node.js version, etc.)
- **Additional context** or logs

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) to create your issue.

### Suggesting Features

Feature suggestions are welcome! Before creating a feature request:

- **Check existing feature requests** to avoid duplicates
- **Clearly describe the feature** and its benefits
- **Explain the use case** and why it's valuable
- **Provide examples** or mockups if possible

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) to submit your suggestion.

### Submitting Changes

1. **Sync your fork** with the upstream repository:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our [development guidelines](#development-guidelines)

4. **Test your changes**:
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes** with a clear commit message:
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request** against the `main` branch

## Development Guidelines

### Code Style

We follow industry-standard TypeScript and Node.js best practices:

#### TypeScript

- Use **TypeScript** for all new code
- Enable **strict mode** type checking
- Define **interfaces** for all data structures
- Use **type annotations** for function parameters and return values
- Prefer **const** and **let** over **var**
- Use **async/await** instead of callbacks or raw promises

#### Naming Conventions

- **Files**: Use camelCase for file names (e.g., `userController.ts`)
- **Classes**: Use PascalCase (e.g., `UserService`)
- **Interfaces**: Use PascalCase with 'I' prefix (e.g., `IUser`)
- **Variables/Functions**: Use camelCase (e.g., `getUserById`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Database Models**: Use PascalCase (e.g., `User`, `Project`)

#### Code Organization

- Keep functions **small and focused** (single responsibility)
- Use **meaningful variable names**
- Add **JSDoc comments** for public APIs and complex functions
- Group related functionality into **services**
- Separate **business logic** from **controllers**

#### Example Code Style

```typescript
/**
 * Retrieves a user by their ID
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<IUser>} The user object
 * @throws {NotFoundError} If the user doesn't exist
 */
export async function getUserById(userId: string): Promise<IUser> {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring (no feature or bug fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config, etc.)
- **ci**: CI/CD changes

#### Examples

```bash
feat(auth): add JWT refresh token functionality

fix(audio): resolve memory leak in audio processing service

docs(readme): update installation instructions

refactor(user): simplify user registration logic

test(project): add unit tests for project controller
```

### Testing

- Write **unit tests** for all new features
- Maintain or improve **code coverage**
- Use **Jest** for testing
- Follow **AAA pattern** (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error conditions

#### Test Structure

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 'valid-user-id';
      const mockUser = { _id: userId, username: 'testuser' };
      jest.spyOn(User, 'findById').mockResolvedValue(mockUser);

      // Act
      const result = await getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(getUserById(userId)).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Documentation

- Add **JSDoc comments** for public APIs
- Update **README.md** if you change functionality
- Document **configuration options**
- Include **usage examples** where appropriate
- Update **API documentation** for GraphQL schema changes

## Pull Request Process

1. **Ensure your PR**:
   - Follows the code style guidelines
   - Includes tests for new features
   - Passes all existing tests
   - Updates relevant documentation
   - Has a clear description of changes

2. **PR Description should include**:
   - Summary of changes
   - Related issue numbers (e.g., "Fixes #123")
   - Testing performed
   - Screenshots (for UI changes)
   - Breaking changes (if any)

3. **Review Process**:
   - At least one maintainer must approve your PR
   - CI/CD checks must pass
   - Resolve all review comments
   - Keep your PR up-to-date with the main branch

4. **After Approval**:
   - Maintainers will merge your PR
   - Delete your feature branch
   - Update your local main branch

## Project Structure

```
src/
├── aiServices/           # AI and ML services
├── audioProcessing/      # Audio processing logic
├── collaborationEngine/  # Real-time collaboration
├── config/              # Configuration files
├── controllers/         # Request handlers
├── graphql/             # GraphQL schema and resolvers
├── middleware/          # Express middleware
├── models/              # Database models
├── routes/              # API routes
├── services/            # Business logic
├── tests/               # Test files
├── types/               # TypeScript types
├── utils/               # Utility functions
└── validators/          # Input validation
```

### Where to Add Your Code

- **New API endpoint**: Add to `routes/` and `controllers/`
- **Business logic**: Add to `services/`
- **Database model**: Add to `models/`
- **Utility function**: Add to `utils/`
- **Type definition**: Add to `types/` or `interfaces/`
- **Tests**: Mirror the structure in `tests/`

## Community

- **Questions?** Open a GitHub Discussion
- **Found a bug?** Open an issue
- **Have an idea?** Open a feature request
- **Want to chat?** Join our community (link TBD)

## Recognition

Contributors will be recognized in our README and release notes. Thank you for making HarmonyHub Backend better!

## License

By contributing to HarmonyHub Backend, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to HarmonyHub Backend! 🎵**
