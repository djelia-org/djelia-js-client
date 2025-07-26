/ CONTRIBUTING.md
# Contributing to Djelia JavaScript SDK

Thank you for your interest in contributing to the Djelia JavaScript SDK! This guide will help you get started.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/djelia-javascript-sdk.git
   cd djelia-javascript-sdk
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your DJELIA_API_KEY and TEST_AUDIO_FILE
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Run Linting**
   ```bash
   npm run lint
   npm run lint:fix
   ```

## Code Style

- Use 4 spaces for indentation
- Single quotes for strings
- Semicolons required
- Use meaningful variable names
- Add JSDoc comments for public methods

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Aim for good test coverage
- Use descriptive test names

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add/update tests
4. Run linting and tests
5. Update documentation if needed
6. Submit a pull request

## Questions?

- Open an issue for bugs or questions
- Tag @sudoping01 for maintainer attention
- Check existing issues before creating new ones

Thank you for contributing! 🙏
