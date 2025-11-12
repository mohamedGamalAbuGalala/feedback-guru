# Phase 6E: Testing & QA - Plan

## 🎯 Objective
Implement comprehensive testing infrastructure to ensure code quality, reliability, and maintainability. Establish CI/CD pipeline for automated testing and deployment.

## 📋 Requirements Analysis

### Current State
- ✅ All features implemented (Phases 6A-6D)
- ✅ Manual testing performed
- ❌ No automated tests
- ❌ No CI/CD pipeline
- ❌ No test coverage reporting

### Target State
- ✅ Automated unit tests (80%+ coverage)
- ✅ Integration tests for APIs
- ✅ E2E tests for critical flows
- ✅ CI/CD with GitHub Actions
- ✅ Test coverage reporting
- ✅ Pre-commit hooks

## 📊 Testing Strategy

### Test Pyramid

```
        /\
       /E2E\         ~10% - Critical user flows
      /------\
     /  Int   \      ~20% - API & integration tests
    /----------\
   /   Unit     \    ~70% - Functions, utilities, components
  /--------------\
```

### Testing Layers

**Layer 1: Unit Tests** (70% of tests)
- Pure functions
- Utility libraries
- Helper functions
- React components (logic)
- Validation schemas

**Layer 2: Integration Tests** (20% of tests)
- API endpoints
- Database operations
- Authentication flows
- Authorization checks

**Layer 3: E2E Tests** (10% of tests)
- User registration & login
- Feedback submission
- Dashboard workflows
- Critical user journeys

## 🔧 Technology Stack

### Testing Frameworks

**Unit & Integration Testing**:
- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - Custom matchers
- **@testing-library/user-event** - User interactions

**E2E Testing**:
- **Playwright** - Browser automation
- Multi-browser support (Chromium, Firefox, WebKit)
- Parallel test execution
- Built-in test runner

**Mocking & Utilities**:
- **MSW** (Mock Service Worker) - API mocking
- **jest-mock-extended** - TypeScript mocking
- **@faker-js/faker** - Test data generation

### CI/CD Tools

**GitHub Actions**:
- Automated test runs on PR
- Code coverage reports
- Deployment automation
- Matrix testing (multiple Node versions)

**Code Quality**:
- **ESLint** - Linting (already configured)
- **Prettier** - Formatting (already configured)
- **Husky** - Git hooks
- **lint-staged** - Pre-commit validation

## 📐 Implementation Plan

### Phase 6E.1: Testing Infrastructure Setup

**Estimated Time**: 2 hours

**Tasks**:
1. Install testing dependencies
2. Configure Jest for Next.js
3. Setup React Testing Library
4. Install and configure Playwright
5. Create test utilities and helpers
6. Setup MSW for API mocking
7. Configure test scripts in package.json

**Files to Create**:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Jest setup file
- `playwright.config.ts` - Playwright configuration
- `tests/setup/` - Test utilities
- `tests/mocks/` - Mock data and handlers

**Dependencies to Install**:
```json
{
  "devDependencies": {
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/user-event": "^14.x",
    "@playwright/test": "^1.40.x",
    "msw": "^2.x",
    "jest-environment-jsdom": "^29.x",
    "@faker-js/faker": "^8.x",
    "jest-mock-extended": "^3.x"
  }
}
```

### Phase 6E.2: Unit Tests

**Estimated Time**: 4 hours

**Target Coverage**: 80%+

**Priority 1 - Security & Validation**:
- `lib/sanitize.ts` - XSS sanitization functions
- `lib/validation-schemas.ts` - Zod schemas
- `lib/rate-limiter.ts` - Rate limiting logic
- `lib/auth-helpers.ts` - Authorization helpers

**Priority 2 - Utilities**:
- `lib/pagination.ts` - Pagination helpers
- `lib/with-rate-limit.ts` - Rate limit wrapper

**Priority 3 - Components**:
- `components/search-input.tsx` - Search component logic
- `components/feedback-filters.tsx` - Filter logic
- `components/bulk-actions.tsx` - Bulk actions logic

**Test Files to Create**:
```
tests/unit/
├── lib/
│   ├── sanitize.test.ts
│   ├── validation-schemas.test.ts
│   ├── rate-limiter.test.ts
│   ├── auth-helpers.test.ts
│   ├── pagination.test.ts
│   └── with-rate-limit.test.ts
└── components/
    ├── search-input.test.tsx
    ├── feedback-filters.test.tsx
    └── bulk-actions.test.tsx
```

