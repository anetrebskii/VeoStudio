import { GoogleGenerativeAI } from '@google/generative-ai';
import { VideoGenerationRequest, MODEL_PRICING } from '../types';

export interface VeoGenerationResult {
  videoUrl: string;
  actualCost: number;
}

export async function generateVideo(
  request: VideoGenerationRequest,
  apiKey?: string
): Promise<VeoGenerationResult> {
  // Use user's API key if provided, otherwise fall back to environment variable
  const genAI = new GoogleGenerativeAI(apiKey || process.env.GOOGLE_AI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: request.model });

  const generationConfig: Record<string, any> = {
    aspectRatio: request.aspectRatio,
    resolution: request.resolution === '720p' ? 720 : 1080,
    duration: request.duration,
  };

  if (request.personGeneration) {
    generationConfig.personGeneration = request.personGeneration;
  }

  if (request.negativePrompt) {
    generationConfig.negativePrompt = request.negativePrompt;
  }

  const parts: any[] = [{ text: request.prompt }];

  if (request.referenceImages && request.referenceImages.length > 0) {
    for (const refImage of request.referenceImages) {
      const imageResponse = await fetch(refImage.url);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image,
        },
      });
    }
  }

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig,
  });

  const response = result.response;

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No video generated');
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('No video content in response');
  }

  const videoPart = candidate.content.parts.find((part: any) => (part as any).videoData);

  if (!videoPart || !(videoPart as any).videoData) {
    throw new Error('No video data in response');
  }

  const videoUrl = (videoPart as any).videoData.uri || (videoPart as any).videoData.url;

  if (!videoUrl) {
    throw new Error('No video URL in response');
  }

  const pricePerSecond = MODEL_PRICING[request.model];
  const actualCost = pricePerSecond * request.duration;

  return {
    videoUrl,
    actualCost,
  };
}

export async function downloadAndUploadVideo(
  videoUrl: string,
  storage: any,
  userId: string,
  generationId: string
): Promise<string> {
  const response = await fetch(videoUrl);
  const buffer = await response.arrayBuffer();

  const bucket = storage.bucket();
  const fileName = `videos/${userId}/${generationId}.mp4`;
  const file = bucket.file(fileName);

  await file.save(Buffer.from(buffer), {
    metadata: {
      contentType: 'video/mp4',
    },
  });

  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}
