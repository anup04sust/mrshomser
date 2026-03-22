# Contributing to mrSomsher

Thank you for your interest in contributing to mrSomsher (সবজান্তা শমসের)! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone.

### Our Standards

**Positive behavior includes:**
- Being respectful and inclusive
- Accepting constructive feedback
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

---

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/mrshomser.git
cd mrshomser
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/dreamsteps/mrshomser.git
```

### 4. Set Up Development Environment

```bash
ddev start
ddev exec pnpm install
```

See [INSTALL.md](INSTALL.md) for detailed setup instructions.

---

## Development Process

### 1. Create a Branch

Always work on a new branch, never on `main`.

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/what-you-changed
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run the app
ddev restart

# Check for TypeScript errors
ddev exec pnpm type-check

# Run linter
ddev exec pnpm lint

# Test manually in browser
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

See [Commit Messages](#commit-messages) for guidelines.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of your changes
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] No TypeScript errors
- [ ] Linter passes
- [ ] Tested locally

### Submitting a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template:
   - **Title:** Clear, descriptive title
   - **Description:** What and why
   - **Screenshots:** If UI changes
   - **Related Issues:** Link issues if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How you tested the changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No TypeScript errors
- [ ] Tested locally
```

### After Submission

- Respond to feedback promptly
- Make requested changes
- Keep commits clean (squash if needed)
- Be patient! Reviews take time

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Export types when shared

**Example:**
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export async function getUser(id: string): Promise<UserProfile> {
  // Implementation
}
```

### React Components

- Use functional components
- Use hooks (no class components)
- Keep components small and focused
- Extract reusable logic into custom hooks

**Example:**
```typescript
'use client';

import { useState } from 'react';

export default function MyComponent({ title }: { title: string }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
```

### Styling

- Use TailwindCSS utility classes
- Follow existing patterns
- Keep responsive design in mind
- Use dark mode classes when applicable

**Example:**
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 rounded-lg text-white font-semibold transition-colors">
  Click Me
</button>
```

### File Organization

```
app/
├── api/              # API routes
├── components/       # React components
├── lib/             # Utility functions
├── types/           # TypeScript types
└── utils/           # Helper functions
```

### Naming Conventions

- **Files:** `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

### Examples

**Good:**
```
feat(auth): add password reset functionality

Implemented password reset flow with email verification.
Users can now request a reset link via /forgot-password.

Closes #123
```

**Also Good:**
```
fix(chat): prevent duplicate messages on reconnect
```

**Bad:**
```
fixed stuff
```

```
Update file
```

### Guidelines

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- First line max 72 characters
- Reference issues in footer
- Explain **why** in body, not just **what**

---

## Testing

### Manual Testing Checklist

Before submitting, test:

- [ ] Feature works as expected
- [ ] Works on mobile (responsive)
- [ ] Works in different browsers
- [ ] No console errors
- [ ] Loading states display correctly
- [ ] Error handling works
- [ ] Dark mode works (if applicable)

### Testing API Endpoints

```bash
# Test with curl
curl -X POST https://mrshomser.ddev.site/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# Check logs
ddev logs -f
```

---

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are beginner-friendly.

### Areas We Need Help

- **Features:** New AI modes, voice support, document parsing
- **Bug Fixes:** Check open issues
- **Documentation:** Improve guides, add examples
- **UI/UX:** Design improvements, accessibility
- **Performance:** Optimize rendering, reduce bundle size
- **Testing:** Add unit/integration tests
- **Internationalization:** More languages

### Ideas for Contributions

- Add new Ollama models
- Improve markdown rendering
- Add export functionality
- Enhance mobile experience
- Add keyboard shortcuts
- Improve error messages
- Add animations
- Create themes

---

## Getting Help

### Questions?

- **GitHub Discussions:** Ask questions
- **Issues:** Report bugs
- **Discord:** [Coming soon]
- **Email:** support@dreamsteps.io

### Review Process

- PRs are reviewed within 1-7 days
- Feedback is constructive
- Multiple rounds of review are normal
- Be patient and responsive

---

## Recognition

Contributors are credited in:
- README.md
- CHANGELOG.md
- GitHub contributors page

Thank you for making mrSomsher better! 🎉

---

*Last updated: March 23, 2026*
