# VaultMedics User Flows

This document explains how different user types interact with the VaultMedics platform.

---

## Primary Users: Patients

### 1. Registration & Onboarding

**Flow:**
1. User visits VaultMedics landing page
2. Clicks "Sign Up" button
3. Enters email address and password
4. Receives confirmation email
5. Clicks verification link
6. Logged in and redirected to dashboard
7. Completes profile setup (name, optional profile picture)
8. Optional: Connect Web3 wallet for blockchain features

**Success Criteria:**
- Account created successfully
- Email verified
- Profile information saved
- Dashboard accessible

---

### 2. Dashboard Navigation

**Flow:**
1. User logs in
2. Lands on Dashboard Overview
3. Sees health statistics and recent activity
4. Uses sidebar navigation to access:
   - Overview
   - My Records
   - Health Timeline
   - AI Assistant
   - Permissions
   - Audit Trail
   - Health Card

**Success Criteria:**
- Dashboard loads correctly
- All navigation links work
- Responsive design adapts to screen size
- Theme toggle works (light/dark mode)

---

### 3. Uploading Medical Records

**Flow:**
1. User navigates to "My Records" section
2. Clicks "Upload Record" button
3. Selects file from device (PDF or image)
4. Fills in record details:
   - Record type (lab report, prescription, imaging, etc.)
   - Date of record
   - Facility/Hospital name
   - Doctor's name (optional)
   - Description/notes (optional)
5. Clicks "Upload"
6. System processes file and generates blockchain hash
7. Record appears in records list
8. User receives confirmation

**Success Criteria:**
- File uploaded successfully
- Metadata saved correctly
- Blockchain hash generated
- Record visible in list
- File can be viewed/downloaded

---

### 4. Viewing Medical Records

**Flow:**
1. User navigates to "My Records"
2. Sees list of all uploaded records
3. Can filter by:
   - Record type
   - Date range
   - Facility
4. Clicks on a specific record
5. Record opens in viewer (PDF or image)
6. User can:
   - View full document
   - Download to device
   - Share with healthcare provider
   - Delete record
7. Closes viewer to return to list

**Success Criteria:**
- Records load correctly
- Filters work as expected
- Documents render properly
- Download functionality works
- Share option available

---

### 5. Using AI Medical Assistant

**Flow:**
1. User navigates to "AI Assistant" section
2. Selects a medical record from dropdown
3. Types question or request:
   - "Summarize this report"
   - "What does this value mean?"
   - "What should I ask my doctor?"
4. AI processes the request
5. AI response appears with:
   - Plain language explanation
   - Medical disclaimer
   - References to consult professional
6. User can:
   - Ask follow-up questions
   - Copy response
   - Share with doctor
7. Chat history saved for reference

**Success Criteria:**
- AI responds accurately
- Explanations are understandable
- Medical disclaimer present
- Follow-up questions work
- Chat history accessible

---

### 6. Viewing Health Timeline

**Flow:**
1. User navigates to "Health Timeline"
2. Sees chronological view of all health events
3. Events include:
   - Hospital visits
   - Vaccinations
   - Diagnoses
   - Medications
   - Surgeries
   - Lab reports
   - Appointments
4. User can:
   - Filter by event type
   - Filter by date range
   - Click event for details
   - Expand/collapse events
5. Timeline auto-populates from uploaded records

**Success Criteria:**
- Timeline displays correctly
- Events in chronological order
- Filters work properly
- Event details accessible
- Linked records open correctly

---

### 7. Managing Permissions (Consent)

**Flow:**
1. User navigates to "Permissions" section
2. Sees list of healthcare providers with access
3. For each provider, can view:
   - Provider name
   - Access granted date
   - Expiration date
   - Records accessible
   - Access status (active/expired)
4. To grant new access:
   - Click "Grant Access"
   - Search for doctor by name/email
   - Select doctor from results
   - Choose which records to share
   - Set expiration date
   - Click "Grant"
   - Consent recorded on blockchain
5. To revoke access:
   - Click "Revoke" on provider
   - Confirm revocation
   - Access immediately terminated
   - Revocation recorded on blockchain

**Success Criteria:**
- Permission list accurate
- Grant access works
- Revoke access works instantly
- Blockchain records updated
- Doctor notifications sent

---

### 8. Viewing Audit Trail

**Flow:**
1. User navigates to "Audit Trail"
2. Sees log of all access events
3. Each event shows:
   - Who accessed (doctor name)
   - When accessed (timestamp)
   - Which records accessed
   - Device/location information
   - Verification status
