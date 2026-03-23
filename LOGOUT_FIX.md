# Logout Session Fix

## Problem
After logout, old chat history was still showing in the left sidebar because:
1. Session cookie was persisting in the browser
2. State wasn't being properly cleared on logout
3. Browser was sending old session cookie on next page load

## Solution Implemented

### 1. Updated Logout API (`/api/auth/logout`)
Now explicitly clears both cookies with `Max-Age=0`:
```typescript
response.cookies.set('auth_token', '', { maxAge: 0, path: '/', ... });
response.cookies.set('mrshomser_session', '', { maxAge: 0, path: '/', ... });
```

### 2. Updated Client-Side Logout (`Sidebar.tsx`)
```typescript
- Clear all localStorage
- Call logout API with credentials
- Force redirect to '/' to create fresh session
- Even if API fails, still redirect to clear state
```

### 3. Fixed Session Management
- Session cookie now properly deleted on logout
- New guest session created on next page visit
- Chat history cleared from UI

## How to Test

### Test Logout Functionality:
1. Open https://mrshomser.ddev.site
2. Create some chats (you'll see them in the sidebar)
3. Click the logout button
4. **Expected Result:** 
   - Page reloads
   - Sidebar is empty (no old chats)
   - New guest session created

### If Old Sessions Still Persist:

**Option 1: Clear Browser Data Manually**
```
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear all:
   - Cookies (especially mrshomser_session)
   - Local Storage
   - Session Storage
4. Refresh page
```

**Option 2: Use Incognito/Private Window**
```
Open https://mrshomser.ddev.site in incognito mode
- Fresh session every time
- No cookie persistence
```

**Option 3: Clear DDEV Cookies via Command**
```bash
# Test logout API directly
ddev exec "curl -X POST http://localhost:3000/api/auth/logout -i"

# Verify cookies have Max-Age=0
```

### Verify Proper Cookie Deletion:
```bash
# Check logout endpoint response
ddev exec "curl -X POST http://localhost:3000/api/auth/logout -i 2>&1 | grep -E 'set-cookie'"

# Should show:
# set-cookie: auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=lax
# set-cookie: mrshomser_session=; Path=/; Max-Age=0; HttpOnly; SameSite=lax
```

## Database Sessions

Note: The MongoDB database still contains chat history for old sessions. This is normal! 

**How it works:**
- Each session ID (e.g., `guest_abc123`) has its own chat history
- When you logout, a NEW session ID is created (e.g., `guest_xyz789`)
- The new session has NO chat history
- Old sessions remain in database (for privacy/data retention)

**To truly clean database:**
```bash
# View all sessions in database
ddev exec 'mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "
  db.chats.find({}, {sessionId: 1, title: 1}).forEach(printjson);
"'

# Delete all guest sessions (optional)
ddev exec 'mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "
  db.chats.deleteMany({sessionId: /^guest_/});
"'
```

## Changes Made

### Files Modified:
1. `/app/api/auth/logout/route.ts` - Properly clear cookies with maxAge: 0
2. `/app/components/Sidebar.tsx` - Clear localStorage and force redirect
3. `/app/components/ChatInterface.tsx` - Handle logout state clearing

### Verification:
✅ Logout API returns `Max-Age=0` for both cookies
✅ Page redirects to `/` after logout
✅ New guest session created
✅ Sidebar shows empty chat list
✅ Old chats remain in database but aren't accessible

## Troubleshooting

**Still seeing old chats after logout?**
1. Check browser DevTools > Application > Cookies
2. Manually delete `mrshomser_session` cookie
3. Refresh the page
4. You should see a new guest session created

**Session cookie not being deleted?**
- Make sure you're using the logout button (not just refreshing)
- Check that cookies are enabled in your browser
- Try using incognito mode
- Clear browser cache

**Chat history persists across ddev restarts?**
- This is EXPECTED if you don't logout first
- Browser keeps the session cookie (30-day expiry)
- Solution: Click logout button before closing browser
- Or use incognito mode for testing

## Summary

✅ **FIXED:** Logout now properly clears session and creates new guest session
✅ **FIXED:** Chat history cleared from UI on logout
✅ **FIXED:** Page reloads to ensure fresh state
✅ **WORKING:** Each session has isolated chat history

The system is now working correctly! 🎉
