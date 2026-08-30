# CycloTrack - Test Plan

**Version:** 3.0
**Date:** August 2026
**Prepared by:** Valentyna Sotnichuk
**Role:** QA Engineer (Trainee)

> **Changelog v2.0 to v3.0:** backend migration from Base44/localStorage to Supabase completed; automated smoke tests (Vitest) and CI pipeline added; new PWA and Web Push notification module included in scope; Row Level Security testing added; defect log linked.

---

## 1. Introduction

CycloTrack is a personal health tracking web application designed to support individuals managing cyclothymia and related mood disorders. The application enables users to log mood entries, track medications and intakes, manage prescriptions with file attachments, and receive medication reminders as push notifications.

This test plan serves two purposes:

- **Portfolio artifact** - demonstrates QA documentation skills for Junior QA Engineer roles
- **Practical test guide** - used for actual manual testing of the deployed CycloTrack application

---

## 2. Project Overview

| Parameter | Details |
|---|---|
| Project Name | CycloTrack - Personal Health Tracker |
| Application Type | Progressive Web App (PWA), Single Page Application |
| Frontend | React, Vite, React Router, TanStack Query, react-hook-form + zod, shadcn/ui (Radix), Tailwind CSS |
| Backend / Storage | Supabase - Auth, PostgreSQL, Storage, Edge Functions |
| Notifications | Web Push (service worker + VAPID), Supabase Edge Function scheduled via pg_cron |
| Deployment | Vercel (production) |
| Repository | github.com/valentinasotnichuk18-pixel/CycloTrack |
| Test Environment | Production (Vercel URL) + localhost:5173 |
| Testing Approach | Manual QA (primary); Vitest smoke tests in GitHub Actions CI |
| Document Version | 3.0 - August 2026 |

---

## 3. Scope of Testing

### 3.1 In Scope

- UI and functional testing - all core features and user flows
- API testing - Supabase REST endpoints via Postman
- Database integrity - foreign key constraints, delete order, null handling
- Row Level Security (RLS) - user data isolation
- PWA behavior - installability, service worker registration and updates
- Push notifications - subscription, delivery, timezone correctness
- Data security - protection of sensitive health data
- Performance - page load times, responsiveness under normal usage
- Mobile adaptation - responsive layout across different screen sizes
- Navigation and routing - React Router, deep links, 404 handling
- Form validation - required fields, boundary values, error messages
- Regression testing - re-verification after bug fixes or new features

### 3.2 Out of Scope

- Load / stress testing at scale
- Native Android APK testing (Capacitor - future milestone)
- End-to-end UI automation (Playwright / Cypress - future phase)
- Legacy browser support (IE11 and below)
- iOS push notifications (platform limitations under evaluation)

---

## 4. Test Environments

| Environment | URL / Access | Purpose |
|---|---|---|
| Production | Vercel deployment URL | End-to-end functional and regression testing |
| Local | localhost:5173 | Development and exploratory testing |
| Database / API | Supabase project dashboard, SQL editor | Data validation, RLS checks, API testing via Postman |
| CI | GitHub Actions (.github/workflows/ci.yml) | Lint and Vitest smoke tests on every push |
| Mobile | Android Chrome, installed PWA | Push delivery, home screen install, mobile layout |

---

## 5. Testing Objectives

| Objective | Measurable Metric | Target |
|---|---|---|
| All core features functional | Test case pass rate | >= 95% |
| No critical bugs at release | Open P1/P2 bugs | 0 |
| Form validation works correctly | Validation test pass rate | 100% |
| Routing is stable | Broken routes / unexpected 404s | 0 |
| UI renders correctly on mobile | Responsive test pass rate | >= 90% |
| No health data exposed | PII in URLs / console logs | 0 violations |
| User data is isolated | Cross-user data access attempts succeeding | 0 |
| Failed operations surface errors | Silent failures on write operations | 0 |
| Push reminders delivered on time | Delivery within 1 minute of scheduled time | 100% |
| Page load time acceptable | Initial load on Vercel | < 3 seconds |
| API returns correct responses | API test pass rate (Postman) | >= 95% |
| CI pipeline green | Failing builds on main | 0 |

---

## 6. Testing Strategy

### 6.1 Testing Types

| Test Type | Description |
|---|---|
| Functional Testing | Verify all features work per requirements (mood, medications, intakes, prescriptions, reminders) |
| UI / UX Testing | Check layout, element visibility, z-index stacking, consistency across pages |
| API Testing | Validate Supabase REST endpoints via Postman - status codes, response bodies, error handling |
| Database Testing | Foreign key constraints, delete order, orphan records, null vs empty string handling |
| Security Testing | RLS policies, no PII in URLs, no tokens in console or localStorage |
| Form Validation Testing | Empty fields, boundary values, invalid formats, error message accuracy |
| Navigation Testing | React Router routes, back/forward, direct URL access, 404 handling |
| Responsive Testing | Desktop (1440px+), tablet (768px), mobile (375px) viewports |
| PWA Testing | Install flow, service worker registration and update behavior |
| Notification Testing | Push subscription, delivery with app closed, timezone correctness |
| Performance Testing | Page load time on Vercel, image optimization, no blocking resources |
| Regression Testing | Re-test after each bug fix or new feature deployment |
| Exploratory Testing | Unscripted sessions to discover edge cases and unexpected behavior |

