# Walk-in Visitor Flow Implementation Summary

## Overview

Successfully implemented a comprehensive walk-in visitor management system that allows guards to handle visitors who arrive without pre-approved passes. The system supports both instant entry and resident approval workflows.

## What Was Implemented

### 1. Database Schema ✅

- Created `walk_in_visitor_logs` table with the following features:
  - Stores visitor information (name, phone, purpose, vehicle number)
  - Tracks entry/exit times and methods
  - Supports approval workflow (pending, approved, rejected, not_required)
  - Includes temporary pass code generation (8-character alphanumeric)
  - Links to residence, guard, and approving resident
  - Includes comprehensive RLS policies for security

### 2. Backend Services ✅

#### Residence Search

- **File**: `src/api/repositories/residence/residence.repository.ts`

  - `searchBySocietyAndFlatNumber()` - Search by flat number/block
  - `searchBySocietyAndResidentName()` - Search by resident name

- **File**: `src/api/services/residence.service.ts`
  - `searchResidences()` - Unified search interface

#### Walk-in Visitor Management

- **File**: `src/api/repositories/visitor/walkInVisitorLog.repository.ts`

  - Complete CRUD operations for walk-in logs
  - Temporary pass code lookup
  - Approval status management
  - Entry/exit tracking
  - Pending approvals queries

- **File**: `src/api/services/walkInVisitor.service.ts`
  - `createWalkInEntry()` - Create walk-in entry with auto-generated temp pass
  - `approveWalkInEntry()` - Resident approves entry
  - `rejectWalkInEntry()` - Resident rejects entry
  - `recordExit()` - Record visitor exit
  - Various query methods for logs and approvals

#### Type Definitions

- **File**: `src/types/models/visitor.ts`
  - `WalkInVisitorLog` - Core walk-in log type
  - `WalkInVisitorLogWithDetails` - Extended type with relations
  - `CreateWalkInEntryParams` - Entry creation parameters
  - `WalkInApprovalStatus` - Approval status enum

### 3. Guard App Screens ✅

#### Search Residence Screen

- **File**: `src/app/(guard)/screens/walkIn/searchResidenceScreen.tsx`
- Features:
  - Toggle between flat number and resident name search
  - Real-time search with debouncing
  - Clean, intuitive UI with search results
  - Navigation to visitor info screen

#### Visitor Info Screen

- **File**: `src/app/(guard)/screens/walkIn/visitorInfoScreen.tsx`
- Features:
  - Visitor name (required)
  - Phone number (optional but recommended)
  - Purpose of visit (optional)
  - Vehicle number (optional)
  - Two action buttons:
    - "Allow Entry Now" - Instant entry
    - "Request Approval" - Sends approval request to resident

#### Entry Confirmation Screen

- **File**: `src/app/(guard)/screens/walkIn/entryConfirmationScreen.tsx`
- Features:
  - Success confirmation
  - Visitor and residence details
  - Large QR code with temporary pass
  - Pass code displayed prominently
  - Share functionality
  - Valid for 24 hours indicator

#### Pending Approvals Screen

- **File**: `src/app/(guard)/screens/walkIn/pendingApprovalsScreen.tsx`
- Features:
  - List of all pending approval requests
  - Real-time status updates
  - Pull-to-refresh functionality
  - Empty state handling

#### Updated Scanner Home

- **File**: `src/app/(guard)/(tabs)/scanner/index.tsx`
- Added "Walk-in Visitor" button to main scanner interface

### 4. Resident App Screens ✅

#### Approval Request Screen

- **File**: `src/app/(resident)/screens/visitors/approvalRequestScreen.tsx`
- Features:
  - Complete visitor information display
  - Guard information (who requested)
  - Request timestamp
  - Two action buttons:
    - "Approve Entry" - Allows visitor to enter
    - "Deny Entry" - Rejects visitor entry
  - Confirmation dialogs for both actions

### 5. Activity Logging ✅

- **File**: `src/types/models/activity.ts`
- Added new activity types:
  - `WALK_IN_VISITOR_ENTRY` - Guard allowed walk-in entry
  - `WALK_IN_VISITOR_APPROVAL_REQUESTED` - Guard requested resident approval
  - `WALK_IN_VISITOR_APPROVED` - Resident approved walk-in entry
  - `WALK_IN_VISITOR_REJECTED` - Resident rejected walk-in entry

### 6. Routes Configuration ✅

- **File**: `src/constants/routes.ts`
- Added routes:
  - `GUARD.SCREENS.WALK_IN.SEARCH_RESIDENCE`
  - `GUARD.SCREENS.WALK_IN.VISITOR_INFO`
  - `GUARD.SCREENS.WALK_IN.ENTRY_CONFIRMATION`
  - `GUARD.SCREENS.WALK_IN.PENDING_APPROVALS`
  - `RESIDENT.SCREENS.VISITORS.APPROVAL_REQUEST`

