# Image and Video Generation Integration

## Overview

This implementation adds image and video generation capabilities to the existing chat interface, allowing users to generate visual content based on text prompts.

## Features Implemented

### 1. API Routes

- **`/api/generate-image`** - Generates images from text prompts
- **`/api/show-image`** - Displays generated images
- **`/api/generate-video`** - Generates videos from text prompts

### 2. Custom Hooks

- **`useImageGeneration()`** - Manages image generation and display
- **`useVideoGeneration()`** - Manages video generation

### 3. User Interface Integration

#### Generation Selection

- Users can select generation type using the existing "StickWithStart" popover
- Options: Generate Image, Generate Video, or None (default chat)
- Visual badges show selected generation type

#### Input Handling

- Single input field for all prompts (chat, image, video)
- Smart form submission based on selected generation type
- Loading states during generation processes

#### Content Display

- **User prompts displayed in chat** - Generation requests appear as user messages
- Generated images displayed as base64-encoded images
- Generated videos displayed with HTML5 video player
- Loading indicators during generation
- Timestamps and metadata for generated content

#### UI Cleanup

- **Removed frequently asked questions** - Pre-question badges no longer appear
- **Cleaner chat interface** - Focus on user input and generated content

## User Flow

### Image Generation

1. User clicks "StickWithStart" icon
2. Selects "Generate Image" from popover
3. Types image prompt in input field
4. Clicks send button
5. **User prompt appears in chat as a message**
6. System calls `/api/generate-image` with prompt, session ID, and username
7. On success, automatically calls `/api/show-image` to display
8. Image appears in chat messages area

### Video Generation

1. User clicks "StickWithStart" icon
2. Selects "Generate Video" from popover
3. Types video prompt in input field
4. Clicks send button
5. **User prompt appears in chat as a message**
6. System calls `/api/generate-video` with prompt, 8-second duration, session ID, and username
7. Video player appears in chat messages area with controls

### Default Chat

- If no generation type is selected, falls back to normal chat behavior
- Calls existing `execute_chat` API as before

## Technical Implementation

### API Request Formats

#### Generate Image

```json
{
  "prompt": "string",
  "chat_session_id": "string",
  "username": "string"
}
```

#### Generate Video

```json
{
  "prompt": "string",
  "duration_seconds": 8,
  "chat_session_id": "string",
  "username": "string"
}
```

### Response Handling

- Image responses include base64-encoded image data
- Video responses include video URL and metadata
- Error handling with toast notifications
- Loading states prevent multiple submissions

### UI States

- **Loading**: Spinner and disabled inputs during generation
- **Success**: Content displayed in chat messages area
- **Error**: Toast notifications with error messages
- **Empty**: Default chat behavior when no generation type selected

## Files Modified

- `src/app/(dashboard)/chat/page.tsx` - Main chat interface
- `src/hooks/use-generation.ts` - Generation hooks
- `src/app/api/generate-image/route.ts` - Image generation API
- `src/app/api/show-image/route.ts` - Image display API
- `src/app/api/generate-video/route.ts` - Video generation API

## Testing

- Test script: `test-generation-apis.js`
- Manual testing via chat interface
- Error handling verification

## Future Enhancements

- Persistent generation history
- Generation settings (image size, video duration)
- Batch generation capabilities
- Generation templates and presets
