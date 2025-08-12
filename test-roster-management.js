// Simple test script to verify roster management API endpoints
// Run with: node test-roster-management.js

const BASE_URL = 'http://localhost:3001';
const TEST_SESSION_ID = 'test-session-123';
const TEST_ARTISTS = ['Artist 1', 'Artist 2'];

async function testRosterManagementAPIs() {
  console.log('🧪 Testing Roster Management APIs...\n');

  try {
    // Test 1: Get selected artists for chat session (should be empty initially)
    console.log('1️⃣ Testing: Get Selected Artists for Chat Session');
    const getSelectedResponse = await fetch(`${BASE_URL}/api/artists/selected/${TEST_SESSION_ID}`);
    
    if (getSelectedResponse.ok) {
      const selectedData = await getSelectedResponse.json();
      console.log('✅ Get Selected Artists Success:', selectedData);
    } else {
      console.log('❌ Get Selected Artists Failed:', getSelectedResponse.status);
    }
    
    // Test 2: Select artists for chat session
    console.log('\n2️⃣ Testing: Select Artists for Chat Session');
    const selectResponse = await fetch(`${BASE_URL}/api/artists/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_session_id: TEST_SESSION_ID,
        artist_names: TEST_ARTISTS
      })
    });
    
    if (selectResponse.ok) {
      const selectData = await selectResponse.json();
      console.log('✅ Select Artists Success:', selectData);
      
      // Test 3: Get selected artists again (should now have artists)
      console.log('\n3️⃣ Testing: Get Selected Artists After Adding');
      const getSelectedAfterResponse = await fetch(`${BASE_URL}/api/artists/selected/${TEST_SESSION_ID}`);
      
      if (getSelectedAfterResponse.ok) {
        const selectedAfterData = await getSelectedAfterResponse.json();
        console.log('✅ Get Selected Artists After Adding Success:', selectedAfterData);
        
        // Test 4: Deselect one artist
        console.log('\n4️⃣ Testing: Deselect Artist from Chat Session');
        const deselectResponse = await fetch(`${BASE_URL}/api/artists/deselect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_session_id: TEST_SESSION_ID,
            artist_name: TEST_ARTISTS[0]
          })
        });
        
        if (deselectResponse.ok) {
          const deselectData = await deselectResponse.json();
          console.log('✅ Deselect Artist Success:', deselectData);
          
          // Test 5: Final check of selected artists
          console.log('\n5️⃣ Testing: Final Check of Selected Artists');
          const finalCheckResponse = await fetch(`${BASE_URL}/api/artists/selected/${TEST_SESSION_ID}`);
          
          if (finalCheckResponse.ok) {
            const finalData = await finalCheckResponse.json();
            console.log('✅ Final Check Success:', finalData);
          } else {
            console.log('❌ Final Check Failed:', finalCheckResponse.status);
          }
          
        } else {
          console.log('❌ Deselect Artist Failed:', deselectResponse.status);
        }
        
      } else {
        console.log('❌ Get Selected Artists After Adding Failed:', getSelectedAfterResponse.status);
      }
      
    } else {
      console.log('❌ Select Artists Failed:', selectResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
  
  console.log('\n🏁 Roster Management API Tests Complete!');
}

// Run the tests
testRosterManagementAPIs();
