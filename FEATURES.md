# Features Documentation

## Overview

This application provides a complete video generation platform using Google Veo 3 API with real-time cost tracking and user management.

## Veo 3 Models Supported

### 1. Veo 3.1 Preview (`veo-3.1-generate-preview`)
- **Cost**: $0.40 per second
- **Features**: Latest state-of-the-art model with all advanced features
- **Best for**: High-quality production videos
- **Capabilities**: Video extension, frame-specific generation, image-based direction

### 2. Veo 3.1 Fast Preview (`veo-3.1-fast-generate-preview`)
- **Cost**: $0.15 per second
- **Features**: Optimized for speed while maintaining quality
- **Best for**: Rapid testing, A/B testing, programmatic ad generation
- **Capabilities**: Same as Veo 3.1 but faster generation

### 3. Veo 3 (`veo-3.0-generate-001`)
- **Cost**: $0.40 per second
- **Features**: Stable release with native audio generation
- **Best for**: Production videos requiring audio
- **Capabilities**: Audio generation for dialogue, sound effects, ambient noise

### 4. Veo 3 Fast (`veo-3.0-fast-generate-001`)
- **Cost**: $0.15 per second
- **Features**: Faster variant of Veo 3
- **Best for**: Quick iterations with audio support

## Video Generation Options

### Basic Parameters

#### Prompt
- **Type**: Text (up to 1,024 tokens)
- **Description**: Describe the video you want to generate
- **Supports**: Audio cues for dialogue and sound effects
- **Example**: "A serene sunset over the ocean with waves crashing on the shore"

#### Negative Prompt (Optional)
- **Type**: Text
- **Description**: Specify what you don't want in the video
- **Example**: "no people, no text, no logos"

### Visual Settings

#### Aspect Ratio
- **Options**:
  - `16:9` - Landscape (default)
  - `9:16` - Portrait
- **Use Cases**:
  - 16:9: YouTube, presentations, web videos
  - 9:16: Instagram Stories, TikTok, mobile-first content

#### Resolution
- **Options**:
  - `720p` - HD (1280x720)
  - `1080p` - Full HD (1920x1080)
- **Note**: 1080p only supports 8-second duration
- **Default**: 720p

#### Duration
- **Options**: 4, 6, or 8 seconds
- **Frame Rate**: 24fps
- **Constraints**:
  - 8 seconds only available with reference images
  - 1080p limited to 8 seconds

### Advanced Settings

#### Person Generation
- **Options**:
  - `allow_adult` - Allow adult person generation
  - `dont_allow` - Don't generate people
- **Regional Restrictions**: EU, UK, CH, MENA regions restricted to `allow_adult` only
- **Default**: `allow_adult`

#### Reference Images (Future Enhancement)
- **Limit**: Up to 3 images
- **Purpose**: Provide visual guidance for video generation
- **Supported Formats**: JPEG, PNG
- **Max Size**: 10MB per image

#### Video Extension (Future Enhancement)
- **Capability**: Extend existing videos up to 7 additional seconds
- **Max Extensions**: 20 per video
- **Use Case**: Create longer narratives from initial generation

## Pricing Features

### Estimated Cost Calculator
- **Real-time Calculation**: Updates as you change model and duration
- **Display**: Shows price per second and total estimated cost
- **Formula**: `Cost = Price per Second × Duration`

### Actual Cost Tracking
- **Recorded After Generation**: Actual cost saved to database
- **Comparison**: Shows estimated vs actual cost for each generation
- **Accuracy**: Based on successful generation only (failed generations not charged)

### Usage Statistics

#### Total Metrics
- **Total Generations**: Count of all video generations
- **Total Spent**: Sum of all actual costs

#### Per-Model Breakdown
- **Generations by Model**: Count for each Veo model used
- **Spent by Model**: Total cost per model
- **Visual Display**: Bar chart showing usage distribution

## User Features

### Authentication
- **Method**: Email/Password via Firebase Auth
- **Custom UI**: Fully branded authentication experience
- **Security**: Firestore security rules enforce user isolation

### User Dashboard
- **Video Generator**: Create new videos with all Veo 3 options
- **Generation History**: View all past generations with status
- **Usage Stats**: Real-time spending and usage analytics
- **Video Downloads**: Download completed videos directly

### Generation Status Tracking
- **Pending**: Generation queued but not started
- **Processing**: Video actively being generated
- **Completed**: Video ready with download link
- **Failed**: Generation failed with error message

## Technical Features

### Real-time Updates
- **Auto-refresh**: Manual refresh button for latest data
- **Status Indicators**: Visual indicators for generation status
- **Live Pricing**: Instant cost calculation as options change

### Data Storage

#### Firestore Collections
- **users**: User profile data
- **generations**: Video generation records
- **usage**: Aggregated usage statistics

#### Cloud Storage
- **videos/{userId}/{generationId}.mp4**: Generated videos
- **images/{userId}/**: Reference images (future)
- **Retention**: Videos stored indefinitely
- **Access**: Private, user-specific access only

### Security
- **Authentication Required**: All operations require login
- **User Isolation**: Users can only access their own data
- **Firestore Rules**: Enforce data privacy at database level
- **Storage Rules**: Prevent unauthorized access to videos

## Performance

### Generation Times
- **Minimum**: 11 seconds
- **Maximum**: 6 minutes (during peak usage)
- **Average**: 30-60 seconds for standard generations

### Video Specifications
- **Format**: MP4
- **Frame Rate**: 24fps
- **Audio**: Native audio generation (Veo 3 models)
- **Watermarking**: SynthID technology applied automatically

## Limitations

### API Constraints
- **Server Retention**: Videos retained for 2 days on Google servers
- **Request Limit**: 1 video per request
- **Token Limit**: 1,024 tokens for text input

### Application Limits
- **File Upload**: 10MB max for reference images
- **Concurrent Generations**: One at a time per user (can be adjusted)

## Future Enhancements

### Planned Features
1. **Reference Image Upload**: UI for uploading and managing reference images
2. **Video Extension**: Extend existing videos directly from the UI
3. **Batch Generation**: Queue multiple videos
4. **Advanced Filters**: Search and filter generation history
5. **Export Options**: Different video formats and qualities
6. **Collaboration**: Share videos with team members
7. **API Access**: RESTful API for programmatic access
8. **Webhooks**: Real-time notifications for generation completion

### Optimization Opportunities
1. **Caching**: Cache frequently used prompts
2. **Compression**: Video compression options
3. **CDN**: Serve videos via CDN for faster delivery
4. **Background Jobs**: Queue system for large-scale generation

## Best Practices

### Cost Optimization
1. Use Fast models for testing and iteration
2. Start with 4-second duration, extend only if needed
3. Use 720p unless 1080p is required
4. Monitor usage statistics regularly

### Quality Optimization
1. Write detailed, specific prompts
2. Use negative prompts to avoid unwanted elements
3. Leverage reference images for consistent style
4. Test with Fast models before using Standard models

### Performance Optimization
1. Avoid peak hours when possible
2. Queue generations during off-peak times
3. Use appropriate resolution for use case
4. Keep prompts clear and concise
