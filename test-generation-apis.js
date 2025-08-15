// Simple test script to verify image and video generation API endpoints
// Run with: node test-generation-apis.js

const BASE_URL = 'http://localhost:3001';
const TEST_PROMPT = 'A beautiful sunset over mountains';
const TEST_USERNAME = 'testuser';
const TEST_SESSION_ID = 'test-session-123';

async function testGenerationAPIs() {
  console.log('🧪 Testing Image and Video Generation APIs...\n');

  try {
    // Test 1: Generate Image
    console.log('1️⃣ Testing: Generate Image');
    const generateImageResponse = await fetch(`${BASE_URL}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: TEST_PROMPT,
        chat_session_id: TEST_SESSION_ID,
        username: TEST_USERNAME
      })
    });
    
    if (generateImageResponse.ok) {
      const imageData = await generateImageResponse.json();
      console.log('✅ Generate Image Success:', {
        success: imageData.success,
        message: imageData.message,
        request_id: imageData.request_id,
        has_base64_image: !!imageData.base64_image,
        base64_length: imageData.base64_image ? imageData.base64_image.length : 0
      });
      
      // Test 2: Show Image (if we got a base64 image)
      if (imageData.base64_image) {
        console.log('\n2️⃣ Testing: Show Image');
        const showImageResponse = await fetch(`${BASE_URL}/api/show-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64_image: imageData.base64_image
          })
        });
        
        if (showImageResponse.ok) {
          const showData = await showImageResponse.json();
          console.log('✅ Show Image Success:', showData);
        } else {
          console.log('❌ Show Image Failed:', showImageResponse.status);
        }
      }
      
    } else {
      console.log('❌ Generate Image Failed:', generateImageResponse.status);
    }
    
    // Test 3: Generate Video
    console.log('\n3️⃣ Testing: Generate Video');
    const generateVideoResponse = await fetch(`${BASE_URL}/api/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: TEST_PROMPT,
        duration_seconds: 8,
        chat_session_id: TEST_SESSION_ID,
        username: TEST_USERNAME
      })
    });
    
    if (generateVideoResponse.ok) {
      const videoData = await generateVideoResponse.json();
      console.log('✅ Generate Video Success:', {
        status: videoData.status,
        video_url: videoData.video_url,
        duration: videoData.duration,
        generated_at: videoData.generated_at,
        request_id: videoData.request_id
      });
    } else {
      console.log('❌ Generate Video Failed:', generateVideoResponse.status);
    }
    
  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
  
  console.log('\n🏁 Generation API Tests Complete!');
}

// Run the tests
testGenerationAPIs();