## Key Features

### For Guards

1. **Easy Residence Search**: Search by flat number or resident name
2. **Flexible Entry Options**: Choose between instant entry or requesting approval
3. **Minimal Required Info**: Only visitor name and residence required
4. **Automatic Pass Generation**: System generates temporary 8-character pass codes
5. **QR Code Support**: Pass codes displayed as QR codes for easy scanning
6. **Track Pending Approvals**: View all pending approval requests in one place

### For Residents

1. **Approval Notifications**: Get notified when a visitor requests approval
2. **Complete Visitor Info**: See all visitor details before approving
3. **Guard Transparency**: Know which guard is requesting approval
4. **Quick Decision**: Simple approve/deny interface

### Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **Guard Verification**: Only guards from the same society can create entries
3. **Resident Authorization**: Only residence members can approve visitors
4. **Audit Trail**: Complete activity logging for all actions
5. **Temporary Passes**: 24-hour validity on temporary pass codes

## Data Model

### Walk-in Visitor Log Structure

```typescript
{
  id: string;
  residence_id: string;
  visitor_name: string; // Required
  visitor_phone: string | null; // Optional but recommended
  purpose: string | null; // Optional
  vehicle_number: string | null; // Optional
  entry_time: string;
  exit_time: string | null;
  entry_method: "approved_by_guard";
  exit_method: "manual_code" | "marked_by_guard" | null;
  entry_gate: string | null;
  exit_gate: string | null;
  recorded_by_guard_id: string; // Required
  approval_status: "pending" | "approved" | "rejected" | "not_required";
  approved_by_resident_user_id: string | null;
  guard_notes: string | null;
  temp_pass_code: string | null; // Auto-generated 8-char code
  temp_pass_valid_until: string | null;
  created_at: string;
}
```

## User Flows

### Flow 1: Instant Entry (Guard's Discretion)

1. Guard taps "Walk-in Visitor" on scanner home
2. Guard searches for residence (by flat number or resident name)
3. Guard selects residence from search results
4. Guard enters visitor name (required)
5. Guard optionally enters phone, purpose, vehicle number
6. Guard taps "Allow Entry Now"
7. System creates entry log with `approval_status: 'not_required'`
8. System generates temporary pass code
9. Guard sees confirmation screen with QR code and pass code
10. Guard can share pass code with visitor

### Flow 2: Request Approval

1. Guard taps "Walk-in Visitor" on scanner home
2. Guard searches for residence
3. Guard selects residence
4. Guard enters visitor information
5. Guard taps "Request Approval"
6. System creates entry log with `approval_status: 'pending'`
7. Resident receives notification (TODO: notification implementation)
8. Resident opens approval request screen
9. Resident reviews visitor and guard information
10. Resident taps "Approve Entry" or "Deny Entry"
11. System updates approval status
12. Guard receives notification of decision (TODO: notification implementation)

## TODO: Future Enhancements

### High Priority

1. **Guard Context**: Implement guard context to store society_id and guard_id
2. **Push Notifications**: Implement real-time notifications for approval requests
3. **Exit Tracking**: Implement exit flow using temporary pass codes
4. **Photo Capture**: Add ID proof photo capture in visitor info screen

### Medium Priority

5. **Guard Logs Integration**: Update guard logs screen to show both pre-approved and walk-in visitors
6. **Resident Visitor History**: Show walk-in visitors in resident's visitor history
7. **Analytics Dashboard**: Add statistics for walk-in visitors
8. **Bulk Operations**: Allow guards to handle multiple approvals at once

### Low Priority

9. **Visitor Blacklist**: Allow residents to blacklist certain visitors
10. **Recurring Walk-ins**: Convert frequent walk-in visitors to pre-approved passes
11. **Visitor Ratings**: Allow residents to rate visitor experience
12. **Export Reports**: Generate PDF reports of walk-in visitor logs

## Testing Checklist

- [ ] Test residence search by flat number
- [ ] Test residence search by resident name
- [ ] Test walk-in entry creation (instant)
- [ ] Test walk-in entry creation (approval required)
- [ ] Test temporary pass code generation and uniqueness
- [ ] Test approval flow (approve)
- [ ] Test approval flow (reject)
- [ ] Test exit flow using temporary pass code
- [ ] Test RLS policies for guards
- [ ] Test RLS policies for residents
- [ ] Test activity logging for all actions
- [ ] Test edge cases (empty search, invalid residence, etc.)

## Notes

- The implementation follows the existing codebase patterns and conventions
- All screens use themed components for consistent UI
- Error handling is implemented throughout
- Loading states are properly managed
- The system is designed to scale with the existing visitor management system
- Temporary pass codes are 8 characters (matching pre-approved pass codes)
- Pass codes are valid for 24 hours by default
