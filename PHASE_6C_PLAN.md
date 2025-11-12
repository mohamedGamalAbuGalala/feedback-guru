# Phase 6C: Security Hardening - Plan

## 🎯 Objective
Implement comprehensive security measures to protect against common web vulnerabilities and attacks.

## 📋 Requirements Analysis

### 1. Rate Limiting
**Problem**: API endpoints can be abused (spam, DDoS, brute force)
**Solution**: Token bucket algorithm with Redis/memory storage
**Limits**:
- Authenticated users: 100 requests/minute
- Public endpoints: 20 requests/minute
- Authentication endpoints: 5 requests/minute (prevent brute force)

### 2. CSRF Protection
**Problem**: Cross-site request forgery attacks
**Solution**: CSRF tokens for all mutations
**Implementation**: NextAuth already provides CSRF protection, verify it's enabled

### 3. XSS Sanitization
**Problem**: User input can contain malicious scripts
**Solution**: Sanitize all user-generated content
**Tools**: DOMPurify for client-side, validator for server-side

### 4. Input Validation
**Problem**: Inconsistent validation across endpoints
**Solution**: Zod schemas for all API routes
**Coverage**: 100% of API endpoints

### 5. Authorization Audit
**Problem**: Some endpoints missing proper role checks
**Solution**: Systematic audit and fix
**Pattern**: Middleware-based authorization

### 6. Security Headers
**Problem**: Missing security headers
**Solution**: Comprehensive security headers middleware
**Headers**: CSP, HSTS, X-Frame-Options, etc.

## 📊 Priority Matrix

| Feature | Priority | Impact | Effort | Order |
|---------|----------|--------|--------|-------|
| Rate Limiting | HIGH | High | Medium | 1 |
| Input Validation | HIGH | High | High | 2 |
| XSS Sanitization | HIGH | High | Medium | 3 |
| Security Headers | HIGH | Medium | Low | 4 |
| Authorization Audit | MEDIUM | High | Medium | 5 |
| CSRF Protection | LOW | Medium | Low | 6 |

## 🔧 Implementation Plan

### Phase 6C.1: Rate Limiting
**Files to Create**:
- `apps/web/src/middleware/rate-limit.ts` - Rate limiting middleware
- `apps/web/src/lib/rate-limiter.ts` - Rate limiter utility

**Approach**:
- In-memory token bucket (production should use Redis)
- Per-IP tracking
- Different limits for different endpoint types
- Clear error messages

### Phase 6C.2: CSRF Protection
**Files to Check**:
- NextAuth configuration (already has CSRF)
- Form submissions (verify tokens included)

**Approach**:
- Verify NextAuth CSRF is active
- Add CSRF checks to custom mutations
- Document CSRF token usage

### Phase 6C.3: XSS Sanitization
**Files to Create**:
- `apps/web/src/lib/sanitize.ts` - Sanitization utilities
- Client-side: DOMPurify wrapper
- Server-side: Validator-based sanitization

**Approach**:
- Sanitize on input (server-side)
- Sanitize on output (client-side)
- Whitelist allowed HTML tags

### Phase 6C.4: Input Validation
**Files to Create**:
- `apps/web/src/lib/validation-schemas.ts` - Centralized Zod schemas

**Approach**:
- Extract all inline Zod schemas
- Create reusable validation library
- Apply to all API routes
- Consistent error messages

### Phase 6C.5: Authorization Audit
**Files to Review**:
- All API routes in `apps/web/src/app/api/`
- Check role-based access control
- Verify workspace membership checks

**Approach**:
- Create authorization middleware
- Systematic audit of all endpoints
- Fix identified gaps

### Phase 6C.6: Security Headers
**Files to Create**:
- `apps/web/src/middleware.ts` - Next.js middleware for headers

**Headers to Add**:
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (HSTS)

## 📐 Design Decisions

### Rate Limiting Strategy
```typescript
// Token bucket algorithm
// Each user gets a bucket of tokens
// Tokens refill over time
// Request consumes one token
// If no tokens, request is denied
```

### Validation Pattern
```typescript
// Centralized schemas
import { feedbackSchema } from '@/lib/validation-schemas';

// Use in API routes
const data = feedbackSchema.parse(body);
```

### Sanitization Pattern
```typescript
// Server-side: sanitize on input
const sanitized = sanitizeHtml(userInput);

// Client-side: sanitize on display
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

## 🎯 Success Criteria

- [ ] Rate limiting active on all public endpoints
- [ ] All API routes have Zod validation
- [ ] User content sanitized (feedback, comments, changelog)
- [ ] Security headers present in all responses
- [ ] No authorization gaps in API routes
- [ ] CSRF protection verified
- [ ] Security audit passed
- [ ] Documentation complete

## 🚨 Security Testing Checklist

- [ ] Test rate limiting with high request volumes
- [ ] Attempt XSS injection in all input fields
- [ ] Try CSRF attacks on mutations
- [ ] Test authorization bypass attempts
- [ ] Verify security headers with online tools
- [ ] SQL injection prevention (Prisma protects us)
- [ ] Validate all error messages don't leak info

## 📊 Estimated Timeline

- Rate Limiting: 1-2 hours
- Input Validation: 2-3 hours
- XSS Sanitization: 1-2 hours
- Security Headers: 30 minutes
- Authorization Audit: 1-2 hours
- Documentation: 1 hour

**Total**: 6-10 hours of work

## 🔗 Dependencies

**New Packages Needed**:
- `dompurify` - XSS sanitization (client)
- `isomorphic-dompurify` - Universal DOMPurify
- `validator` - Server-side validation helpers

**Existing Packages Used**:
- `zod` - Already installed for validation
- `next` - Middleware support
- `crypto` - Token generation

## 🎓 Security Best Practices

1. **Defense in Depth**: Multiple layers of security
2. **Fail Securely**: Deny access on errors
3. **Least Privilege**: Minimum required permissions
4. **Input Validation**: Never trust user input
5. **Output Encoding**: Sanitize before display
6. **Security Headers**: Use all available protections
7. **Rate Limiting**: Prevent abuse
8. **Audit Logs**: Track security events (future)

---

**Status**: Planning Complete ✅
**Next**: Implementation Phase 6C.1 - Rate Limiting
