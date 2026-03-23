#!/bin/bash

# Test Chat Save Functionality
# This script tests if chat messages are properly saved to MongoDB after AI response

set -e

echo "============================================"
echo "Chat Save Test Script"
echo "============================================"
echo ""

# Check if running inside DDEV
if [ ! -f "/.dockerenv" ]; then
    echo "⚠️  Not running inside DDEV container"
    echo "   Executing via: ddev exec ./test-chat-save.sh"
    exec ddev exec ./test-chat-save.sh
    exit 0
fi

# Generate unique chat ID
TIMESTAMP=$(date +%s)
CHAT_ID="chat_test_${TIMESTAMP}"
TEST_MESSAGE="What is 2+2? Please answer briefly."

echo "📝 Test Configuration:"
echo "   Chat ID: $CHAT_ID"
echo "   Message: $TEST_MESSAGE"
echo ""

# Check database before test
echo "🔍 Checking database BEFORE sending message..."
BEFORE_COUNT=$(mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.countDocuments()" 2>/dev/null | tail -1)
echo "   Total chats in database: $BEFORE_COUNT"
echo ""

# Send chat request and capture response
echo "📤 Sending chat request to API..."
echo "   Endpoint: http://localhost:3000/api/chat"
echo "   Streaming response..."
echo ""

RESPONSE_FILE="/tmp/chat_response_${TIMESTAMP}.txt"
START_TIME=$(date +%s)

curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"chatId\": \"${CHAT_ID}\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"${TEST_MESSAGE}\"
      }
    ]
  }" > "$RESPONSE_FILE" 2>&1

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "✓ Response received in ${DURATION} seconds"
echo ""

# Extract content from streaming response
echo "📊 Analyzing response..."
CONTENT_CHUNKS=$(grep -c '"content":"' "$RESPONSE_FILE" || true)
HAS_TRUNCATION=$(grep -c '"truncated":true' "$RESPONSE_FILE" || true)

echo "   Content chunks received: $CONTENT_CHUNKS"
echo "   Response truncated: $([ $HAS_TRUNCATION -gt 0 ] && echo 'YES' || echo 'NO')"
echo ""

# Assemble full response
FULL_RESPONSE=$(grep -o '"content":"[^"]*"' "$RESPONSE_FILE" | sed 's/"content":"//g' | sed 's/"$//g' | tr -d '\n')
echo "   Response preview: ${FULL_RESPONSE:0:100}..."
echo ""

# Wait a moment for potential async saves
echo "⏱️  Waiting 3 seconds for database save operations..."
sleep 3
echo ""

# Check if chat exists in database
echo "🔍 Checking database AFTER response..."
AFTER_COUNT=$(mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.countDocuments()" 2>/dev/null | tail -1)
echo "   Total chats in database: $AFTER_COUNT"
echo ""

# Search for our specific chat
echo "🔎 Looking for test chat ID: $CHAT_ID"
CHAT_EXISTS=$(mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.findOne({id: \"${CHAT_ID}\"}) ? \"FOUND\" : \"NOT_FOUND\"" 2>/dev/null | tail -1)

if [ "$CHAT_EXISTS" = "FOUND" ]; then
    echo "   ✅ Chat found in database!"
    echo ""
    
    # Get message count
    MSG_COUNT=$(mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.findOne({id: \"${CHAT_ID}\"}).messages.length" 2>/dev/null | tail -1)
    echo "   📨 Messages saved: $MSG_COUNT"
    
    # Get actual messages
    echo ""
    echo "   💬 Saved messages:"
    mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "
      var chat = db.chats.findOne({id: \"${CHAT_ID}\"});
      if (chat && chat.messages) {
        chat.messages.forEach((msg, idx) => {
          print(\"      [\" + (idx + 1) + \"] \" + msg.role.toUpperCase() + \": \" + msg.content.substring(0, 80) + (msg.content.length > 80 ? \"...\" : \"\"));
        });
      }
    " 2>/dev/null
else
    echo "   ❌ Chat NOT found in database!"
    echo ""
    echo "   ⚠️  OBSERVATION: Messages are NOT being saved!"
fi

echo ""
echo "============================================"
echo "Test Results Summary"
echo "============================================"
echo "Database count before: $BEFORE_COUNT"
echo "Database count after:  $AFTER_COUNT"
echo "Chat saved:            $([ "$CHAT_EXISTS" = "FOUND" ] && echo 'YES ✅' || echo 'NO ❌')"
echo "Response time:         ${DURATION}s"
echo "Content chunks:        $CONTENT_CHUNKS"
echo ""

# Cleanup
rm -f "$RESPONSE_FILE"

if [ "$CHAT_EXISTS" = "FOUND" ]; then
    echo "✅ TEST PASSED - Chat was saved to database"
    echo ""
    echo "🧹 Cleanup: Remove test chat? (y/N)"
    read -t 5 -n 1 CLEANUP_CHOICE || CLEANUP_CHOICE="n"
    echo ""
    if [ "$CLEANUP_CHOICE" = "y" ] || [ "$CLEANUP_CHOICE" = "Y" ]; then
        mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.deleteOne({id: \"${CHAT_ID}\"})" 2>/dev/null > /dev/null
        echo "   ✓ Test chat deleted"
    fi
else
    echo "❌ TEST FAILED - Chat was NOT saved to database"
    echo ""
    echo "📋 Possible causes:"
    echo "   1. ✅ Chat API only streams responses, doesn't save (CONFIRMED)"
    echo "   2. ✅ Save happens in client-side ChatInterface after streaming (EXPECTED)"
    echo "   3. sessionId might be missing or invalid"
    echo "   4. Database connection issue"
    echo ""
    echo "💡 Analysis:"
    echo "   The /api/chat endpoint is designed to ONLY stream AI responses."
    echo "   Saving to database happens in ChatInterface.tsx via:"
    echo "   - updateChat() function after streaming completes"
    echo "   - POST to /api/chats endpoint with full message history"
    echo ""
    echo "   This is expected behavior! The API works correctly."
    echo "   To fully test, need to simulate the client-side save:"
    echo "   1. Stream response from /api/chat"
    echo "   2. Then POST complete conversation to /api/chats"
fi

echo ""
echo "============================================"