4. User can filter by:
   - Date range
   - Specific doctor
   - Record type
5. User can export audit log

**Success Criteria:**
- Audit trail complete
- All access events logged
- Filters work correctly
- Export functionality works
- Blockchain verification available

---

### 9. Emergency Health Card

**Flow:**
1. User navigates to "Health Card"
2. Fills in emergency information:
   - Blood type
   - Allergies
   - Current medications
   - Emergency contacts
   - Critical conditions
   - Organ donor status
3. System generates QR code
4. User can:
   - Download QR code image
   - Print wallet card
   - Save to phone
5. Emergency responders can scan QR to access critical info

**Success Criteria:**
- Information saved correctly
- QR code generated
- QR code scannable
- Emergency info accessible offline
- Access logged in audit trail

---

### 10. Wallet Connection (Blockchain)

**Flow:**
1. User clicks "Connect Wallet" button
2. Wallet connector modal opens
3. User selects wallet (MetaMask, etc.)
4. Wallet prompts for connection approval
5. User approves connection
6. Wallet address displayed
7. User can sign transactions for:
   - Consent grants
   - Access revocations
   - Record verifications

**Success Criteria:**
- Wallet connects successfully
- Address displays correctly
- Can sign transactions
- Can disconnect wallet

---

## Secondary Users: Doctors

### 1. Doctor Registration

**Flow:**
1. Doctor visits VaultMedics
2. Clicks "Doctor Sign Up"
3. Enters professional information:
   - Full name
   - Email
   - Medical license number
   - Specialty
   - Hospital/Clinic name
   - Password
4. Uploads credentials verification
5. Receives confirmation email
6. Clicks verification link
7. Account pending admin approval
8. Once approved, can access doctor portal

**Success Criteria:**
- Account created
- Credentials submitted
- Email verified
- Admin receives notification
- Approval process completes

---

### 2. Requesting Patient Access

**Flow:**
1. Doctor logs into doctor portal
2. Searches for patient by:
   - Email
   - Name
   - Patient ID (if known)
3. Selects patient from results
4. Clicks "Request Access"
5. Fills in access request:
   - Reason for access
   - Required record types
   - Duration needed
   - Urgency level
6. Submits request
7. Patient receives notification
8. Patient reviews and approves/denies
9. Doctor notified of decision

**Success Criteria:**
- Request submitted successfully
- Patient receives notification
- Patient can approve/deny
- Doctor receives decision
- Access granted if approved

---

### 3. Viewing Patient Records

**Flow:**
1. Doctor logs into doctor portal
2. Views list of patients with granted access
3. Selects patient
4. Sees records patient has shared
5. Can filter by:
   - Record type
   - Date range
6. Clicks record to view
7. Can:
   - View full document
   - Download for reference
   - Add consultation notes
8. All access logged in patient's audit trail

**Success Criteria:**
- Only authorized records visible
- Records load correctly
- Consultation notes save
- Access logged in audit trail
- Patient can see access

---

### 4. Uploading Consultation Notes

**Flow:**
1. Doctor is viewing patient records
2. Clicks "Add Consultation Note"
3. Fills in:
   - Date of consultation
   - Diagnosis
   - Recommendations
   - Prescriptions
   - Follow-up instructions
4. Clicks "Save"
5. Note added to patient's records
6. Patient receives notification
7. Patient can view note in their records

**Success Criteria:**
- Note saved successfully
- Linked to patient correctly
- Patient notified
- Note visible in patient's records
- Blockchain hash generated

---

### 5. Adding Prescriptions

**Flow:**
1. Doctor is viewing patient records
2. Clicks "Add Prescription"
3. Fills in:
   - Medication name
   - Dosage
   - Frequency
   - Duration
   - Instructions
   - Refills allowed
4. Clicks "Save"
5. Prescription added to patient's records
6. Patient receives notification
7. Patient can view in health timeline

**Success Criteria:**
- Prescription saved
- Linked to patient
- Patient notified
- Visible in timeline
- AI can explain medication

---

### 6. Managing Access Requests