### 6.2 Testing Sequence

1. **Phase 1** - Smoke test: application loads, all pages accessible on Vercel
2. **Phase 2** - Functional testing: feature-by-feature per module
3. **Phase 3** - Form validation and boundary value testing
4. **Phase 4** - API testing via Postman (Supabase endpoints)
5. **Phase 5** - Database integrity and RLS verification
6. **Phase 6** - Responsive / mobile adaptation testing
7. **Phase 7** - PWA install and push notification testing
8. **Phase 8** - Performance checks (load time, Lighthouse audit)
9. **Phase 9** - Security and data privacy verification
10. **Phase 10** - Regression after bug fixes

---

## 7. Key Test Areas and Test Cases

### 7.1 Mood Tracker

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-01 | Create mood entry with all fields | Entry saved, visible in history | P1 |
| TC-02 | Create entry with required fields only | Entry saved successfully | P1 |
| TC-03 | Submit empty form | Validation errors displayed | P1 |
| TC-04 | Edit existing mood entry | Changes saved, history updated | P2 |
| TC-05 | Delete mood entry | Entry removed from list | P2 |
| TC-06 | Mood history displayed in correct order | Most recent entry shown first | P2 |

### 7.2 Medication Management

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-07 | Add new medication with all fields | Medication saved to list | P1 |
| TC-08 | Add medication with empty name | Validation error shown | P1 |
| TC-09 | Edit medication dosage | Updated value saved correctly | P2 |
| TC-10 | Delete medication with no related intakes | Removed from list immediately | P2 |
| TC-11 | Delete medication that has related intake records | Related intakes removed first, then medication; list updated | P1 |
| TC-12 | Delete medication when the database rejects the operation | Real error surfaced to user, no false success message | P1 |
| TC-13 | Medication list persists after page refresh | Data not lost on reload | P1 |

### 7.3 Prescriptions

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-14 | Add prescription with all fields | Prescription saved and listed | P1 |
| TC-15 | Add prescription leaving optional date empty | Empty date stored as null, request succeeds | P1 |
| TC-16 | Upload file attachment to prescription | File saved to Storage, preview visible | P2 |
| TC-17 | Open file preview modal | Modal renders above all page elements including bottom navigation | P2 |
| TC-18 | Navigate to /prescriptions/:id | Detail page shows all fields | P1 |
| TC-19 | Verify all fields on detail page | Type, doctor, date, description visible | P1 |
| TC-20 | Open prescription with invalid ID | Error message or redirect shown | P2 |
| TC-21 | Back navigation from detail page | Returns to prescriptions list | P2 |
| TC-22 | Delete prescription | Removed from list, attachment handled | P2 |

### 7.4 Notifications and Reminders

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-23 | Grant notification permission and subscribe | Subscription saved to push_subscriptions table | P1 |
| TC-24 | Deny notification permission | Clear message shown, app remains usable | P2 |
| TC-25 | Receive reminder with app closed and screen locked | Push notification delivered to device | P1 |
| TC-26 | Reminder time matches local (Kyiv) time | Notification fires at the local time entered by user, not UTC | P1 |
| TC-27 | Reminder for a deleted medication | No notification sent | P2 |
| TC-28 | Subscribe from a second device | Both devices receive reminders | P3 |

### 7.5 PWA Behavior

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-29 | Install app to phone home screen | App installs with correct name and icon | P2 |
| TC-30 | Launch from home screen | Opens in standalone mode without browser chrome | P2 |
| TC-31 | Service worker registers on first visit | Registration succeeds, no console errors | P1 |
| TC-32 | New deployment while app installed | Updated version served after reload | P2 |

### 7.6 Navigation and Routing

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-33 | All menu items navigate correctly | Correct page loads for each link | P1 |
| TC-34 | Direct URL access to /prescriptions/:id | Page loads without error | P1 |
| TC-35 | Access non-existent route (e.g. /xyz) | 404 page displayed | P2 |
| TC-36 | Browser back/forward buttons | Navigation history works correctly | P2 |

### 7.7 API Testing (Postman - Supabase)

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-37 | GET mood entries with valid token | Returns 200 with array of entries | P1 |
| TC-38 | POST mood entry with valid body | Returns 201, entry created | P1 |
| TC-39 | POST mood entry with missing required field | Returns 400 with error message | P1 |
| TC-40 | GET prescription by valid ID | Returns 200 with prescription data | P1 |
| TC-41 | GET prescription by invalid ID | Returns empty result, no server error | P2 |
| TC-42 | DELETE medication by ID | Returns 200/204, item no longer retrievable | P2 |
| TC-43 | Request without auth token | Returns 401 Unauthorized | P1 |
| TC-44 | Write request blocked by RLS | Verify database state, not only the status code | P1 |

> **Note on TC-44:** a blocked write can return a success status because RLS filters rows before the operation, so zero rows are affected and affecting zero rows is legal. Always verify the resulting state, or send the header `Prefer: return=representation` to make the empty result visible in the response body.

