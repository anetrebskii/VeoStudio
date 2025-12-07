import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { generateVideo, downloadAndUploadVideo } from './services/veoService';
import { updateUserUsage } from './services/usageService';
import { VideoGeneration } from './types';

admin.initializeApp();

export const generateVideoFunction = onCall(
  {
    region: 'europe-west10',
    timeoutSeconds: 540,
    memory: '1GiB',
  },
  async (request) => {
    const { auth, data } = request;
    if (!auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { generationId } = data;

    if (!generationId) {
      throw new HttpsError(
        'invalid-argument',
        'Generation ID is required'
      );
    }

    const generationRef = admin
      .firestore()
      .collection('generations')
      .doc(generationId);

    try {
      const generationDoc = await generationRef.get();

      if (!generationDoc.exists) {
        throw new HttpsError(
          'not-found',
          'Generation not found'
        );
      }

      const generation = generationDoc.data() as VideoGeneration;

      if (generation.userId !== auth.uid) {
        throw new HttpsError(
          'permission-denied',
          'Not authorized to access this generation'
        );
      }

      // Fetch user's API key from their settings
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(auth.uid)
        .get();

      const userData = userDoc.data();
      const userApiKey = userData?.veoApiKey;

      if (!userApiKey && !process.env.GOOGLE_AI_API_KEY) {
        throw new HttpsError(
          'failed-precondition',
          'No API key configured. Please add your Google AI API key in settings.'
        );
      }

      await generationRef.update({
        status: 'processing',
        updatedAt: admin.firestore.Timestamp.now(),
      });

      const result = await generateVideo(generation.request, userApiKey);

      const permanentVideoUrl = await downloadAndUploadVideo(
        result.videoUrl,
        admin.storage(),
        generation.userId,
        generationId
      );

      await generationRef.update({
        status: 'completed',
        videoUrl: permanentVideoUrl,
        actualCost: result.actualCost,
        completedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });

      await updateUserUsage(
        generation.userId,
        generation.request.model,
        result.actualCost
      );

      return {
        success: true,
        videoUrl: permanentVideoUrl,
        actualCost: result.actualCost,
      };
    } catch (error: any) {
      console.error('Error generating video:', error);

      await generationRef.update({
        status: 'failed',
        error: error.message || 'Failed to generate video',
        updatedAt: admin.firestore.Timestamp.now(),
      });

      throw new HttpsError(
        'internal',
        error.message || 'Failed to generate video'
      );
    }
  }
);

export { generateVideoFunction as generateVideo };