**Flow:**
1. Doctor views "Access Requests" tab
2. Sees list of pending requests
3. For each request, can:
   - View details
   - Cancel request (if patient hasn't responded)
   - See status (pending/approved/denied/expired)
4. Can request renewal for expired access
5. Can view access history per patient

**Success Criteria:**
- Request list accurate
- Can cancel pending requests
- Can request renewal
- History accessible

---

## Secondary Users: Hospitals/Clinics

### 1. Hospital Registration

**Flow:**
1. Hospital representative visits VaultMedics
2. Clicks "Hospital Sign Up"
3. Enters hospital information:
   - Hospital name
   - Address
   - Contact email
   - Hospital registration number
   - Type (hospital, clinic, lab, etc.)
4. Uploads verification documents
5. Submits for approval
6. Admin reviews and approves
7. Hospital account created
8. Hospital can add doctors to account

**Success Criteria:**
- Account submitted
- Documents uploaded
- Admin review process
- Account approved
- Can add doctors

---

### 2. Adding Doctors to Hospital Account

**Flow:**
1. Hospital admin logs in
2. Navigates to "Manage Doctors"
3. Clicks "Add Doctor"
4. Enters doctor information:
   - Name
   - Email
   - License number
   - Specialty
5. Sends invitation to doctor
6. Doctor receives email
7. Doctor clicks link to join hospital
8. Doctor account linked to hospital

**Success Criteria:**
- Invitation sent
- Doctor receives email
- Doctor joins hospital
- Account linked correctly

---

### 3. Hospital Dashboard

**Flow:**
1. Hospital admin logs in
2. Views hospital dashboard with:
   - Total doctors
   - Total patients with access
   - Active access requests
   - Recent activity
3. Can manage:
   - Doctor accounts
   - Access requests
   - Hospital settings
4. Can view analytics:
   - Most accessed records
   - Doctor activity
   - Patient engagement

**Success Criteria:**
- Dashboard loads
- Statistics accurate
- Management functions work
- Analytics available

---

## Emergency Access Flow

### Break-Glass Emergency Access

**Flow:**
1. Emergency situation occurs
2. Emergency responder scans patient's QR code
3. System detects emergency access request
4. Patient receives immediate notification
5. Time-limited access granted (e.g., 1 hour)
6. Responder views critical health information:
   - Blood type
   - Allergies
   - Current medications
   - Critical conditions
   - Emergency contacts
7. Access logged in audit trail
8. Patient can review emergency access after

**Success Criteria:**
- Emergency access granted quickly
- Critical info accessible
- Patient notified immediately
- Access time-limited
- Full audit trail
- Post-emergency review available

---

## Cross-User Interactions

### Patient → Doctor Sharing

**Flow:**
1. Patient grants access to doctor
2. Doctor receives notification
3. Doctor can now view shared records
4. Doctor adds notes/prescriptions
5. Patient sees new additions
6. All interactions logged on blockchain

### Doctor → Patient Communication

**Flow:**
1. Doctor adds consultation note
2. Patient receives notification
3. Patient views note in records
4. Patient can ask AI to explain
5. Patient can request clarification from doctor

### Hospital → Patient Records

**Flow:**
1. Hospital uploads records on behalf of patient
2. Patient receives notification
3. Patient reviews and approves
4. Records added to patient vault
5. Blockchain hash generated

---

## Error Handling Flows

### Upload Failure

**Flow:**
1. User attempts to upload file
2. Upload fails (network, file type, size)
3. System displays clear error message
4. User can retry or contact support
5. Failed upload logged for debugging

### Access Denied

**Flow:**
1. Doctor attempts to access records
2. Access has been revoked or expired
3. System displays access denied message
4. Doctor can request new access
5. Patient notified of access attempt

### Wallet Connection Failed

**Flow:**
1. User attempts to connect wallet
2. Connection fails
3. System displays error with troubleshooting steps
4. User can retry or use alternative authentication
5. Support contact available

---

## Security Flows

### Login Attempt Monitoring

**Flow:**
1. User attempts login
2. System validates credentials
3. Failed attempts logged
4. After multiple failures, account temporarily locked
5. User receives email notification
6. User can reset password or wait for unlock

### Suspicious Activity Detection

**Flow:**
1. System detects unusual access pattern
2. User receives security alert
3. User can confirm or deny activity
4. If denied, session terminated
5. Password reset required
6. Full audit trail reviewed

---

## Summary

VaultMedics provides comprehensive user flows for:

- **Patients**: Full control over their health data, from upload to sharing to understanding
- **Doctors**: Secure access to patient records with clear consent management
- **Hospitals**: Organization-level management and doctor coordination
- **Emergency Responders**: Quick access to critical information when needed

All flows prioritize:
- Patient consent and control
- Transparency through audit trails
- Security through blockchain verification
- Privacy through encrypted storage
- Accessibility through responsive design
