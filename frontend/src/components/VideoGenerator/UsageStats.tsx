import React from 'react';
import { UserUsage, MODEL_LABELS } from '@/types';
import { formatCurrency } from '@/utils/pricing';
import { BarChart3, DollarSign, Video } from 'lucide-react';

interface UsageStatsProps {
  usage: UserUsage | null;
}

export function UsageStats({ usage }: UsageStatsProps) {
  if (!usage) {
    return (
      <div className="rounded-xl bg-dark-800 border border-dark-700 p-6">
        <p className="text-sm text-gray-400">
          No usage data available. Generate your first video to see statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-dark-800 border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
              <Video className="h-4 w-4 text-primary-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 mb-1">
            Total Videos
          </p>
          <p className="text-2xl font-bold text-white">
            {usage.totalGenerations}
          </p>
        </div>

        <div className="rounded-xl bg-dark-800 border border-dark-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(usage.totalSpent)}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-dark-800 border border-dark-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-primary-400" />
          <h3 className="text-sm font-semibold text-white">
            Usage by Model
          </h3>
        </div>

        <div className="space-y-3">
          {Object.entries(usage.generationsByModel || {}).map(
            ([model, count]) => {
              if (count === 0) return null;
              const spent = usage.spentByModel?.[model as keyof typeof usage.spentByModel] || 0;
              return (
                <div
                  key={model}
                  className="flex items-center justify-between border-b border-dark-700 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {MODEL_LABELS[model as keyof typeof MODEL_LABELS]}
                    </p>
                    <p className="text-xs text-gray-500">{count} generations</p>
                  </div>
                  <p className="text-sm font-semibold text-primary-400">
                    {formatCurrency(spent)}
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
