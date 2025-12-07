export type VeoModel =
  | 'veo-2.0-generate-001'
  | 'veo-3.0-generate-001'
  | 'veo-3.0-fast-generate-001'
  | 'veo-3.1-generate-preview'
  | 'veo-3.1-fast-generate-preview';

export type GenerationMode = 'text-to-video' | 'image-to-video' | 'video-extension' | 'frame-interpolation';
export type AspectRatio = '16:9' | '9:16';
export type Resolution = '720p' | '1080p';
export type Duration = 4 | 6 | 8;
export type PersonGeneration = 'dont_allow' | 'allow_adult' | 'allow_all';

export interface ReferenceImage {
  url: string;
}

export interface VideoGenerationRequest {
  model: VeoModel;
  mode: GenerationMode;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  duration: Duration;
  personGeneration?: PersonGeneration;
  // Image-to-Video: initial frame
  initialImage?: ReferenceImage;
  // Frame Interpolation: last frame
  finalImage?: ReferenceImage;
  // Reference images for guidance (up to 3)
  referenceImages?: ReferenceImage[];
  // Video Extension: URL of previous video to extend
  extendFromVideoUrl?: string;
}

export interface VideoGeneration {
  id: string;
  userId: string;
  request: VideoGenerationRequest;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  estimatedCost: number;
  actualCost?: number;
  error?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
}

export interface UserUsage {
  userId: string;
  totalGenerations: number;
  totalSpent: number;
  generationsByModel: Record<VeoModel, number>;
  spentByModel: Record<VeoModel, number>;
  lastGenerationAt?: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export const MODEL_PRICING: Record<VeoModel, number> = {
  'veo-2.0-generate-001': 0.40,
  'veo-3.0-generate-001': 0.40,
  'veo-3.1-generate-preview': 0.40,
  'veo-3.0-fast-generate-001': 0.15,
  'veo-3.1-fast-generate-preview': 0.15,
};
