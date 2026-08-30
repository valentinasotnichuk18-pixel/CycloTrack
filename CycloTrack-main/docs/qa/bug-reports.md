# CycloTrack - Bug Reports

**Version:** 1.0
**Date:** August 2026
**Prepared by:** Valentyna Sotnichuk
**Role:** QA Engineer (Trainee)
**Related documents:** [Test Plan v3.0](./test-plan.md) | [Test Scenarios](./test-scenarios.md)

---

## Overview

This document logs defects found during manual and exploratory testing of the deployed CycloTrack application between July and August 2026. All defects listed here were reproduced, root-caused, fixed and re-tested.

Severity levels follow the classification defined in the Test Plan, section 10.

### Summary

| ID | Title | Severity | Area | Responsibility | Status |
|---|---|---|---|---|---|
| BUG-001 | Medication deletion silently fails and reports success | P1 Critical | Medications | FRONT | Fixed |
| BUG-002 | Push reminders never delivered while app is closed | P1 Critical | Notifications | FRONT | Fixed |
| BUG-003 | Reminders fire 3 hours off due to timezone mismatch | P2 High | Notifications | BACK | Fixed |
| BUG-004 | Saving a prescription with an empty date fails silently | P2 High | Prescriptions | FRONT | Fixed |
| BUG-005 | Toast notification cannot be closed and stays ~16 minutes | P3 Medium | UI / Global | FRONT | Fixed |
| BUG-006 | File preview modal renders under the bottom navigation | P3 Medium | Prescriptions | FRONT | Fixed |

**Totals:** 6 defects. By severity: 2 critical, 2 high, 2 medium. By responsibility: 5 FRONT, 1 BACK.

---

## BUG-001. Medication deletion silently fails and reports success

**Severity:** P1 Critical
**Area:** Medications
**Responsibility:** FRONT
**Status:** Fixed and re-tested

**Current behavior:**
Deleting a medication that has intake history shows a green success toast and returns the user to the medication list, but the medication is still there after refresh. No error is displayed anywhere. The user believes the data was deleted when it was not.

**Expected behavior:**
Either the medication is deleted together with its intake records, or the user sees a clear error message explaining why deletion is not possible. A success message must never appear for a failed operation.

**Steps to reproduce:**
1. Open the Medications page
2. Add a medication
3. Mark at least one intake using the "Taken" or "Skipped" button
4. Open that medication and press Delete
5. Observe the success toast and the return to the list
6. Refresh the page

**Actual result:** the medication is still in the list.

**Root cause:**
The delete handler did not check the `error` value returned by Supabase. It always displayed a success toast regardless of the outcome. The underlying rejection came from a foreign key constraint: rows in `medication_intakes` reference the medication, so the database refuses to delete the parent row.

**Fix:**
Destructure and check `error` before showing any success feedback; display the real error message when the operation fails. Delete the related `medication_intakes` rows first, then the medication.

**Notes:**
This is the most valuable defect in this log. The visible symptom was a UI problem, but the cause was a database constraint hidden by missing error handling. It is also a good example of why a green toast is not proof of success: the state must be verified, not the message.

---

## BUG-002. Push reminders never delivered while app is closed

**Severity:** P1 Critical
**Area:** Notifications
**Responsibility:** FRONT
**Status:** Fixed

**Current behavior:**
Medication reminders do not arrive. Occasionally a notification appears while the app tab is open and in focus, but nothing is ever delivered when the app is closed or the phone is locked.

**Expected behavior:**
A reminder is delivered at the scheduled medication time regardless of whether the app is open, closed, or the device is locked.

**Steps to reproduce:**
1. Add a medication with an intake time a few minutes in the future
2. Enable notifications in Settings and grant browser permission
3. Close the app and lock the phone
4. Wait for the scheduled time

**Actual result:** no notification arrives.

**Root cause:**
Two independent problems in the same feature.

1. The reminder hook called the `new Notification()` constructor directly from the page. On Android Chrome this fails silently when a service worker is active; `ServiceWorkerRegistration.showNotification()` is required instead.
2. The whole scheduling check ran inside the page, so it only executed while the browser tab was visible. Background delivery was architecturally impossible, not merely broken.

**Fix:**
Replaced the client-side approach with real Web Push: a `push_subscriptions` table with RLS, a custom service worker handling the push event, and a scheduled Supabase Edge Function sending notifications via VAPID.

**Notes:**
Worth recording as a case where the defect was not a bug in the code but a wrong architecture for the requirement. No amount of fixing the hook would have made background delivery work.

---

## BUG-003. Reminders fire 3 hours off due to timezone mismatch

