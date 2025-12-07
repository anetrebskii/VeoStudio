import * as admin from 'firebase-admin';
import { VeoModel, UserUsage } from '../types';

export async function updateUserUsage(
  userId: string,
  model: VeoModel,
  cost: number
): Promise<void> {
  const usageRef = admin.firestore().collection('usage').doc(userId);

  await admin.firestore().runTransaction(async (transaction) => {
    const usageDoc = await transaction.get(usageRef);

    if (!usageDoc.exists) {
      const newUsage: UserUsage = {
        userId,
        totalGenerations: 1,
        totalSpent: cost,
        generationsByModel: {
          'veo-3.0-generate-001': model === 'veo-3.0-generate-001' ? 1 : 0,
          'veo-3.0-fast-generate-001': model === 'veo-3.0-fast-generate-001' ? 1 : 0,
          'veo-3.1-generate-preview': model === 'veo-3.1-generate-preview' ? 1 : 0,
          'veo-3.1-fast-generate-preview': model === 'veo-3.1-fast-generate-preview' ? 1 : 0,
        },
        spentByModel: {
          'veo-3.0-generate-001': model === 'veo-3.0-generate-001' ? cost : 0,
          'veo-3.0-fast-generate-001': model === 'veo-3.0-fast-generate-001' ? cost : 0,
          'veo-3.1-generate-preview': model === 'veo-3.1-generate-preview' ? cost : 0,
          'veo-3.1-fast-generate-preview': model === 'veo-3.1-fast-generate-preview' ? cost : 0,
        },
        lastGenerationAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      };

      transaction.set(usageRef, newUsage);
    } else {
      transaction.update(usageRef, {
        totalGenerations: admin.firestore.FieldValue.increment(1),
        totalSpent: admin.firestore.FieldValue.increment(cost),
        [`generationsByModel.${model}`]: admin.firestore.FieldValue.increment(1),
        [`spentByModel.${model}`]: admin.firestore.FieldValue.increment(cost),
        lastGenerationAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }
  });
}
