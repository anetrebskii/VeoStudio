import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  VeoModel,
  GenerationMode,
  AspectRatio,
  Resolution,
  Duration,
  PersonGeneration,
  VideoGenerationRequest,
  MODEL_LABELS,
  ASPECT_RATIOS,
  RESOLUTIONS,
  DURATIONS,
} from '@/types';
import { calculateEstimatedCost, formatCurrency } from '@/utils/pricing';
import { PricingDisplay } from './PricingDisplay';

interface GeneratorFormProps {
  onSubmit: (request: VideoGenerationRequest) => Promise<void>;
  loading?: boolean;
}

const GENERATION_MODES: { value: GenerationMode; label: string; description: string }[] = [
  { value: 'text-to-video', label: 'Text-to-Video', description: 'Generate video from text prompt' },
  { value: 'image-to-video', label: 'Image-to-Video', description: 'Animate from an initial image' },
  { value: 'video-extension', label: 'Video Extension', description: 'Extend a previous video by up to 7s' },
  { value: 'frame-interpolation', label: 'Frame Interpolation', description: 'Generate video between two frames' },
];

export function GeneratorForm({ onSubmit, loading }: GeneratorFormProps) {
  const [selectedModel, setSelectedModel] = useState<VeoModel>(
    'veo-3.1-fast-generate-preview'
  );
  const [selectedDuration, setSelectedDuration] = useState<Duration>(4);
  const [selectedMode, setSelectedMode] = useState<GenerationMode>('text-to-video');
  const [initialImageFile, setInitialImageFile] = useState<File | null>(null);
  const [finalImageFile, setFinalImageFile] = useState<File | null>(null);
  const [referenceImageFiles, setReferenceImageFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VideoGenerationRequest>({
    defaultValues: {
      model: 'veo-3.1-fast-generate-preview',
      mode: 'text-to-video',
      aspectRatio: '16:9',
      resolution: '720p',
      duration: 4,
      personGeneration: 'allow_adult',
    },
  });

  const watchedModel = watch('model');
  const watchedDuration = watch('duration');
  const watchedMode = watch('mode');
  const watchedResolution = watch('resolution');

  React.useEffect(() => {
    setSelectedModel(watchedModel);
    setSelectedDuration(watchedDuration);
    setSelectedMode(watchedMode);
  }, [watchedModel, watchedDuration, watchedMode]);

  // Auto-adjust resolution if 1080p is selected but duration is not 8s
  React.useEffect(() => {
    if (watchedResolution === '1080p' && watchedDuration !== 8) {
      setValue('resolution', '720p');
    }
  }, [watchedDuration, watchedResolution, setValue]);

  const pricingInfo = calculateEstimatedCost(selectedModel, selectedDuration);

  const handleFormSubmit = async (data: VideoGenerationRequest) => {
    // Handle file uploads
    const formData = { ...data };

    if (initialImageFile) {
      formData.initialImage = {
        url: URL.createObjectURL(initialImageFile),
        file: initialImageFile,
      };
    }

    if (finalImageFile) {
      formData.finalImage = {
        url: URL.createObjectURL(finalImageFile),
        file: finalImageFile,
      };
    }

    if (referenceImageFiles.length > 0) {
      formData.referenceImages = referenceImageFiles.map(file => ({
        url: URL.createObjectURL(file),
        file,
      }));
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Generation Mode
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GENERATION_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-dark-700 transition-colors ${
                watchedMode === mode.value
                  ? 'border-primary-500 bg-dark-700'
                  : 'border-gray-700'
              }`}
            >
              <input
                type="radio"
                {...register('mode', { required: 'Generation mode is required' })}
                value={mode.value}
                className="sr-only"
              />
              <div className="flex flex-col">
                <span className="block text-sm font-medium text-gray-200">
                  {mode.label}
                </span>
                <span className="mt-1 text-xs text-gray-400">
                  {mode.description}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.mode && (
          <p className="mt-2 text-sm text-red-400">{errors.mode.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="model"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Model
        </label>
        <select
          {...register('model', { required: 'Model is required' })}
          id="model"
          className="input-field block w-full appearance-none"
        >
          <option value="veo-3.1-fast-generate-preview" className="bg-dark-800">
            {MODEL_LABELS['veo-3.1-fast-generate-preview']} - {formatCurrency(0.15)}/sec
          </option>
          <option value="veo-3.1-generate-preview" className="bg-dark-800">
            {MODEL_LABELS['veo-3.1-generate-preview']} - {formatCurrency(0.40)}/sec
          </option>
          <option value="veo-3.0-fast-generate-001" className="bg-dark-800">
            {MODEL_LABELS['veo-3.0-fast-generate-001']} - {formatCurrency(0.15)}/sec
          </option>
          <option value="veo-3.0-generate-001" className="bg-dark-800">
            {MODEL_LABELS['veo-3.0-generate-001']} - {formatCurrency(0.40)}/sec
          </option>
          <option value="veo-2.0-generate-001" className="bg-dark-800">
            {MODEL_LABELS['veo-2.0-generate-001']} - {formatCurrency(0.40)}/sec
          </option>
        </select>
        {errors.model && (
          <p className="mt-2 text-sm text-red-400">{errors.model.message}</p>
        )}
      </div>

      {/* Image Upload for Image-to-Video */}
      {watchedMode === 'image-to-video' && (
        <div>
          <label
            htmlFor="initialImage"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Initial Frame Image <span className="text-red-400">*</span>
          </label>
          <input
            type="file"
            id="initialImage"
            accept="image/*"
            onChange={(e) => setInitialImageFile(e.target.files?.[0] || null)}
            className="input-field block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-primary-600 file:text-white
              hover:file:bg-primary-700 file:cursor-pointer"
          />
          <p className="mt-2 text-xs text-gray-500">
            Upload an image to use as the first frame of your video
          </p>
        </div>
      )}

      {/* Frame Interpolation Images */}
      {watchedMode === 'frame-interpolation' && (
        <>
          <div>
            <label
              htmlFor="initialImage"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              First Frame Image <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              id="initialImage"
              accept="image/*"
              onChange={(e) => setInitialImageFile(e.target.files?.[0] || null)}
              className="input-field block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary-600 file:text-white
                hover:file:bg-primary-700 file:cursor-pointer"
            />
          </div>
          <div>
            <label
              htmlFor="finalImage"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Last Frame Image <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              id="finalImage"
              accept="image/*"
              onChange={(e) => setFinalImageFile(e.target.files?.[0] || null)}
              className="input-field block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary-600 file:text-white
                hover:file:bg-primary-700 file:cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-500">
              Upload first and last frame images. The video will be generated between them.
            </p>
          </div>
        </>
      )}

      {/* Video Extension URL */}
      {watchedMode === 'video-extension' && (
        <div>
          <label
            htmlFor="extendFromVideoUrl"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Video URL to Extend <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            {...register('extendFromVideoUrl', {
              required: watchedMode === 'video-extension' ? 'Video URL is required for extension' : false,
            })}
            id="extendFromVideoUrl"
            placeholder="https://example.com/video.mp4"
            className="input-field block w-full"
          />
          <p className="mt-2 text-xs text-gray-500">
            Extend a previously generated Veo video by up to 7 seconds (repeatable up to 20 times)
          </p>
          {errors.extendFromVideoUrl && (
            <p className="mt-2 text-sm text-red-400">{errors.extendFromVideoUrl.message}</p>
          )}
        </div>
      )}

      {/* Reference Images (for all modes) */}
      <div>
        <label
          htmlFor="referenceImages"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Reference Images (Optional, up to 3)
        </label>
        <input
          type="file"
          id="referenceImages"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []).slice(0, 3);
            setReferenceImageFiles(files);
          }}
          className="input-field block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-primary-600 file:text-white
            hover:file:bg-primary-700 file:cursor-pointer"
        />
        <p className="mt-2 text-xs text-gray-500">
          Guide visual content and preserve subject appearance (max 3 images)
        </p>
        {referenceImageFiles.length > 0 && (
          <p className="mt-2 text-xs text-primary-400">
            {referenceImageFiles.length} image(s) selected
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {watchedMode === 'text-to-video' ? 'Video Description' : 'Animation Prompt'} <span className="text-red-400">*</span>
        </label>
        <textarea
          {...register('prompt', {
            required: 'Prompt is required',
            maxLength: {
              value: 1024,
              message: 'Prompt must be less than 1024 characters',
            },
          })}
          id="prompt"
          rows={4}
          placeholder={
            watchedMode === 'text-to-video'
              ? `Describe your video with subject, action, style, and camera work.

Examples:
- A serene forest at dawn with morning mist. "Good morning, nature lovers," whispers the narrator. Gentle bird chirps in the background. The camera slowly pans right revealing a deer.
- A futuristic city at night. Neon lights reflect off wet streets. "Welcome to Neo Tokyo," announces a female voice. Electronic ambient music plays. Camera tilts up to reveal towering skyscrapers.`
              : `Describe how to animate the image...

Examples:
- The camera slowly zooms in as gentle breeze moves the leaves
- Character turns their head and smiles at the camera. "Hello there!" they say warmly.
- Ocean waves crash against the shore with sound of seagulls overhead`
          }
          className="input-field block w-full resize-none"
        />
        {errors.prompt && (
          <p className="mt-2 text-sm text-red-400">{errors.prompt.message}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          💡 Tip: Include quoted dialogue for speech, describe sound effects in plain text, and mention ambient sounds for richer audio generation
        </p>
      </div>

      <div>
        <label
          htmlFor="negativePrompt"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Negative Prompt (Optional)
        </label>
        <textarea
          {...register('negativePrompt')}
          id="negativePrompt"
          rows={2}
          placeholder="Describe what you don't want in the video..."
          className="input-field block w-full resize-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="aspectRatio"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Aspect Ratio
          </label>
          <select
            {...register('aspectRatio')}
            id="aspectRatio"
            className="input-field block w-full appearance-none"
          >
            {ASPECT_RATIOS.map((ratio) => (
              <option key={ratio} value={ratio} className="bg-dark-800">
                {ratio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="resolution"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Resolution
          </label>
          <select
            {...register('resolution')}
            id="resolution"
            className="input-field block w-full appearance-none"
          >
            {RESOLUTIONS.map((res) => (
              <option
                key={res}
                value={res}
                className="bg-dark-800"
                disabled={res === '1080p' && watchedDuration !== 8}
              >
                {res}{res === '1080p' ? ' (8s only)' : ' (default)'}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            1080p resolution is only available with 8-second duration. All videos are 24fps with native audio.
          </p>
        </div>

        <div>
          <label
            htmlFor="duration"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Duration
          </label>
          <select
            {...register('duration', { valueAsNumber: true })}
            id="duration"
            className="input-field block w-full appearance-none"
          >
            {DURATIONS.map((dur) => (
              <option key={dur} value={dur} className="bg-dark-800">
                {dur}s
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="personGeneration"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Person Generation
        </label>
        <select
          {...register('personGeneration')}
          id="personGeneration"
          className="input-field block w-full appearance-none"
        >
          <option value="allow_adult" className="bg-dark-800">Allow Adult</option>
          <option value="allow_all" className="bg-dark-800">Allow All</option>
          <option value="dont_allow" className="bg-dark-800">Don't Allow</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">
          EU, UK, CH, MENA regions may restrict to 'allow_adult' only
        </p>
      </div>

      <PricingDisplay pricingInfo={pricingInfo} />

      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Video'
        )}
      </button>
    </form>
  );
}
