
import React from 'react';
import { FormStep } from '../types';

interface Props {
  currentStep: FormStep;
  steps: FormStep[];
  onStepClick: (step: FormStep) => void;
}

export const StepIndicator: React.FC<Props> = ({ currentStep, steps, onStepClick }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center no-print">
      {steps.map((step) => {
        const isActive = step === currentStep;
        return (
          <button
            key={step}
            onClick={() => onStepClick(step)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'bg-white text-slate-500 hover:bg-rose-50 border border-slate-200'
            }`}
          >
            {step}
          </button>
        );
      })}
    </div>
  );
};
