// Simple test script to verify artist management API endpoints
// Run with: node test-artists-api.js

const BASE_URL = 'http://localhost:3001';
const TEST_USERNAME = 'testuser';

async function testArtistAPIs() {
  console.log('🧪 Testing Artist Management APIs...\n');

  try {
    // Test 1: Search for artists
    console.log('1️⃣ Testing: Search Artists');
    const searchResponse = await fetch(`${BASE_URL}/api/artists/search?limit=10`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search Artists Success:', searchData.length, 'artists found');
      
      if (searchData.length > 0) {
        const testArtist = searchData[0];
        console.log('📝 Test Artist:', testArtist);
        
        // Test 2: Add artist to roster
        console.log('\n2️⃣ Testing: Add Artist to Roster');
        const addResponse = await fetch(`${BASE_URL}/api/artists/user-roster`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: TEST_USERNAME,
            selected_artists: [testArtist]
          })
        });
        
        if (addResponse.ok) {
          const addData = await addResponse.json();
          console.log('✅ Add Artist Success:', addData);
          
          // Test 3: Get user roster
          console.log('\n3️⃣ Testing: Get User Roster');
          const rosterResponse = await fetch(`${BASE_URL}/api/artists/user-roster/${TEST_USERNAME}`);
          
          if (rosterResponse.ok) {
            const rosterData = await rosterResponse.json();
            console.log('✅ Get Roster Success:', rosterData.length, 'artists in roster');
            
            // Test 4: Remove artist from roster
            console.log('\n4️⃣ Testing: Remove Artist from Roster');
            const removeResponse = await fetch(`${BASE_URL}/api/artists/user-roster/remove?username=${TEST_USERNAME}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(testArtist)
            });
            
            if (removeResponse.ok) {
              const removeData = await removeResponse.json();
              console.log('✅ Remove Artist Success:', removeData);
            } else {
              console.log('❌ Remove Artist Failed:', removeResponse.status);
            }
            
          } else {
            console.log('❌ Get Roster Failed:', rosterResponse.status);
          }
          
        } else {
          console.log('❌ Add Artist Failed:', addResponse.status);
        }
      }
      
    } else {
      console.log('❌ Search Artists Failed:', searchResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
  
  console.log('\n🏁 Artist Management API Tests Complete!');
}

// Run the tests
testArtistAPIs();
