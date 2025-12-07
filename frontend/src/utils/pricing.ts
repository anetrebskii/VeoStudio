import { MODEL_PRICING, PricingInfo, VeoModel, Duration } from '@/types';

export function calculateEstimatedCost(
  model: VeoModel,
  duration: Duration
): PricingInfo {
  const pricePerSecond = MODEL_PRICING[model];
  const estimatedCost = pricePerSecond * duration;

  return {
    model,
    pricePerSecond,
    estimatedCost,
    duration,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0
    ? `${minutes}m ${remainingSeconds}s`
    : `${minutes}m`;
}
