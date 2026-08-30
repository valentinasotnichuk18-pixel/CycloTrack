# CycloTrack - Test Scenarios

**Version:** 1.0
**Date:** April 2026
**Prepared by:** Valentyna Sotnichuk, QA Engineer (Trainee)
**Related document:** [CycloTrack Test Plan v2.0](./test-plan.md)

---

## 1. Overview

This document defines high-level test scenarios for CycloTrack, a personal health tracking web application. Test scenarios describe what needs to be tested without specifying exact steps. Each scenario maps to one or more test cases in the test execution phase.

| | Test Scenario | Test Case |
|---|---|---|
| Level | High-level | Detailed |
| Question | What to test? | How to test? |
| Example | Verify mood entry creation | Open app, click Add, fill fields, save, verify entry appears in list |
| Relationship | 1 scenario | Can have 3-10 test cases |

---

## 2. Testing Areas

- **Functional** - core features: mood tracking, medications, prescriptions
- **UI / UX** - layout consistency, element visibility, navigation
- **API** - Supabase REST endpoints (Postman)
- **Security** - health data protection, no PII exposure
- **Performance** - page load time, Lighthouse audit on Vercel
- **Mobile adaptation** - responsive layout across viewports

---

## 3. Priority Legend

| Priority | Definition |
|---|---|
| High | Core functionality - app is unusable or data is corrupted if this fails |
| Medium | Important feature - degrades experience but app still usable |
| Low | Minor improvement - cosmetic or edge case |

---

## 4. Functional Test Scenarios

### 4.1 Mood Tracker

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-F-01 | Create a new mood entry | Entry is saved and appears in mood history with correct data | High |
| TS-F-02 | Create entry with only required fields | Submission succeeds without optional fields | High |
| TS-F-03 | Submit mood form with empty required fields | Validation errors appear, form not submitted | High |
| TS-F-04 | Edit an existing mood entry | Updated values are saved and reflected in history | Medium |
| TS-F-05 | Delete a mood entry | Entry is permanently removed from history | Medium |
| TS-F-06 | Mood history order and display | Entries shown in reverse chronological order | Medium |
| TS-F-07 | Mood entry date field behavior | Only valid dates accepted; future dates handled correctly | Medium |

### 4.2 Medication Management

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-F-08 | Add new medication | Medication saved to list with all entered fields | High |
| TS-F-09 | Add medication with empty name | Validation error shown, not saved | High |
| TS-F-10 | Edit medication details | Updated dosage/frequency saved correctly | Medium |
| TS-F-11 | Delete medication | Medication removed from list immediately | Medium |
| TS-F-12 | Medication data persistence | Data survives page refresh / re-login | High |
| TS-F-13 | Add duplicate medication name | System handles or warns about duplicate | Low |

### 4.3 Prescription Management

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-F-14 | Add new prescription | All fields saved and visible in prescription list | High |
| TS-F-15 | View prescription detail page | Navigating to /prescriptions/:id shows all fields correctly | High |
| TS-F-16 | Upload file attachment to prescription | File saved and preview renders without error | Medium |
| TS-F-17 | Open prescription with invalid ID in URL | Error message or redirect shown, no crash | Medium |
| TS-F-18 | Delete prescription | Removed from list, detail page no longer accessible | Medium |
| TS-F-19 | Prescription required field validation | Form not submitted when required fields empty | High |

---

## 5. UI / UX Test Scenarios

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-UI-01 | Application layout on desktop (1440px+) | All elements visible, no overflow, correct alignment | High |
| TS-UI-02 | Navigation menu functionality | All links navigate to correct pages | High |
| TS-UI-03 | Active navigation state | Current page highlighted in menu | Low |
| TS-UI-04 | Empty state display | Appropriate message shown when list has no entries | Medium |
| TS-UI-05 | Loading state indicators | Spinner or skeleton shown while data loads | Medium |
| TS-UI-06 | Error state display | User-friendly error message on failed operations | High |
| TS-UI-07 | Form field placeholder text | All inputs have descriptive placeholders | Low |
| TS-UI-08 | Button states (hover, disabled, active) | Visual feedback on all interactive elements | Low |

