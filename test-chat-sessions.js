// Simple test script to verify chat session API endpoints
// Run with: node test-chat-sessions.js

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'testuser';

async function testChatSessionAPIs() {
  console.log('🧪 Testing Chat Session Management APIs...\n');

  try {
    // Test 1: Start a new chat session
    console.log('1️⃣ Testing: Start Chat Session');
    const startResponse = await fetch(`${BASE_URL}/api/chat/start-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: TEST_USERNAME })
    });
    
    if (startResponse.ok) {
      const startData = await startResponse.json();
      console.log('✅ Start Session Success:', startData);
      
      const sessionId = startData.chat_session_id;
      
      // Test 2: Get chat sessions
      console.log('\n2️⃣ Testing: Get Chat Sessions');
      const sessionsResponse = await fetch(`${BASE_URL}/api/chat/sessions/${TEST_USERNAME}`);
      
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        console.log('✅ Get Sessions Success:', sessionsData);
      } else {
        console.log('❌ Get Sessions Failed:', sessionsResponse.status);
      }
      
      // Test 3: Get chat history (should be empty for new session)
      console.log('\n3️⃣ Testing: Get Chat History');
      const historyResponse = await fetch(`${BASE_URL}/api/chat/history/${sessionId}`);
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log('✅ Get History Success:', historyData);
      } else {
        console.log('❌ Get History Failed:', historyResponse.status);
      }
      
      // Test 4: End chat session
      console.log('\n4️⃣ Testing: End Chat Session');
      const endResponse = await fetch(`${BASE_URL}/api/chat/end-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_session_id: sessionId })
      });
      
      if (endResponse.ok) {
        const endData = await endResponse.json();
        console.log('✅ End Session Success:', endData);
      } else {
        console.log('❌ End Session Failed:', endResponse.status);
      }
      
    } else {
      console.log('❌ Start Session Failed:', startResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
  
  console.log('\n🏁 Chat Session API Tests Complete!');
}

// Run the tests
testChatSessionAPIs();
