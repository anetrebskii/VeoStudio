import React from 'react';
import { PricingInfo } from '@/types';
import { formatCurrency } from '@/utils/pricing';
import { DollarSign } from 'lucide-react';

interface PricingDisplayProps {
  pricingInfo: PricingInfo;
}

export function PricingDisplay({ pricingInfo }: PricingDisplayProps) {
  return (
    <div className="rounded-xl bg-primary-500/10 border border-primary-500/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-primary-400" />
        <h3 className="text-base font-semibold text-white">
          Estimated Cost
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price per second:</span>
          <span className="font-medium text-gray-200">
            {formatCurrency(pricingInfo.pricePerSecond)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Duration:</span>
          <span className="font-medium text-gray-200">
            {pricingInfo.duration} seconds
          </span>
        </div>
        <div className="border-t border-primary-500/20 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-white">
              Total:
            </span>
            <span className="text-2xl font-bold text-primary-400">
              {formatCurrency(pricingInfo.estimatedCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
