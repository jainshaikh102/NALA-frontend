# Sources and Notes API Integration

## Overview
This implementation provides comprehensive API integration for the Add Sources modal with four different input options while preserving existing design and Google Drive functionality.

## Features Implemented

### 1. API Routes Created
- **`/api/rag/upload`** - Upload sources to RAG system
- **`/api/rag/list/[sessionId]`** - Get sources for chat session
- **`/api/rag/delete`** - Remove source from RAG system
- **`/api/notes/add`** - Add note to chat session
- **`/api/notes/[sessionId]`** - Get notes for chat session
- **`/api/notes/remove`** - Remove note from chat session

### 2. Custom Hooks
- **`useRAGSources(sessionId)`** - Manages RAG sources for chat sessions
- **`useNotes(sessionId)`** - Manages notes for chat sessions
- **`useFileUpload()`** - Handles file upload with GCS integration

### 3. Four Input Options

#### **1. 📁 File Upload (System Upload / Drag & Drop)**
- **Supported Types**: PDF, TXT, Markdown, Audio (MP3, WAV), Video (MP4, AVI, MOV)
- **Max Size**: 100MB
- **Flow**: Local File → Validate → Upload to GCS → Call `/rag/upload`
- **Features**: 
  - Drag & drop support
  - File type validation
  - Upload progress tracking
  - File size formatting

#### **2. 🔗 Google Drive Upload**
- **Integration**: Existing Google Drive connector preserved
- **Flow**: Google Drive Selection → Upload to GCS → Call `/rag/upload`
- **Features**: 
  - Seamless integration with existing functionality
  - Same API endpoint as file upload

#### **3. 🌐 Link Input**
- **Purpose**: Add website URLs as sources
- **Flow**: URL Input → Store in `gcs_url` → Call `/rag/upload`
- **Features**: 
  - Direct URL storage
  - Link validation
  - Same RAG integration

#### **4. 📝 Copy-Paste Text (Notes)**
- **Purpose**: Add text notes to chat sessions
- **Flow**: Text Input → Call `/notes/add`
- **Features**: 
  - Plain text support
  - Session-specific notes
  - Separate from RAG sources

## Technical Implementation

### API Request/Response Formats

#### RAG Upload
```json
// Request
{
  "gcs_url": "string",
  "file_name": "string", 
  "username": "string",
  "chat_session_id": "string"
}

// Response
["string"]
```

#### Notes Add
```json
// Request
{
  "chat_session_id": "string",
  "note_item": "string"
}

// Response
"string"
```

### State Management
- **Session-based**: Each chat session manages its own sources and notes
- **Real-time updates**: Optimistic UI updates with cache invalidation
- **Error handling**: Toast notifications and graceful fallbacks
- **Loading states**: Professional loading indicators throughout

### File Upload Integration
- **GCS Integration**: Mock implementation ready for actual GCS setup
- **Progress Tracking**: Real-time upload progress display
- **Validation**: File type and size validation
- **Error Handling**: Comprehensive error messages

## User Interface

### Add Sources Modal
- **Preserved Design**: Existing modal design maintained
- **Four Options**: Grid layout with clear icons and descriptions
- **Google Drive**: Existing integration preserved
- **New Options**: File upload, link input, and notes

### Sources Display
- **Session-aware**: Shows sources for current chat session
- **Real Data**: Uses API data instead of mock data
- **File Icons**: Dynamic file type icons
- **Remove Actions**: Delete functionality with confirmation

### Loading States
- **Upload Progress**: Progress bars for file uploads
- **API Calls**: Loading spinners during API operations
- **Empty States**: Helpful messages when no data

## Session Management

### Sources per Session
- **GET** `/rag/list/{chat_session_id}` - Fetch sources for session
- **POST** `/rag/upload` - Add source to session
- **POST** `/rag/delete` - Remove source from session

### Notes per Session
- **GET** `/notes/{chat_session_id}` - Fetch notes for session
- **POST** `/notes/add` - Add note to session
- **POST** `/notes/remove` - Remove note from session

## Error Handling

### Validation
- **File Types**: Only supported formats allowed
- **File Size**: 100MB maximum limit
- **Required Fields**: All required API fields validated

### User Feedback
- **Toast Notifications**: Success and error messages
- **Loading States**: Clear indication of ongoing operations
- **Error Recovery**: Graceful handling of API failures

## Integration Flow

### Complete User Journey
1. **User opens Add Sources modal**
2. **Selects input type** (File, Google Drive, Link, Notes)
3. **Provides input** (file, URL, or text)
4. **System processes** (upload to GCS if needed)
5. **API call made** (RAG or Notes endpoint)
6. **UI updates** (new source/note appears)
7. **Session data refreshed** (cache invalidated)

### Backward Compatibility
- **Existing Google Drive**: Fully preserved
- **Current Design**: No visual changes to modal
- **Previous Functionality**: All existing features maintained

## Files Modified
- `src/app/(dashboard)/chat/page.tsx` - Main chat interface
- `src/hooks/use-sources-notes.ts` - Sources and notes management
- `src/hooks/use-file-upload.ts` - File upload functionality
- `src/app/api/rag/upload/route.ts` - RAG upload endpoint
- `src/app/api/rag/list/[sessionId]/route.ts` - RAG list endpoint
- `src/app/api/rag/delete/route.ts` - RAG delete endpoint
- `src/app/api/notes/add/route.ts` - Notes add endpoint
- `src/app/api/notes/[sessionId]/route.ts` - Notes get endpoint
- `src/app/api/notes/remove/route.ts` - Notes remove endpoint

## Testing
- **Test Script**: `test-sources-notes-apis.js`
- **API Coverage**: All endpoints tested
- **Error Scenarios**: Validation and error handling
- **Integration Testing**: End-to-end flow verification

## Future Enhancements
- **Actual GCS Integration**: Replace mock upload with real GCS
- **File Preview**: Preview uploaded files
- **Batch Operations**: Multiple file uploads
- **Search**: Search through sources and notes
- **Categories**: Organize sources by type
