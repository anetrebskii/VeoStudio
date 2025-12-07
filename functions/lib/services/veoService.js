"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVideo = generateVideo;
exports.downloadAndUploadVideo = downloadAndUploadVideo;
const generative_ai_1 = require("@google/generative-ai");
const types_1 = require("../types");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
async function generateVideo(request) {
    const model = genAI.getGenerativeModel({ model: request.model });
    const generationConfig = {
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
    const parts = [{ text: request.prompt }];
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
    const videoPart = candidate.content.parts.find((part) => part.videoData);
    if (!videoPart || !videoPart.videoData) {
        throw new Error('No video data in response');
    }
    const videoUrl = videoPart.videoData.uri || videoPart.videoData.url;
    if (!videoUrl) {
        throw new Error('No video URL in response');
    }
    const pricePerSecond = types_1.MODEL_PRICING[request.model];
    const actualCost = pricePerSecond * request.duration;
    return {
        videoUrl,
        actualCost,
    };
}
async function downloadAndUploadVideo(videoUrl, storage, userId, generationId) {
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
//# sourceMappingURL=veoService.js.map