---

## 6. Navigation and Routing Test Scenarios

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-N-01 | Direct URL access to all routes | Each route loads correct page without error | High |
| TS-N-02 | Deep link to /prescriptions/:id | Detail page loads with correct data | High |
| TS-N-03 | Access non-existent route | 404 page displayed, no crash | Medium |
| TS-N-04 | Browser back/forward navigation | Navigation history works as expected | Medium |
| TS-N-05 | Page refresh on any route | Page reloads correctly, data persists | High |

---

## 7. API Test Scenarios (Postman / Supabase)

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-API-01 | GET mood entries endpoint | Returns 200 with correct array structure | High |
| TS-API-02 | POST mood entry with valid data | Returns 201, entry created in DB | High |
| TS-API-03 | POST mood entry with missing required field | Returns 400 with descriptive error | High |
| TS-API-04 | GET prescription by valid ID | Returns 200 with full prescription object | High |
| TS-API-05 | GET prescription by invalid ID | Returns 404 | Medium |
| TS-API-06 | DELETE medication by ID | Returns 200/204, item no longer retrievable | Medium |
| TS-API-07 | API request without auth token | Returns 401 Unauthorized | High |
| TS-API-08 | API response time | All endpoints respond within 2 seconds | Medium |

---

## 8. Security Test Scenarios

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-S-01 | No PII in URL parameters | Health data never appears in browser address bar | High |
| TS-S-02 | No sensitive data in browser console | No tokens, passwords or health data logged | High |
| TS-S-03 | LocalStorage inspection | No raw auth tokens or passwords stored in plaintext | High |
| TS-S-04 | HTTPS enforcement on Vercel | App accessible only via https://, valid certificate | High |
| TS-S-05 | Access other user's data via URL manipulation | Returns 403 or redirects, data not exposed | High |
| TS-S-06 | XSS attempt in input fields | Script tags in inputs are not executed | Medium |

---

## 9. Performance Test Scenarios

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-P-01 | Initial page load on Vercel | App loads and is interactive in under 3 seconds | High |
| TS-P-02 | Lighthouse Performance audit | Score >= 70 on production build | Medium |
| TS-P-03 | No render-blocking resources | No critical JS/CSS blocking initial render | Medium |
| TS-P-04 | Image optimization | No uncompressed images above 500 KB | Low |
| TS-P-05 | Navigation between pages | Route transitions complete within 1 second | Medium |

---

## 10. Responsive / Mobile Test Scenarios

| ID | Test Scenario | What to Verify | Priority |
|---|---|---|---|
| TS-M-01 | Layout on mobile (375px, iPhone SE) | No horizontal scroll, all content visible and readable | High |
| TS-M-02 | Layout on tablet (768px, iPad) | Two-column layouts adapt, no element overlap | Medium |
| TS-M-03 | Touch targets on mobile | Buttons and links are large enough to tap (min 44x44px) | Medium |
| TS-M-04 | Forms on mobile keyboard | Keyboard does not cover input fields | Medium |
| TS-M-05 | Navigation menu on mobile | Menu accessible and usable on small screens | High |

---

## 11. Scenario Summary

| Area | Total Scenarios | High Priority | Medium/Low |
|---|---|---|---|
| Functional (Mood, Meds, Prescriptions) | 19 | 10 | 9 |
| UI / UX | 8 | 2 | 6 |
| Navigation and Routing | 5 | 3 | 2 |
| API (Supabase) | 8 | 6 | 2 |
| Security | 6 | 5 | 1 |
| Performance | 5 | 1 | 4 |
| Responsive / Mobile | 5 | 2 | 3 |
| **TOTAL** | **56** | **29** | **27** |

---

*Document prepared as part of QA practice. Linked to CycloTrack Test Plan v2.0. April 2026.*
