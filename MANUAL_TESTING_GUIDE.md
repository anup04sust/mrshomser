# Manual Testing Guide - Phase 1 & 2

**Date:** 2026-03-24  
**Status:** Ready for manual testing  
**Branch:** feature/phase2-reliability-improvements

---

## Prerequisites

1. Dev environment running: `ddev start`
2. MongoDB running with indexes created
3. Browser with DevTools open (F12 → Console tab)

---

## Test 1: Guest Chat Creation and Migration ✅

### Objective
Verify that guest users can create chats and migrate them when registering/logging in.

### Steps

#### Part A: Guest Chat Creation

1. **Clear browser data**
   ```bash
   # In browser DevTools Console:
   localStorage.clear()
   # Then reload page (Ctrl+R or Cmd+R)
   ```

2. **Create chats as guest**
   - Open http://mrshomser.ddev.site:33000
   - Check footer: Should show "Guest" user
   - Create 2-3 test chats with different messages
   - Verify chats appear in sidebar
   - Verify chats persist after page reload

3. **Check browser storage**
   ```javascript
   // In DevTools Console:
   document.cookie
   // Should see: mrshomser_session=guest_xxxxx
   ```

4. **Check MongoDB**
   ```bash
   ddev exec mongo mongodb://db:db@mongo:27017/mrshomser?authSource=admin
   
   use mrshomser
   db.chats.find().pretty()
   
   # Should see chats with sessionId field (not userId)
   # Example: { sessionId: "guest_12345-678-9abc", userId: undefined }
   ```

#### Part B: Guest → User Migration (Registration)

5. **Register new account**
   - Click "Login" button in sidebar footer
   - Switch to "Register" tab
   - Enter email: `test@example.com`
   - Enter name: `Test User`
   - Enter password: `password123`
   - Click "Register"

6. **Verify migration**
   - Check console logs for migration message:
     ```
     Migrated X chats from guest session to user...
     ```
   - Verify chats still appear in sidebar
   - Verify footer now shows "Test User"
   - Check response shows `migratedChats` count

7. **Check MongoDB after migration**
   ```bash
   db.chats.find().pretty()
   
   # Chats should now have:
   # - userId: ObjectId("...")
   # - NO sessionId field
   # - migratedAt: ISODate("...")
   ```

8. **Test persistence**
   - Reload page
   - Verify user still logged in ("Test User" in footer)
   - Verify all chats still present

#### Part C: Guest → User Migration (Login)

9. **Logout and create new guest chats**
   - Click "Logout" in sidebar
   - Page should reload → back to "Guest"
   - Create 2 new test chats

10. **Login with existing account**
    - Click "Login"
    - Enter: `test@example.com` / `password123`
    - Click "Login"

11. **Verify migration**
    - Console should show migration count
    - All chats (old + new) should be visible
    - Footer shows "Test User"

12. **Check MongoDB**
    ```bash
    db.chats.find({ userId: { $exists: true } }).count()
    # Should show total count including migrated chats
    ```

### Expected Results

✅ **Pass Criteria:**
- Guest can create chats without authentication
- Guest chats use `sessionId` in database
- Registration migrates guest chats to `userId`
- Login migrates guest chats to `userId`
- No data loss during migration
- Console logs show migration count
- MongoDB reflects ownership change (sessionId → userId)

❌ **Failure Indicators:**
- Chats disappear after registration/login
- Migration count is 0 when it should be > 0
- Database still has sessionId after migration
- Errors in console during migration

---

## Test 2: Cross-Device Continuity ✅

### Objective
Verify that authenticated users can access their chats from different browsers/devices.

### Steps

#### Part A: Setup

1. **Login on Browser 1 (Chrome)**
   - Clear data and login as `test@example.com`
   - Create 3 distinct chats:
     - "Chrome Chat 1"
     - "Chrome Chat 2"
     - "Chrome Chat 3"
   - Note: All should be visible in sidebar

2. **Check auth token**
   ```javascript
   // DevTools Console:
   document.cookie
   // Should see: auth_token=eyJhbGc...
   ```

#### Part B: Different Browser

3. **Login on Browser 2 (Firefox or different Chrome profile)**
   - Open http://mrshomser.ddev.site:33000
   - Login with same account: `test@example.com`

4. **Verify chats loaded**
   - Should see all 3 "Chrome Chat" chats
   - Should be able to open and view messages
   - Should be able to create new chat

5. **Create chat on Browser 2**
   - Create "Firefox Chat 1"
   - Note: This won't auto-sync to Browser 1

#### Part C: Cross-Device Verification

6. **Reload Browser 1**
   - Hit refresh (Ctrl+R)
   - Should now see "Firefox Chat 1"
   - All 4 chats should be present

7. **Test deletion on Browser 2**
   - Delete "Chrome Chat 2" in Firefox
   - Reload Browser 1
   - "Chrome Chat 2" should be gone

### Expected Results

✅ **Pass Criteria:**
- Same user sees same chats on different browsers
- Authentication persists across devices
- Chats survive browser reload
- CRUD operations reflect across devices (after reload)

❌ **Failure Indicators:**
- Different chat lists on different browsers
- Chats missing on second device
- "Chat not found" errors

