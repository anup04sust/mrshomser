# Phase 1 Test Plan

**Branch:** `feature/phase1-foundation-improvements`  
**Purpose:** Verify all Phase 1 foundation improvements work correctly before merging to main  
**Estimated Time:** 30-45 minutes  

---

## Prerequisites

Before testing, ensure:
- [x] DDEV environment is running (`ddev start`)
- [x] MongoDB is accessible
- [ ] `.env.local` has a strong JWT_SECRET (see Setup step 1)
- [ ] Browser DevTools open (for inspecting cookies/network)
- [ ] MongoDB Compass or CLI ready (optional, for database inspection)

---

## Setup Steps

### 1. Generate Strong JWT Secret

**Current Issue:** `.env.local` has weak default secret that config validator will reject.

```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Action:** Copy output and update `.env.local`:
```env
JWT_SECRET=<paste-generated-secret-here>
```

**Expected:** 43+ character base64 string (40+ after padding removal)

---

### 2. Install Dependencies & Run Index Setup

```bash
# Ensure tsx is installed (should be in devDependencies)
pnpm install

# Create MongoDB indexes
pnpm setup:indexes
```

**Expected Output:**
```
✓ Connected to MongoDB
✓ Creating indexes for users collection...
  - email (unique)
  - createdAt
✓ Creating indexes for chats collection...
  - sessionId
  - userId
  - updatedAt
  - sessionId + updatedAt (compound)
  - userId + updatedAt (compound)
✓ All indexes created successfully
```

**Verify in MongoDB:**
```bash
ddev exec -s mongo mongo -u db -p db --authenticationDatabase admin mrshomser

# In mongo shell:
use mrshomser
db.users.getIndexes()
db.chats.getIndexes()
```

**Expected:** Should see all 8 indexes listed

---

### 3. Restart Development Server

```bash
# Kill existing process if running
# Start fresh
pnpm dev
```

**Expected:** App starts successfully at http://localhost:3000 (or DDEV URL)

---

## Test Suite

### Test 1: Config Validation - Weak Secret Detection

**Objective:** Verify config validator rejects weak JWT secrets

**Steps:**
1. Stop dev server
2. Edit `.env.local` - set `JWT_SECRET=weak`
3. Try to start: `pnpm dev`

**Expected Result:**
```
❌ Configuration Error:
JWT_SECRET must be at least 32 characters long (current: 4)
```

**Status:** [ ] Pass [ ] Fail

**Restore:** Set strong JWT_SECRET back before continuing

---

### Test 2: Config Validation - Default Secret Detection

**Objective:** Verify config validator detects common default secrets

**Steps:**
1. Stop dev server
2. Edit `.env.local` - set `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456`
3. Try to start: `pnpm dev`

**Expected Result:**
```
❌ Configuration Error:
JWT_SECRET appears to be a default/example value. Please use a secure secret.
```

**Status:** [ ] Pass [ ] Fail

**Restore:** Set strong JWT_SECRET back before continuing

---

### Test 3: Guest User Flow - Chat Creation

**Objective:** Verify guests can create chats without authentication

**Steps:**
1. Open app in **incognito/private window**
2. Open Browser DevTools → Application → Cookies
3. Note: No `token` cookie, but should see `sessionId` cookie
4. Type message: "Hello, I am a guest user"
5. Send message
6. Note the `sessionId` cookie value (e.g., `guest_abc123`)

**Expected Result:**
- [x] Message sends successfully
- [x] Response streams back from Ollama
- [x] Chat appears in sidebar
- [x] `sessionId` cookie is set (format: `guest_*`)
- [x] No `token` cookie exists

**Verify in MongoDB:**
```javascript
db.chats.findOne({ sessionId: "guest_abc123" }) // Use your actual sessionId
```

**Expected:** Chat document with `sessionId` field, no `userId` field

**Status:** [ ] Pass [ ] Fail  
**SessionID for next test:** `_________________`

---

### Test 4: Guest Registration & Chat Migration

**Objective:** Verify guest chats migrate to user account on registration

**Steps:**
1. Continue from Test 3 (same incognito window with guest chat)
2. Click "Sign In" button
3. Switch to "Sign Up" tab
4. Register with:
   - Email: `test@example.com`
   - Password: `SecurePass123!`
5. Submit registration
6. Check DevTools → Cookies → Note `token` cookie appears
7. Check sidebar - guest chat should still be visible

**Expected Result:**
- [x] Registration succeeds
- [x] `token` cookie is set (JWT format)
- [x] `sessionId` cookie may still exist (doesn't matter)
- [x] Previous guest chat is still visible in sidebar
- [x] Response includes `migratedChats: 1` (check Network tab → Payload)

**Verify in MongoDB:**
```javascript
// Find the user
const user = db.users.findOne({ email: "test@example.com" })

