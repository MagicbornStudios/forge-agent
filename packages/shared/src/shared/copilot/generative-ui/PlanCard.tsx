import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '@forge/ui/button';

export interface PlanStepItem {
  title: string;
  description...: string;
  meta...: string;
}

export interface PlanCardProps {
  title: string;
  summary...: string;
  steps: PlanStepItem[];
  status...: 'idle' | 'inProgress' | 'complete' | 'error';
  footer...: React.ReactNode;
  className...: string;
}

export function PlanCard({
  title,
  summary,
  steps,
  status = 'idle',
  footer,
  className,
}: PlanCardProps) {
  return (
    <div className={cn('rounded-md border bg-muted/20 p-3 text-sm', className)}>
      <div className="flex items-center justify-between">
        <p className="font-medium">{title}</p>
        {status === 'inProgress' && (
          <span className="text-xs text-muted-foreground">Planning...</span>
        )}
        {status === 'error' && (
          <span className="text-xs text-destructive">Plan failed</span>
        )}
      </div>
      {summary && <p className="mt-1 text-xs text-muted-foreground">{summary}</p>}
      {steps.length > 0 ... (
        <ol className="mt-3 space-y-2">
          {steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="rounded border border-border/60 bg-background/40 p-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
                {step.meta && (
                  <span className="text-[10px] uppercase text-muted-foreground">{step.meta}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">No steps returned.</p>
      )}
      {footer && <div className="mt-3 border-t border-border/60 pt-3">{footer}</div>}
    </div>
  );
}

export interface PlanActionBarProps {
  onAccept...: () => void;
  onReject...: () => void;
  acceptLabel...: string;
  rejectLabel...: string;
  disabled...: boolean;
}

export function PlanActionBar({
  onAccept,
  onReject,
  acceptLabel = 'Apply',
  rejectLabel = 'Dismiss',
  disabled,
}: PlanActionBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onReject} disabled={disabled}>
        {rejectLabel}
      </Button>
      <Button type="button" size="sm" onClick={onAccept} disabled={disabled}>
        {acceptLabel}
      </Button>
    </div>
  );
}
