import { VideoGeneration, MODEL_LABELS } from '@/types';
import { formatCurrency } from '@/utils/pricing';
import { format } from 'date-fns';
import { Download, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface GenerationsListProps {
  generations: VideoGeneration[];
}

export function GenerationsList({ generations }: GenerationsListProps) {
  if (generations.length === 0) {
    return (
      <div className="rounded-xl bg-dark-800 border border-dark-700 p-8 text-center">
        <p className="text-gray-400">
          No video generations yet. Create your first video above!
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: VideoGeneration['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-400" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-primary-400 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusText = (status: VideoGeneration['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-4">
      {generations.map((generation) => (
        <div
          key={generation.id}
          className="rounded-xl bg-dark-800 border border-dark-700 p-6 hover:border-dark-600 transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(generation.status)}
                <span className="text-sm font-medium text-white">
                  {getStatusText(generation.status)}
                </span>
                <span className="text-xs text-gray-500">
                  {format(generation.createdAt, 'PPpp')}
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {generation.request.prompt}
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 px-3 py-1">
                  {MODEL_LABELS[generation.request.model]}
                </span>
                <span className="rounded-full bg-dark-700 text-gray-300 border border-dark-600 px-3 py-1">
                  {generation.request.aspectRatio}
                </span>
                <span className="rounded-full bg-dark-700 text-gray-300 border border-dark-600 px-3 py-1">
                  {generation.request.resolution}
                </span>
                <span className="rounded-full bg-dark-700 text-gray-300 border border-dark-600 px-3 py-1">
                  {generation.request.duration}s
                </span>
              </div>
            </div>

            <div className="ml-4 text-right">
              <p className="text-xs text-gray-500">Estimated</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(generation.estimatedCost)}
              </p>
              {generation.actualCost !== undefined && (
                <>
                  <p className="text-xs text-gray-500 mt-2">Actual</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatCurrency(generation.actualCost)}
                  </p>
                </>
              )}
            </div>
          </div>

          {generation.error && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{generation.error}</p>
            </div>
          )}

          {generation.status === 'completed' && generation.videoUrl && (
            <div className="mt-4 space-y-3">
              <video
                src={generation.videoUrl}
                controls
                className="w-full rounded-lg bg-dark-950"
              />
              <a
                href={generation.videoUrl}
                download
                className="button-primary inline-flex items-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Download Video
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