// Check chat ownership transferred
db.chats.findOne({ 
  _id: ObjectId("<chat-id-from-sidebar>")
})
```

**Expected:** Chat document now has `userId: "<user-id>"`, no `sessionId` field

**Status:** [ ] Pass [ ] Fail

---

### Test 5: Cross-Device Continuity

**Objective:** Verify authenticated user can access chats from different devices

**Steps:**
1. In original window (or new incognito), login as `test@example.com`
2. Verify sidebar shows the chat from Test 4
3. Create a new chat: "This is a new chat from device 2"
4. Open a **second browser** (or different profile)
5. Login to same account: `test@example.com`
6. Check sidebar

**Expected Result:**
- [x] Both chats visible in second browser
- [x] Can open and view both chat histories
- [x] Can continue conversations from either browser

**Status:** [ ] Pass [ ] Fail

---

### Test 6: Guest Login & Chat Migration

**Objective:** Verify existing user login also migrates guest chats

**Steps:**
1. Logout from all browsers
2. Open new incognito window
3. As guest, create chat: "Chat before login"
4. Click "Sign In" → Login tab
5. Login with: `test@example.com` / `SecurePass123!`
6. Check sidebar

**Expected Result:**
- [x] Login succeeds
- [x] New guest chat now appears in sidebar
- [x] Old chats from Test 4-5 also visible
- [x] Total chats: 3 (1 from Test 4, 1 from Test 5, 1 from Test 6)

**Verify in MongoDB:**
```javascript
const user = db.users.findOne({ email: "test@example.com" })
db.chats.countDocuments({ userId: user._id })
```

**Expected:** Count = 3

**Status:** [ ] Pass [ ] Fail

---

### Test 7: Ownership Isolation

**Objective:** Verify users can only see their own chats

**Steps:**
1. Register a second user: `test2@example.com` / `SecurePass456!`
2. Create chat as second user: "Chat from user 2"
3. Logout
4. Login as first user: `test@example.com`
5. Check sidebar - should NOT see user 2's chat

**Expected Result:**
- [x] User 1 sees only their 3 chats
- [x] User 1 cannot see User 2's chat
- [x] Attempting to access User 2's chat directly returns 404

**Test Direct Access:**
1. Note a chat ID from User 2's sidebar
2. Logout and login as User 1
3. Try: `GET /api/chats/<user2-chat-id>`
4. Expected: 404 or 403 error

**Status:** [ ] Pass [ ] Fail

---

### Test 8: Model Configuration

**Objective:** Verify app uses correct model from config

**Steps:**
1. Check `.env.local` - `OLLAMA_MODEL=phi3:mini`
2. Send a chat message
3. Open Browser DevTools → Network → Find POST to `/api/chat`
4. Inspect request payload

**Expected Result:**
- [x] Request includes `model: "phi3:mini"`
- [x] No hardcoded model names in code
- [x] Response comes from phi3:mini

**Verify in Code:**
```bash
# Should find NO references to qwen3.5:4b
grep -r "qwen3.5" app/
```

**Expected:** No results (or only comments)

**Status:** [ ] Pass [ ] Fail

---

### Test 9: Index Performance

**Objective:** Verify indexes improve query performance

**Steps:**
1. Create test data (optional - skip if low on time):
```javascript
// In MongoDB shell
use mrshomser
for(let i = 0; i < 100; i++) {
  db.users.insertOne({
    email: `user${i}@test.com`,
    password: "hashed",
    createdAt: new Date()
  })
}
```

2. Test query performance:
```javascript
// Without index (simulate by dropping)
db.users.dropIndex("email_1")
db.users.find({ email: "user50@test.com" }).explain("executionStats")
// Note: executionTimeMillis, totalDocsExamined

// With index (recreate)
db.users.createIndex({ email: 1 }, { unique: true })
db.users.find({ email: "user50@test.com" }).explain("executionStats")
// Note: Should use IXSCAN, examine only 1 doc
```

**Expected Result:**
- [x] With index: `totalDocsExamined: 1`, uses `IXSCAN`
- [x] Without index: `totalDocsExamined: 100+`, uses `COLLSCAN`
- [x] Query time significantly faster with index

**Status:** [ ] Pass [ ] Fail

---

### Test 10: Error Handling

**Objective:** Verify graceful error handling

**Test Cases:**

#### A. Invalid Login
1. Login with: `wrong@email.com` / `wrongpass`
2. **Expected:** Clear error message, no crash

#### B. Duplicate Email
1. Try to register with existing email: `test@example.com`
2. **Expected:** "Email already exists" error

#### C. Weak Password (if validation exists)
1. Try to register with password: `123`
2. **Expected:** Password validation error

#### D. Invalid JWT
1. Manually edit `token` cookie in DevTools
2. Change to: `invalid.jwt.token`
3. Refresh page
4. **Expected:** Act as guest user, no crash

#### E. MongoDB Connection Lost
1. Stop MongoDB: `ddev stop mongo` (skip if destructive)
2. Try to load chats
3. **Expected:** Error message, doesn't crash app
4. Restore: `ddev start`

**Status:**
- [ ] A. Invalid Login: Pass / Fail
- [ ] B. Duplicate Email: Pass / Fail
- [ ] C. Weak Password: Pass / Fail
- [ ] D. Invalid JWT: Pass / Fail
- [ ] E. MongoDB Lost: Pass / Fail

---

## Database Verification

Run these queries to verify data integrity:

```javascript
use mrshomser