**Example Unit Test Structure**:
```typescript
// tests/unit/lib/sanitize.test.ts
import { sanitizeHtml, sanitizeInput, containsXssPatterns } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<script>');
    expect(result).toBe('Hello');
  });

  it('should allow safe HTML tags', () => {
    const safe = '<p>Hello <strong>World</strong></p>';
    const result = sanitizeHtml(safe);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  // ... more tests
});
```

### Phase 6E.3: Integration Tests

**Estimated Time**: 4 hours

**Target Coverage**: Key API endpoints

**Priority 1 - Authentication & Authorization**:
- `/api/auth/register` - User registration
- `/api/auth/[...nextauth]` - Login/logout
- Authorization helpers in API routes

**Priority 2 - Core Features**:
- `/api/feedback` - CRUD operations
- `/api/feedback/search` - Search functionality
- `/api/feedback/bulk` - Bulk operations
- `/api/analytics` - Analytics endpoint

**Priority 3 - Advanced Features**:
- `/api/changelog` - Changelog CRUD
- `/api/team/invite` - Team management

**Test Files to Create**:
```
tests/integration/
├── api/
│   ├── auth/
│   │   ├── register.test.ts
│   │   └── login.test.ts
│   ├── feedback/
│   │   ├── crud.test.ts
│   │   ├── search.test.ts
│   │   └── bulk.test.ts
│   ├── analytics.test.ts
│   └── changelog.test.ts
└── db/
    └── operations.test.ts
```

**Example Integration Test**:
```typescript
// tests/integration/api/feedback/crud.test.ts
import { POST, GET } from '@/app/api/feedback/route';

describe('POST /api/feedback', () => {
  it('should create feedback with valid API key', async () => {
    const request = new NextRequest('http://localhost/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        apiKey: 'test-api-key',
        category: 'BUG',
        description: 'Test feedback description',
        url: 'https://example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();
  });

  it('should reject feedback with invalid API key', async () => {
    // ... test implementation
  });

  // ... more tests
});
```

### Phase 6E.4: E2E Tests

**Estimated Time**: 4 hours

**Critical User Flows** (5 flows):

**Flow 1: User Registration & Login**
1. Visit registration page
2. Fill registration form
3. Submit and create account
4. Redirect to dashboard
5. Verify workspace created

**Flow 2: Feedback Submission (Public)**
1. Load widget with API key
2. Fill feedback form
3. Upload screenshot
4. Submit feedback
5. Verify success message

**Flow 3: Dashboard - View & Filter Feedback**
1. Login as admin
2. Navigate to feedback list
3. Apply filters (category, status)
4. Verify filtered results
5. Clear filters

**Flow 4: Analytics Dashboard**
1. Login as admin
2. Navigate to analytics
3. Verify charts render
4. Change time period
5. Verify data updates

**Flow 5: Bulk Operations**
1. Login as admin
2. Navigate to feedback list
3. Select multiple items
4. Update status in bulk
5. Verify changes applied

**Test Files to Create**:
```
tests/e2e/
├── auth/
│   ├── registration.spec.ts
│   └── login.spec.ts
├── feedback/
│   ├── submission.spec.ts
│   ├── filtering.spec.ts
│   └── bulk-operations.spec.ts
├── analytics/
│   └── dashboard.spec.ts
└── changelog/
    └── management.spec.ts
```

**Example E2E Test**:
```typescript
// tests/e2e/auth/registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for existing email', async ({ page }) => {
    // ... test implementation
  });
});
```

### Phase 6E.5: CI/CD Setup

**Estimated Time**: 2 hours

**GitHub Actions Workflows**:

**1. Test Workflow** (`.github/workflows/test.yml`):
- Trigger: Pull request, push to main
- Steps:
  1. Checkout code
  2. Setup Node.js (18.x, 20.x matrix)
  3. Install dependencies
  4. Run linting
  5. Run unit tests
  6. Run integration tests
  7. Upload coverage report
  8. Comment PR with coverage

**2. E2E Workflow** (`.github/workflows/e2e.yml`):
- Trigger: Pull request (labeled), push to main
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Setup test database
  5. Run E2E tests (parallel)
  6. Upload test artifacts (screenshots, videos)