**Severity:** P2 High
**Area:** Notifications
**Responsibility:** BACK
**Status:** Fixed

**Current behavior:**
After push notifications were implemented, reminders were delivered at the wrong time, offset by 3 hours from the time the user entered.

**Expected behavior:**
The reminder fires at the local time the user entered in the app.

**Steps to reproduce:**
1. Set a medication intake time, for example 14:00
2. Wait for the scheduled time
3. Observe when the notification actually arrives

**Actual result:** the notification arrives 3 hours away from the set time.

**Root cause:**
The scheduled Edge Function compared the current time in UTC, while medication times are stored as local Kyiv time. During summer Kyiv is UTC+3, so every comparison was off by exactly that offset.

**Fix:**
The function now derives the current time in the `Europe/Kyiv` timezone using `Intl.DateTimeFormat` before comparing it with stored medication times.

**Notes:**
The offset matched the seasonal UTC difference exactly, which is what pointed at the timezone rather than at the scheduler. Worth re-testing after a daylight saving change, since the offset shifts to UTC+2 in winter.

---

## BUG-004. Saving a prescription with an empty date fails silently

**Severity:** P2 High
**Area:** Prescriptions
**Responsibility:** FRONT
**Status:** Fixed

**Current behavior:**
Submitting the new prescription form while leaving the optional date field empty does not save the record. No error is shown; the form appears to do nothing.

**Expected behavior:**
The prescription is saved with an empty date stored as null, since the field is optional.

**Steps to reproduce:**
1. Open the Prescriptions page and start a new prescription
2. Fill in the required fields
3. Leave the date field empty
4. Submit

**Actual result:** the record is not created and no message is displayed.

**Root cause:**
The empty input was sent to Supabase as an empty string rather than null. A Postgres `date` column rejects an empty string, so the insert failed. As with BUG-001, the failure was not surfaced to the user.

**Fix:**
Convert an empty date value to null before sending the request.

**Notes:**
Empty string versus null is a classic boundary case for optional fields. It is worth checking on every optional input that maps to a typed database column, not only on dates.

---

## BUG-005. Toast notification cannot be closed and stays around 16 minutes

**Severity:** P3 Medium
**Area:** UI / Global
**Responsibility:** FRONT
**Status:** Fixed

**Current behavior:**
The toast shown on the new prescription screen cannot be dismissed. Its close button does nothing, and the toast remains on screen for roughly 16 minutes before disappearing on its own.

**Expected behavior:**
The close button dismisses the toast immediately, and the toast auto-dismisses after a few seconds.

**Steps to reproduce:**
1. Open the new prescription screen
2. Trigger any action that shows a toast
3. Press the close button on the toast
4. Observe that it stays on screen

**Root cause:**
This screen was the only one still using an older toast component in which the close button had no click handler attached and the auto-dismiss delay was configured to an extremely large value.

**Fix:**
Migrated this screen to the same toast library used across the rest of the app and removed the unused broken component files.

**Notes:**
Found while testing an unrelated feature. A good example of an inconsistency that only shows up when the same interaction is compared across several screens.

---

## BUG-006. File preview modal renders under the bottom navigation

**Severity:** P3 Medium
**Area:** Prescriptions
**Responsibility:** FRONT
**Status:** Fixed

**Current behavior:**
Opening the preview of a file attached to a prescription renders the modal window underneath the bottom navigation bar. The lower part of the modal, including its controls, is covered.

**Expected behavior:**
The modal renders above all other page elements, including the bottom navigation.

**Steps to reproduce:**
1. Open a prescription that has a file attachment
2. Tap the attachment to open the preview
3. Look at the bottom edge of the modal

**Actual result:** the bottom navigation bar is drawn on top of the modal.

**Root cause:**
A stacking order conflict. The modal was assigned a lower stacking value than the bottom navigation bar, so the navigation won.

**Fix:**
Raised the modal above the bottom navigation in the stacking order.

**Notes:**
Confirmed in DevTools by inspecting the computed stacking values of both elements, which is faster than guessing from the visual result.

---

## Observations

Three of the six defects (BUG-001, BUG-002, BUG-004) share the same underlying pattern: an operation failed while the interface reported nothing, or reported success. Silent failure is the most dangerous category in an application that stores health data, because the user has no signal that anything went wrong.

Two practical conclusions were added to the Test Plan as a result:

- "Silent failures on write operations: 0" was added as a measurable testing objective (section 5)
- Verifying state rather than status codes was added as an explicit note to the API test cases (section 7.7)

---

*Document prepared as part of QA practice. CycloTrack personal project - August 2026.*
