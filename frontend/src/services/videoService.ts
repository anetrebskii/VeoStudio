import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from '@/config/firebase';
import { VideoGeneration, VideoGenerationRequest, UserUsage } from '@/types';
import { calculateEstimatedCost } from '@/utils/pricing';

export async function uploadReferenceImage(
  userId: string,
  file: File
): Promise<string> {
  const imageRef = ref(
    storage,
    `images/${userId}/${Date.now()}_${file.name}`
  );
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export async function createVideoGeneration(
  userId: string,
  request: VideoGenerationRequest
): Promise<string> {
  const estimatedCost = calculateEstimatedCost(
    request.model,
    request.duration
  ).estimatedCost;

  const generation: Omit<VideoGeneration, 'id'> = {
    userId,
    request,
    status: 'pending',
    estimatedCost,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, 'generations'), {
    ...generation,
    createdAt: Timestamp.fromDate(generation.createdAt),
    updatedAt: Timestamp.fromDate(generation.updatedAt),
  });

  const generateVideo = httpsCallable(functions, 'generateVideo');
  await generateVideo({ generationId: docRef.id });

  return docRef.id;
}

export async function getVideoGeneration(
  generationId: string
): Promise<VideoGeneration | null> {
  const docRef = doc(db, 'generations', generationId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    completedAt: data.completedAt?.toDate(),
  } as VideoGeneration;
}

export async function getUserGenerations(
  userId: string
): Promise<VideoGeneration[]> {
  const q = query(
    collection(db, 'generations'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      completedAt: data.completedAt?.toDate(),
    } as VideoGeneration;
  });
}

export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  const docRef = doc(db, 'usage', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    lastGenerationAt: data.lastGenerationAt?.toDate(),
    updatedAt: data.updatedAt.toDate(),
  } as UserUsage;
}