**3. Deploy Workflow** (`.github/workflows/deploy.yml`):
- Trigger: Push to main (after tests pass)
- Steps:
  1. Run all tests
  2. Build application
  3. Deploy to staging
  4. Run smoke tests
  5. Deploy to production (manual approval)

**Example Workflow**:
```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Phase 6E.6: Pre-commit Hooks

**Estimated Time**: 1 hour

**Husky Setup**:
- Install Husky
- Configure pre-commit hook
- Configure commit-msg hook

**Pre-commit Tasks**:
1. Run ESLint on staged files
2. Run Prettier on staged files
3. Run type checking (TypeScript)
4. Run affected tests (optional)

**Files to Create**:
- `.husky/pre-commit` - Pre-commit hook
- `.husky/commit-msg` - Commit message validation
- `.lintstagedrc.js` - Lint-staged configuration

**Example Configuration**:
```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --findRelatedTests --passWithNoTests'
  ],
  '*.{json,md,yml,yaml}': ['prettier --write']
};
```

## 📋 Test Coverage Goals

### Overall Target: 80%+

**By Module**:
| Module | Target Coverage | Priority |
|--------|----------------|----------|
| Security (sanitize, auth) | 95%+ | Critical |
| API Routes | 85%+ | High |
| Utilities | 90%+ | High |
| Components | 75%+ | Medium |
| Pages | 60%+ | Medium |

### Coverage Metrics

**Statements**: 80%+
**Branches**: 75%+
**Functions**: 85%+
**Lines**: 80%+

## 🎯 Success Criteria

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage > 80%
- [ ] CI/CD pipeline configured
- [ ] Pre-commit hooks working
- [ ] No failing tests in main branch
- [ ] Test documentation complete

## 📊 Testing Best Practices

### Naming Conventions

**Test Files**:
- Unit: `*.test.ts(x)`
- Integration: `*.integration.test.ts`
- E2E: `*.spec.ts`

**Test Descriptions**:
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do X when Y', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### AAA Pattern

**Arrange-Act-Assert**:
```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [1, 2, 3];
  const expected = 6;

  // Act
  const result = calculateTotal(items);

  // Assert
  expect(result).toBe(expected);
});
```

### Test Independence

- Each test should be independent
- No shared state between tests
- Use beforeEach for setup
- Use afterEach for cleanup

### Mocking Strategy

**Mock External Dependencies**:
- Database calls
- API requests
- File system operations
- Time-dependent code

**Don't Mock**:
- Code under test
- Simple utilities
- Constants

## 🔍 Code Review Checklist

### For Every PR

- [ ] All tests pass
- [ ] Code coverage maintained or improved
- [ ] No console.log/errors
- [ ] TypeScript types correct
- [ ] ESLint passing
- [ ] Prettier formatted
- [ ] Tests included for new code
- [ ] Documentation updated

## 📈 Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 6E.1: Infrastructure Setup | 2 hours | None |
| 6E.2: Unit Tests | 4 hours | 6E.1 |
| 6E.3: Integration Tests | 4 hours | 6E.1 |
| 6E.4: E2E Tests | 4 hours | 6E.1 |
| 6E.5: CI/CD Setup | 2 hours | 6E.2, 6E.3, 6E.4 |
| 6E.6: Pre-commit Hooks | 1 hour | None |
| **Total** | **17 hours** | |

## 🚀 Implementation Order

1. **Infrastructure First** - Setup all testing tools
2. **Unit Tests** - Build test foundation
3. **Integration Tests** - Test API layer
4. **E2E Tests** - Validate user flows
5. **CI/CD** - Automate everything
6. **Hooks** - Prevent bad commits

## 📝 Documentation Deliverables

- [ ] Testing guide for developers
- [ ] How to run tests locally
- [ ] How to write new tests
- [ ] CI/CD pipeline documentation
- [ ] Test coverage reports
- [ ] Known issues/limitations

## 🔗 Related Documentation

- Jest Documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
- GitHub Actions: https://docs.github.com/actions

---

**Status**: Planning Complete ✅
**Next**: Phase 6E.1 - Testing Infrastructure Setup
**Estimated Total Time**: 17 hours
**Priority**: High (Quality assurance)
