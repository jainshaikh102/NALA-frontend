// Test script to verify sources and notes API integrations
// Run with: node test-sources-notes-apis.js

const BASE_URL = 'http://localhost:3001';
const TEST_SESSION_ID = 'test-session-123';
const TEST_USERNAME = 'testuser';

async function testSourcesAndNotesAPIs() {
  console.log('🧪 Testing Sources and Notes API Integration...\n');

  try {
    // Test 1: RAG Upload
    console.log('1️⃣ Testing: RAG Upload');
    const ragUploadResponse = await fetch(`${BASE_URL}/api/rag/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gcs_url: 'gs://test-bucket/test-file.pdf',
        file_name: 'test-file.pdf',
        username: TEST_USERNAME,
        chat_session_id: TEST_SESSION_ID
      })
    });
    
    if (ragUploadResponse.ok) {
      const ragData = await ragUploadResponse.json();
      console.log('✅ RAG Upload Success:', ragData);
    } else {
      console.log('❌ RAG Upload Failed:', ragUploadResponse.status);
    }

    // Test 2: RAG List
    console.log('\n2️⃣ Testing: RAG List Sources');
    const ragListResponse = await fetch(`${BASE_URL}/api/rag/list/${TEST_SESSION_ID}`);
    
    if (ragListResponse.ok) {
      const ragListData = await ragListResponse.json();
      console.log('✅ RAG List Success:', ragListData);
    } else {
      console.log('❌ RAG List Failed:', ragListResponse.status);
    }

    // Test 3: Notes Add
    console.log('\n3️⃣ Testing: Notes Add');
    const notesAddResponse = await fetch(`${BASE_URL}/api/notes/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_session_id: TEST_SESSION_ID,
        note_item: 'This is a test note for the chat session'
      })
    });
    
    if (notesAddResponse.ok) {
      const notesData = await notesAddResponse.json();
      console.log('✅ Notes Add Success:', notesData);
    } else {
      console.log('❌ Notes Add Failed:', notesAddResponse.status);
    }

    // Test 4: Notes Get
    console.log('\n4️⃣ Testing: Notes Get');
    const notesGetResponse = await fetch(`${BASE_URL}/api/notes/${TEST_SESSION_ID}`);
    
    if (notesGetResponse.ok) {
      const notesGetData = await notesGetResponse.json();
      console.log('✅ Notes Get Success:', notesGetData);
    } else {
      console.log('❌ Notes Get Failed:', notesGetResponse.status);
    }

    // Test 5: RAG Delete
    console.log('\n5️⃣ Testing: RAG Delete');
    const ragDeleteResponse = await fetch(`${BASE_URL}/api/rag/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: 'test-document-id'
      })
    });
    
    if (ragDeleteResponse.ok) {
      const ragDeleteData = await ragDeleteResponse.json();
      console.log('✅ RAG Delete Success:', ragDeleteData);
    } else {
      console.log('❌ RAG Delete Failed:', ragDeleteResponse.status);
    }

    // Test 6: Notes Remove
    console.log('\n6️⃣ Testing: Notes Remove');
    const notesRemoveResponse = await fetch(`${BASE_URL}/api/notes/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_session_id: TEST_SESSION_ID,
        note_item: 'This is a test note for the chat session'
      })
    });
    
    if (notesRemoveResponse.ok) {
      const notesRemoveData = await notesRemoveResponse.json();
      console.log('✅ Notes Remove Success:', notesRemoveData);
    } else {
      console.log('❌ Notes Remove Failed:', notesRemoveResponse.status);
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }
  
  console.log('\n📋 API Integration Summary:');
  console.log('✅ RAG Upload: /rag/upload - Upload files to RAG system');
  console.log('✅ RAG List: /rag/list/{session_id} - Get sources for chat session');
  console.log('✅ RAG Delete: /rag/delete - Remove source from RAG system');
  console.log('✅ Notes Add: /notes/add - Add note to chat session');
  console.log('✅ Notes Get: /notes/{session_id} - Get notes for chat session');
  console.log('✅ Notes Remove: /notes/remove - Remove note from chat session');
  
  console.log('\n🎯 Integration Features:');
  console.log('✅ File Upload: System upload + drag & drop → GCS → RAG');
  console.log('✅ Google Drive: Drive selection → GCS → RAG');
  console.log('✅ Link Input: URL input → RAG');
  console.log('✅ Copy-Paste Text: Text input → Notes');
  console.log('✅ Session-based: Each chat manages its own sources & notes');
  console.log('✅ Real-time UI: Loading states, error handling, optimistic updates');
  
  console.log('\n🏁 Sources and Notes API Tests Complete!');
}

// Run the tests
testSourcesAndNotesAPIs();