### 7.8 Database Integrity

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-45 | Delete parent record with existing child records | Children deleted first, no constraint violation reaches the user | P1 |
| TC-46 | Submit optional date field as empty | Stored as null, not as an empty string | P1 |
| TC-47 | Verify no orphan records after deletions | Query returns zero orphans | P2 |

### 7.9 Security, Privacy and RLS

| Check | How to Verify | Expected Result |
|---|---|---|
| User data isolation | Query another user's row ID via API with own token | No data returned |
| RLS policies present | Supabase dashboard, pg_policies | Every table has an explicit policy |
| No PII in URL parameters | Check browser address bar during navigation | No health data in URLs |
| No sensitive data in console | Open DevTools Console during use | No tokens or user data logged |
| LocalStorage inspection | DevTools > Application > Local Storage | No raw passwords stored |
| HTTPS enforced on Vercel | Check URL padlock in browser | https:// with valid certificate |

### 7.10 Responsive / Mobile Testing

| Viewport | Device | Key Checks | Priority |
|---|---|---|---|
| 375px | iPhone SE / 14 | No horizontal scroll, buttons tappable, text readable | P1 |
| 768px | iPad | Layout adapts, no element overlap | P2 |
| 1440px | Desktop | Full layout, all columns visible | P1 |

### 7.11 Performance

| Check | Tool | Target |
|---|---|---|
| Initial page load (Vercel) | Chrome DevTools Network tab | < 3 seconds |
| Lighthouse Performance score | Chrome DevTools Lighthouse | >= 70 |
| No render-blocking resources | Lighthouse audit | 0 critical issues |
| Images optimized | Network tab / Lighthouse | No uncompressed images > 500KB |

---

## 8. Testing Tools

| Tool | Purpose | Notes |
|---|---|---|
| Chrome DevTools | UI inspection, console, network, performance | Primary - daily use |
| Postman | API endpoint testing (Supabase REST) | Positive, negative and RLS checks |
| Supabase SQL editor | Data validation, constraint and RLS verification | Direct database access |
| Vitest | Automated smoke tests | Login and authenticated app rendering |
| GitHub Actions | CI - lint and test on every push | .github/workflows/ci.yml |
| Chrome Lighthouse | Performance and accessibility audit | Built into DevTools |
| Chrome + Firefox | Cross-browser functional testing | Minimum 2 browsers required |
| DevTools Device Emulator | Mobile / responsive testing | iPhone, Pixel, iPad presets |
| Real Android device | PWA install and push delivery | Emulator cannot fully cover push |

---

## 9. Entry and Exit Criteria

### 9.1 Entry Criteria

- Application is deployed and accessible on Vercel
- All features listed in scope are implemented
- Test cases are documented and reviewed
- Test environment (Vercel, Supabase, Postman) is configured
- CI pipeline is green on main

### 9.2 Exit Criteria

- All planned test cases executed
- Zero open P1 (critical) bugs
- Zero open P2 (high) bugs
- All P3/P4 bugs logged with reproduction steps and screenshots
- No silent failures on any write operation
- Test Summary Report completed

---

## 10. Bug Severity Classification

| Level | Severity | Definition and Example |
|---|---|---|
| P1 | Critical | App crashes, data loss, silent failure, feature completely unavailable. Example: delete operation reports success but no data is removed |
| P2 | High | Major feature broken, incorrect data saved. Example: reminder fires at the wrong time due to timezone handling |
| P3 | Medium | Feature works but with issues. Example: validation message text is incorrect |
| P4 | Low | Minor visual / cosmetic issue. Example: button misaligned by a few pixels |

---

## 11. Test Deliverables

- Test Plan document (this document) - v3.0
- [Test Scenarios](./test-scenarios.md) - 56 high-level scenarios
- [Bug Reports](./bug-reports.md) - defects found during testing
- Postman collection for API test cases
- Vitest smoke test suite running in GitHub Actions
- Lighthouse report (Performance + Accessibility)
- Test Summary Report after full execution cycle

---

## 12. Industry Standards and Compliance

As CycloTrack processes sensitive personal health data, the following standards apply:

- **WCAG 2.1 (Level AA)** - keyboard navigation, color contrast >= 4.5:1, screen reader compatibility
- **GDPR** - user data must not be shared or exposed without consent; right to deletion
- **OWASP Top 10** - protection against XSS, broken access control, insecure data storage, sensitive data exposure
- **HTTPS** - all production traffic must use encrypted connections (enforced via Vercel)

---

## 13. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Silent failures on database writes | Data loss without the user noticing | Surface real errors; verify state after every write, not just status codes |
| Timezone mismatch between server and user | Reminders fire at the wrong time | Compare scheduled times in the user's local timezone, test around midnight boundaries |
| Supabase free tier auto-pause on inactivity | App unavailable without warning | Check project status before each test cycle |
| Permissive RLS policies | Cross-user data exposure | Verify policies per table; test access with a second account |
| Single-tester project | Blind spots in coverage | Exploratory sessions in addition to scripted test cases |

---

*Document prepared as part of QA practice. CycloTrack personal project - August 2026.*


