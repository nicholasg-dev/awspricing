# Contributing to AWS EC2 Instance Pricing Tool

Thank you for considering contributing to the AWS EC2 Instance Pricing Tool! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/aws-pricing-tool.git
   cd aws-pricing-tool
   ```
3. Install dependencies:
   ```bash
   npm run install-all
   ```
4. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in your feature branch
2. Run tests to ensure your changes don't break existing functionality:
   ```bash
   cd frontend && npm test
   cd ../backend && npm test
   ```
3. Run linting to ensure your code follows the project's coding standards:
   ```bash
   npm run lint
   ```
4. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
5. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a pull request from your fork to the main repository

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md or documentation if necessary
3. Include tests for your changes
4. Ensure all tests pass
5. Your pull request will be reviewed by the maintainers
6. Address any feedback from the review
7. Once approved, your pull request will be merged

## Coding Standards

### JavaScript/React

- Use ES6+ features
- Use functional components with hooks for React
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Add comments for complex logic

### CSS

- Use descriptive class names
- Follow BEM (Block Element Modifier) naming convention
- Keep styles modular and reusable

## Project Structure

Please maintain the project structure:

```
aws-pricing-tool/
├── backend/                 # Express.js backend
│   ├── src/                 # Backend source code
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── server.js            # Backend entry point
│   └── package.json         # Backend dependencies
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── styles/          # CSS and style files
│   │   └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
├── docs/                    # Documentation files
└── README.md                # Project documentation
```

## Testing

- Write tests for all new features and bug fixes
- Ensure all tests pass before submitting a pull request
- Frontend tests use Jest and React Testing Library
- Backend tests use Mocha and Chai

## Documentation

- Update documentation for any changes to the API or components
- Document new features and changes to existing features
- Keep the README.md up to date
- Add JSDoc comments to functions and components

## Issue Reporting

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [Issues](https://github.com/yourusername/aws-pricing-tool/issues)
2. If not, create a new issue with a descriptive title and detailed description
3. Include steps to reproduce the issue
4. Include screenshots if applicable
5. Include information about your environment (browser, OS, etc.)

## Feature Requests

If you have an idea for a new feature:

1. Check if the feature has already been requested in the [Issues](https://github.com/yourusername/aws-pricing-tool/issues)
2. If not, create a new issue with a descriptive title and detailed description
3. Explain why the feature would be useful
4. Provide examples of how the feature would work

Thank you for contributing to the AWS EC2 Instance Pricing Tool!
