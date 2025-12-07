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
  file?: File;
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
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface UserUsage {
  userId: string;
  totalGenerations: number;
  totalSpent: number;
  generationsByModel: Record<VeoModel, number>;
  spentByModel: Record<VeoModel, number>;
  lastGenerationAt?: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  veoApiKey?: string;
  createdAt: Date;
  usage?: UserUsage;
}

export interface PricingInfo {
  model: VeoModel;
  pricePerSecond: number;
  estimatedCost: number;
  duration: number;
}

export const MODEL_PRICING: Record<VeoModel, number> = {
  'veo-2.0-generate-001': 0.40,
  'veo-3.0-generate-001': 0.40,
  'veo-3.1-generate-preview': 0.40,
  'veo-3.0-fast-generate-001': 0.15,
  'veo-3.1-fast-generate-preview': 0.15,
};

export const MODEL_LABELS: Record<VeoModel, string> = {
  'veo-2.0-generate-001': 'Veo 2 (Legacy - Silent)',
  'veo-3.0-generate-001': 'Veo 3 (Standard)',
  'veo-3.1-generate-preview': 'Veo 3.1 (Preview)',
  'veo-3.0-fast-generate-001': 'Veo 3 Fast',
  'veo-3.1-fast-generate-preview': 'Veo 3.1 Fast (Preview)',
};

export const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16'];
export const RESOLUTIONS: Resolution[] = ['720p', '1080p'];
export const DURATIONS: Duration[] = [4, 6, 8];
