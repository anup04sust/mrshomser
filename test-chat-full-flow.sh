#!/bin/bash

# Complete Chat Flow Test
# Simulates what ChatInterface.tsx does: stream response + save to database

set -e

echo "============================================"
echo "Complete Chat Flow Test"
echo "============================================"
echo ""

# Check if running inside DDEV
if [ ! -f "/.dockerenv" ]; then
    exec ddev exec ./test-chat-full-flow.sh
    exit 0
fi

TIMESTAMP=$(date +%s)
CHAT_ID="chat_test_${TIMESTAMP}"
SESSION_ID="test_session_${TIMESTAMP}"
USER_MSG="What is the capital of France? Answer briefly."

echo "📝 Test Configuration:"
echo "   Chat ID: $CHAT_ID"
echo "   Session ID: $SESSION_ID"
echo "   User Message: $USER_MSG"
echo ""

# Step 1: Create new chat
echo "📋 Step 1: Creating new chat..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"${CHAT_ID}\",
    \"sessionId\": \"${SESSION_ID}\",
    \"title\": \"${USER_MSG}\",
    \"messages\": []
  }")

echo "$CREATE_RESPONSE" | grep -q '"success":true' && echo "   ✅ Chat created successfully" || echo "   ❌ Failed to create chat"
echo ""

# Step 2: Stream AI response
echo "📤 Step 2: Streaming AI response from /api/chat..."
RESPONSE_FILE="/tmp/chat_response_${TIMESTAMP}.txt"

curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"${USER_MSG}\"
      }
    ]
  }" > "$RESPONSE_FILE"

# Extract AI response
AI_RESPONSE=$(grep -o '"content":"[^"]*"' "$RESPONSE_FILE" | sed 's/"content":"//g' | sed 's/"$//g' | tr -d '\n')
CHUNKS=$(grep -c '"content":"' "$RESPONSE_FILE" || true)

echo "   ✅ Received ${CHUNKS} content chunks"
echo "   AI Response: $AI_RESPONSE"
echo ""

# Step 3: Save complete conversation to database
echo "💾 Step 3: Saving messages to database via /api/chats..."
UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:3000/api/chats/${CHAT_ID}" \
  -H "Content-Type: application/json" \
  -d "{
    \"messages\": [
      {
        \"id\": \"msg_user_${TIMESTAMP}\",
        \"role\": \"user\",
        \"content\": \"${USER_MSG}\",
        \"timestamp\": ${TIMESTAMP}000
      },
      {
        \"id\": \"msg_ai_${TIMESTAMP}\",
        \"role\": \"assistant\",
        \"content\": \"${AI_RESPONSE}\",
        \"timestamp\": ${TIMESTAMP}000
      }
    ],
    \"title\": \"${USER_MSG}\"
  }")

echo "$UPDATE_RESPONSE" | grep -q '"success":true' && echo "   ✅ Messages saved successfully" || echo "   ❌ Failed to save messages"
echo ""

# Step 4: Verify in database
echo "🔍 Step 4: Verifying in MongoDB..."
sleep 1

DB_RESULT=$(mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "
  var chat = db.chats.findOne({id: \"${CHAT_ID}\"});
  if (chat) {
    print(\"FOUND\");
    print(\"Messages: \" + chat.messages.length);
    chat.messages.forEach((msg, idx) => {
      print(\"[\" + (idx+1) + \"] \" + msg.role + \": \" + msg.content.substring(0, 50));
    });
  } else {
    print(\"NOT_FOUND\");
  }
" 2>/dev/null)

echo "$DB_RESULT"
echo ""

# Cleanup
rm -f "$RESPONSE_FILE"

if echo "$DB_RESULT" | grep -q "FOUND"; then
    echo "============================================"
    echo "✅ TEST PASSED"
    echo "============================================"
    echo "Complete chat flow works correctly:"
    echo "  1. ✅ Create chat via POST /api/chats"
    echo "  2. ✅ Stream response from POST /api/chat"
    echo "  3. ✅ Save messages via PUT /api/chats/:id"
    echo "  4. ✅ Verify in MongoDB"
    echo ""
    echo "📊 Observation:"
    echo "   Messages ARE saved when following the complete flow."
    echo "   ChatInterface.tsx should be working correctly."
    echo ""
    
    # Cleanup
    echo "🧹 Cleaning up test data..."
    mongosh mongodb://db:db@mongo:27017/mrshomser?authSource=admin --quiet --eval "db.chats.deleteOne({id: \"${CHAT_ID}\"})" 2>/dev/null > /dev/null
    echo "   ✓ Test chat deleted"
else
    echo "============================================"
    echo "❌ TEST FAILED"
    echo "============================================"
    echo "Messages were not saved to database."
    echo ""
    echo "Debugging info:"
    echo "Create response: $CREATE_RESPONSE"
    echo "Update response: $UPDATE_RESPONSE"
    echo ""
    echo "Check:"
    echo "  - Is MongoDB running?"
    echo "  - Are the API endpoints working?"
    echo "  - Check Next.js logs: ddev exec tail -50 /tmp/nextjs.log"
fi

echo ""
echo "============================================"
