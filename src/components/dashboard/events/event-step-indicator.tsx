
'use client';

interface Step {
  id: string;
  name: string;
}

interface EventStepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function EventStepIndicator({ steps, currentStep }: EventStepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0 lg:flex-col lg:space-x-0 lg:space-y-4">
        {steps.map((step, index) => (
          <li key={step.name} className="md:flex-1 lg:flex-initial">
            {currentStep > index ? (
              <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors lg:border-l-4">
                <span className="text-sm font-medium text-primary transition-colors">{step.id}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : currentStep === index ? (
              <div className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 lg:border-l-4" aria-current="step">
                <span className="text-sm font-medium text-primary">{step.id}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : (
              <div className="group flex w-full flex-col border-l-4 border-border py-2 pl-4 transition-colors lg:border-l-4">
                <span className="text-sm font-medium text-muted-foreground transition-colors">{step.id}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