// 1. Check users have unique emails
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
// Expected: Empty (no duplicates)

// 2. Check all chats have owner (userId OR sessionId)
db.chats.find({
  $and: [
    { userId: { $exists: false } },
    { sessionId: { $exists: false } }
  ]
})
// Expected: Empty (all chats have owner)

// 3. Check no chats have BOTH userId AND sessionId
db.chats.find({
  $and: [
    { userId: { $exists: true } },
    { sessionId: { $exists: true } }
  ]
})
// Expected: Empty (exclusive ownership)

// 4. Verify indexes exist
db.users.getIndexes().length
// Expected: 3 indexes (_id, email, createdAt)

db.chats.getIndexes().length
// Expected: 6 indexes (_id, sessionId, userId, updatedAt, 2 compound)
```

**Status:**
- [ ] No duplicate emails
- [ ] All chats have owner
- [ ] Exclusive ownership (no dual)
- [ ] All indexes present

---

## Regression Testing

Verify existing functionality still works:

- [ ] **Chat Interface:** Messages send and receive correctly
- [ ] **Markdown:** Code blocks, lists, formatting renders properly
- [ ] **Streaming:** Responses stream token by token (not all at once)
- [ ] **Sidebar:** Chats list, click to switch, titles display
- [ ] **Auth UI:** Modal opens/closes, tabs switch, forms submit
- [ ] **Logout:** Clears token cookie, reverts to guest mode

---

## Performance Benchmarks

Optional - for large datasets:

### Chat List Load Time

```javascript
// Create 1000 chats for a user
use mrshomser
const userId = db.users.findOne({ email: "test@example.com" })._id
for(let i = 0; i < 1000; i++) {
  db.chats.insertOne({
    userId: userId,
    title: `Chat ${i}`,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  })
}
```

Measure: Time to load `/api/chats` endpoint

**Expected:**
- With indexes: < 100ms for 1000 chats
- Without indexes: > 500ms for 1000 chats

---

## Known Issues Checklist

These issues are documented but not blocking:

- [ ] JWT type error in auth routes (TypeScript only, runtime works)
- [ ] No rate limiting (Phase 2)
- [ ] No request validation with Zod (Phase 1 remaining)
- [ ] Console.log used instead of structured logging (Phase 2)
- [ ] No streaming state persistence (Phase 2)

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Weak Secret Detection | [ ] | |
| 2. Default Secret Detection | [ ] | |
| 3. Guest Chat Creation | [ ] | |
| 4. Registration Migration | [ ] | |
| 5. Cross-Device Access | [ ] | |
| 6. Login Migration | [ ] | |
| 7. Ownership Isolation | [ ] | |
| 8. Model Configuration | [ ] | |
| 9. Index Performance | [ ] | |
| 10. Error Handling | [ ] | |

**Overall Phase 1 Status:** [ ] Pass [ ] Fail

---

## Sign-off

- [ ] All critical tests pass
- [ ] No data corruption observed
- [ ] Performance acceptable
- [ ] No security issues found
- [ ] Ready to merge to main

**Tester:** ___________________  
**Date:** ___________________  
**Environment:** DDEV / Local / Production  
**Branch:** feature/phase1-foundation-improvements  
**Commit:** ed8a04a

---

## Rollback Plan

If critical issues found:

```bash
# Switch back to main
git checkout main

# Delete feature branch locally
git branch -D feature/phase1-foundation-improvements

# If already pushed, delete remote branch
git push origin --delete feature/phase1-foundation-improvements
```

**Data Cleanup:**
```javascript
// If needed, remove test data
use mrshomser
db.users.deleteMany({ email: /test.*@example\.com/ })
db.chats.deleteMany({ userId: { $in: [/* test user ids */] } })
```

---

## Next Steps After Passing

1. **Merge to main:**
```bash
git checkout main
git merge --no-ff feature/phase1-foundation-improvements
git tag -a v1.1.0 -m "Phase 1: Foundation improvements"
git push origin main --tags
```

2. **Deploy to production:**
   - Ensure production `.env` has strong JWT_SECRET
   - Run `pnpm setup:indexes` on production MongoDB
   - Monitor logs for errors
   - Verify guest-to-user migration works

3. **Start Phase 2:**
   - Create new branch: `feature/phase2-reliability-improvements`
   - Implement streaming persistence
   - Add structured logging
   - Add route validation

---

**Happy Testing! 🧪**