---

## Test 3: Ownership Isolation ✅

### Objective
Verify that users cannot access other users' chats.

### Steps

#### Part A: Create Two Users

1. **User 1 Setup**
   - Logout completely (Ctrl+Shift+Del → Clear all)
   - Register: `alice@example.com` / `Alice` / `password123`
   - Create chats:
     - "Alice's Private Chat 1"
     - "Alice's Private Chat 2"
   - Note Alice's chat IDs from sidebar (hover to see in URL)

2. **User 2 Setup**
   - Logout
   - Register: `bob@example.com` / `Bob` / `password123`
   - Create chats:
     - "Bob's Private Chat 1"
     - "Bob's Private Chat 2"
   - Note Bob's chat IDs

#### Part B: Attempt Unauthorized Access

3. **Try to access Alice's chat as Bob**
   - **While logged in as Bob**, open DevTools Console
   - Try to fetch Alice's chat directly:
     ```javascript
     fetch('/api/chats/ALICE_CHAT_ID_HERE')
       .then(r => r.json())
       .then(console.log)
     
     // Should return: { error: 'Chat not found' }
     // Status: 404
     ```

4. **Verify isolation in MongoDB**
   ```bash
   ddev exec mongo mongodb://db:db@mongo:27017/mrshomser?authSource=admin
   
   use mrshomser
   
   # Get Alice's userId
   db.users.findOne({ email: "alice@example.com" })
   # Note the _id
   
   # Get Bob's userId  
   db.users.findOne({ email: "bob@example.com" })
   # Note the _id
   
   # Verify Alice's chats
   db.chats.find({ userId: "ALICE_USERID_HERE" }).count()
   # Should be 2
   
   # Verify Bob's chats
   db.chats.find({ userId: "BOB_USERID_HERE" }).count()
   # Should be 2
   
   # Try cross-user query (should return 0)
   db.chats.find({ 
     id: "ALICE_CHAT_ID",
     userId: "BOB_USERID"
   }).count()
   # Should be 0
   ```

#### Part C: API Endpoint Testing

5. **Test all CRUD operations**
   ```javascript
   // As Bob, try to:
   
   // 1. GET Alice's chat
   fetch('/api/chats/ALICE_CHAT_ID')
     .then(r => r.json())
     .then(console.log)
   // Expected: { error: 'Chat not found' }, 404
   
   // 2. UPDATE Alice's chat
   fetch('/api/chats/ALICE_CHAT_ID', {
     method: 'PUT',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ title: 'Hacked!' })
   })
     .then(r => r.json())
     .then(console.log)
   // Expected: { error: 'Chat not found' }, 404
   
   // 3. DELETE Alice's chat
   fetch('/api/chats/ALICE_CHAT_ID', {
     method: 'DELETE'
   })
     .then(r => r.json())
     .then(console.log)
   // Expected: { error: 'Chat not found' }, 404
   ```

6. **Login as Alice and verify**
   - Logout from Bob
   - Login as Alice
   - Verify both chats still exist
   - Verify no unauthorized modifications

### Expected Results

✅ **Pass Criteria:**
- Users only see their own chats
- API returns 404 for chats owned by other users
- Cannot GET/PUT/DELETE another user's chats
- Database queries respect userId filtering
- No data leakage between users

❌ **Failure Indicators:**
- Can access another user's chat via API
- See other users' chats in sidebar
- Successful modification of another user's data
- 200 OK response when accessing unauthorized chat

---

## Test 4: Chat Selection Issue (Reported Bug) 🐛

### Objective
Diagnose and fix the issue where clicking old chats doesn't load them.

### Steps

1. **Create test scenario**
   - Login as any user
   - Create 5+ chats with different messages
   - Note current chat highlighted in sidebar

2. **Test chat switching**
   - Open DevTools Console
   - Click different chats in sidebar
   - Watch console for logs:
     ```
     selectChat called with chatId: chat_xxx
     Current chatId: chat_yyy
     Switching to chat: chat_xxx
     Found chat: "Title" with N messages
     ```

3. **Observe behavior**
   - Do messages change in main area?
   - Does sidebar highlight move?
   - Any errors in console?

4. **Test edge cases**
   - Click currently selected chat (should just close sidebar)
   - Click chat while a message is sending
   - Click chat quickly in succession

### Expected Results

✅ **Pass Criteria:**
- Console shows selectChat logs
- Message area updates to show selected chat messages
- Sidebar highlight moves to selected chat
- No errors in console
- Smooth transition between chats

❌ **Failure Indicators:**
- No console logs → Click handler not firing
- Logs but no UI change → React state issue
- Errors in console → Code bug
- Messages don't change → Data loading issue

**Next Steps:** Share console output in this test to diagnose further.

---

## Summary Checklist

- [ ] Guest chat creation works
- [ ] Guest → User migration (register) works
- [ ] Guest → User migration (login) works
- [ ] Cross-device continuity works
- [ ] Ownership isolation enforced
- [ ] Chat selection switches correctly

---

## Need Help?

If any test fails:
1. Copy console errors
2. Note which step failed
3. Share MongoDB query results if relevant
4. I'll help debug!
