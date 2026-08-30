# CycloTrack - Test Plan

**Version:** 2.0
**Date:** April 2026
**Prepared by:** Valentyna Sotnichuk
**Role:** QA Engineer (Trainee)

---

## 1. Introduction

CycloTrack is a personal health tracking web application designed to support individuals managing cyclothymia and related mood disorders. The application enables users to log mood entries, track medications, manage prescriptions with file attachments, and monitor health patterns over time.

This test plan serves two purposes:

- **Portfolio artifact** - demonstrates QA documentation skills for Junior QA Engineer roles
- **Practical test guide** - used for actual manual testing of the deployed CycloTrack application

---

## 2. Project Overview

| Parameter | Details |
|---|---|
| Project Name | CycloTrack - Personal Health Tracker |
| Application Type | Single Page Application (SPA) |
| Tech Stack | React, Vite, React Router, Base44 (migrated to GitHub) |
| Backend / Storage | Supabase (planned migration); localStorage (current) |
| Deployment | Vercel (production) |
| Repository | github.com/valentinasotnichuk18-pixel/CycloTrack |
| Test Environment | Production (Vercel URL) + localhost:5173 |
| Testing Approach | Manual QA (primary); Cypress automation (planned) |
| Document Version | 2.0 - April 2026 |

---

## 3. Scope of Testing

### 3.1 In Scope

- UI and functional testing - all core features and user flows
- API testing - Supabase REST endpoints (once migration is complete)
- Data security - protection of sensitive health data
- Performance - page load times, responsiveness under normal usage
- Mobile adaptation - responsive layout across different screen sizes
- Navigation and routing - React Router, deep links, 404 handling
- Form validation - required fields, boundary values, error messages
- Regression testing - re-verification after bug fixes or new features

### 3.2 Out of Scope

- Load / stress testing at scale (planned post-Supabase migration)
- Native Android APK testing (Capacitor - future milestone)
- Automated UI testing with Cypress (planned future phase)
- Legacy browser support (IE11 and below)

---

## 4. Test Environments

| Environment | URL / Access | Purpose |
|---|---|---|
| Production | Vercel deployment URL | End-to-end functional and regression testing |
| Local | localhost:5173 | Development and exploratory testing |
| API (Supabase) | Supabase project dashboard | API endpoint testing via Postman |

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
| Page load time acceptable | Initial load on Vercel | < 3 seconds |
| API returns correct responses | API test pass rate (Postman) | >= 95% |

---

## 6. Testing Strategy

### 6.1 Testing Types

| Test Type | Description |
|---|---|
| Functional Testing | Verify all features work per requirements (mood, medications, prescriptions) |
| UI / UX Testing | Check layout, element visibility, consistency across pages |
| API Testing | Validate Supabase REST endpoints via Postman - status codes, response bodies, error handling |
| Form Validation Testing | Empty fields, boundary values, invalid formats, error message accuracy |
| Navigation Testing | React Router routes, back/forward, direct URL access, 404 handling |
| Responsive Testing | Desktop (1440px+), tablet (768px), mobile (375px) viewports |
| Performance Testing | Page load time on Vercel, image optimization, no blocking resources |
| Security Testing (basic) | No PII in URLs, localStorage not exposing tokens, no console leaks |
| Regression Testing | Re-test after each bug fix or new feature deployment |
| Exploratory Testing | Unscripted sessions to discover edge cases and unexpected behavior |

### 6.2 Testing Sequence

1. **Phase 1** - Smoke test: application loads, all pages accessible on Vercel
2. **Phase 2** - Functional testing: feature-by-feature per module
3. **Phase 3** - Form validation and boundary value testing
4. **Phase 4** - API testing via Postman (Supabase endpoints)
5. **Phase 5** - Responsive / mobile adaptation testing
6. **Phase 6** - Performance checks (load time, Lighthouse audit)
7. **Phase 7** - Security and data privacy verification
8. **Phase 8** - Regression after bug fixes

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
| TC-10 | Delete medication | Removed from list immediately | P2 |
| TC-11 | Medication list persists after page refresh | Data not lost on reload | P1 |

### 7.3 Prescriptions

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-12 | Add prescription with all fields | Prescription saved and listed | P1 |
| TC-13 | Upload file attachment to prescription | File saved, preview visible | P2 |
| TC-14 | Navigate to /prescriptions/:id | Detail page shows all fields | P1 |
| TC-15 | Verify all fields on detail page | Type, doctor, date, description visible | P1 |
| TC-16 | Open prescription with invalid ID | Error message or redirect shown | P2 |
| TC-17 | Back navigation from detail page | Returns to prescriptions list | P2 |
| TC-18 | Delete prescription | Removed from list | P2 |

