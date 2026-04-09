<!--
Copyright (C) 2026 HMTC 2026

This project is licensed under the GNU General Public License v3.
For more details, see https://www.gnu.org/licenses/gpl-3.0.en.html.
-->
# HMTC Frontend Repository - 2026

![Status](https://uptime-kuma.hmtc-its.com/api/badge/1/status?style=flat-square)
![Uptime](https://uptime-kuma.hmtc-its.com/api/badge/1/uptime?style=flat-square)
![Response](https://uptime-kuma.hmtc-its.com/api/badge/1/response?style=flat-square)

## Getting Started

### 1. Clone the Repository

You can clone this repository using one of the following methods:

#### a. Using Terminal (Bash, etc.)

```bash
git clone https://github.com/HMTCITS/hmtc-frontend-2025.git
```

#### b. Using [GitHub Desktop](https://desktop.github.com/)

Follow the instructions on GitHub Desktop to clone the repository.

---

### 2. Install Dependencies

It is highly recommended to use **pnpm** to install dependencies, as it ensures that Husky hooks and other tooling work properly.

```bash
pnpm install
```

---

### 3. Run the Development Server

Start the development server with the following command:

```bash
pnpm dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application. The main entry point is located at `src/app/page.tsx` (for App Router).

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Commit messages are enforced using Husky and commitlint to maintain consistency.

### Commit Message Format

```
<type>(optional scope): <description>
```

#### Example:

```
feat(pre-event): add speakers section
```

### Available Types

- **feat** → New feature or removal of a feature  
  _Example: `feat: add table on landing page`_
- **fix** → Bug fixes  
  _Example: `fix: correct overflow issue in mobile view`_
- **docs** → Documentation updates  
  _Example: `docs: update README.md`_
- **style** → Code style updates (formatting, import reordering, etc.) without affecting logic
- **chore** → Dependency updates or maintenance tasks
- **refactor** → Code refactoring without changing functionality
- **ci** → Updates to GitHub workflows, Husky, or CI/CD configurations
- **test** → Updates to tests or testing configurations
- **revert** → Reverting previous commits
- **perf** → Performance improvements
- **vercel** → Triggering a Vercel deployment  
  _Example: `vercel: trigger deployment`_

### Additional Guidelines

- **Optional Scope:**  
  Specify a scope if needed (e.g., `feat(pre-event): add date label`). Omit if not applicable.
- **Description:**  
  Provide a concise yet detailed explanation of the changes.
- **Formatting:**
  - Use the imperative mood (e.g., `add`, not `added`).
  - Start with a lowercase letter.
  - Do not end with a full stop.
- **Multiple Changes:**  
  Commit changes separately if multiple unrelated changes are made.

---

## Testing and Quality Checks

### TypeScript Type Checking

Ensure your code is type-safe:

```bash
pnpm typecheck
```

### Linting

Check your code quality with ESLint:

```bash
pnpm lint:strict
```

### Prettier

Ensure consistent code formatting:

```bash
pnpm format:check
```

---

## Deployment

Each pull request will automatically trigger a preview deployment on Vercel. Once the pull request is closed or merged, the preview deployment is automatically removed. This enables you to test changes in a live environment before merging into the main branch.

---

## Resources

- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS:** [https://tailwindcss.com](https://tailwindcss.com)
- **pnpm:** [https://pnpm.io](https://pnpm.io)
- **Conventional Commits:** [https://www.conventionalcommits.org](https://www.conventionalcommits.org)

---