### 7.4 Navigation and Routing

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-19 | All menu items navigate correctly | Correct page loads for each link | P1 |
| TC-20 | Direct URL access to /prescriptions/:id | Page loads without error | P1 |
| TC-21 | Access non-existent route (e.g. /xyz) | 404 page displayed | P2 |
| TC-22 | Browser back/forward buttons | Navigation history works correctly | P2 |

### 7.5 API Testing (Postman - Supabase)

| # | Test Case | Expected Result | Priority |
|---|---|---|---|
| TC-23 | GET /mood-entries | Returns 200 with array of entries | P1 |
| TC-24 | POST /mood-entries with valid body | Returns 201, entry created | P1 |
| TC-25 | POST /mood-entries with missing required field | Returns 400 with error message | P1 |
| TC-26 | GET /prescriptions/:id (valid ID) | Returns 200 with prescription data | P1 |
| TC-27 | GET /prescriptions/:id (invalid ID) | Returns 404 | P2 |
| TC-28 | DELETE /medications/:id | Returns 200/204, item removed | P2 |

### 7.6 Responsive / Mobile Testing

| Viewport | Device | Key Checks | Priority |
|---|---|---|---|
| 375px | iPhone SE / 14 | No horizontal scroll, buttons tappable, text readable | P1 |
| 768px | iPad | Layout adapts, no element overlap | P2 |
| 1440px | Desktop | Full layout, all columns visible | P1 |

### 7.7 Performance

| Check | Tool | Target |
|---|---|---|
| Initial page load (Vercel) | Chrome DevTools Network tab | < 3 seconds |
| Lighthouse Performance score | Chrome DevTools Lighthouse | >= 70 |
| No render-blocking resources | Lighthouse audit | 0 critical issues |
| Images optimized | Network tab / Lighthouse | No uncompressed images > 500KB |

### 7.8 Security and Data Privacy

| Check | How to Verify | Expected Result |
|---|---|---|
| No PII in URL parameters | Check browser address bar during navigation | No health data in URLs |
| No sensitive data in console | Open DevTools Console during use | No tokens or user data logged |
| LocalStorage inspection | DevTools > Application > Local Storage | No raw passwords or tokens stored |
| HTTPS enforced on Vercel | Check URL padlock in browser | https:// with valid certificate |

---

## 8. Testing Tools

| Tool | Purpose | Notes |
|---|---|---|
| Chrome DevTools | UI inspection, console, network, performance | Primary - daily use |
| Postman | API endpoint testing (Supabase) | Already in tool belt |
| Google Sheets / ClickUp | Test case tracking, bug reporting | ClickUp used on TugOnn |
| Chrome Lighthouse | Performance and accessibility audit | Built into DevTools |
| Chrome + Firefox | Cross-browser functional testing | Minimum 2 browsers required |
| DevTools Device Emulator | Mobile / responsive testing | iPhone, Pixel, iPad presets |
| Figma (if designs exist) | UI vs design comparison | Reference only |

---

## 9. Entry and Exit Criteria

### 9.1 Entry Criteria

- Application is deployed and accessible on Vercel
- All features listed in scope are implemented
- Test cases are documented and reviewed
- Test environment (Vercel + Postman) is configured

### 9.2 Exit Criteria

- All planned test cases executed
- Zero open P1 (critical) bugs
- Zero open P2 (high) bugs
- All P3/P4 bugs logged with reproduction steps and screenshots
- Test Summary Report completed

---

## 10. Bug Severity Classification

| Level | Severity | Definition and Example |
|---|---|---|
| P1 | Critical | App crashes, data loss, feature completely unavailable. Example: app fails to load on Vercel |
| P2 | High | Major feature broken, incorrect data saved. Example: prescription detail page does not open |
| P3 | Medium | Feature works but with issues. Example: validation message text is incorrect |
| P4 | Low | Minor visual / cosmetic issue. Example: button misaligned by a few pixels |

---

## 11. Test Deliverables

- Test Plan document (this document) - v2.0
- Test cases with ID, steps, expected result, status
- Bug reports - severity, steps to reproduce, actual vs expected, screenshots
- Postman collection for API test cases
- Lighthouse report (Performance + Accessibility)
- Test Summary Report after full execution cycle

---

## 12. Industry Standards and Compliance

As CycloTrack processes sensitive personal health data, the following standards apply:

- **WCAG 2.1 (Level AA)** - keyboard navigation, color contrast >= 4.5:1, screen reader compatibility
- **GDPR** - user data must not be shared or exposed without consent; right to deletion
- **OWASP Top 10** - protection against XSS, insecure data storage, sensitive data exposure
- **HTTPS** - all production traffic must use encrypted connections (enforced via Vercel)

---

*Document prepared as part of QA practice. CycloTrack personal project - April 2026.*
