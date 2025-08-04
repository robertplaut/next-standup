import * as React from "react";
import { cn } from "@/lib/utils"; // shadcn helper; replace with your classnames util if different

type Props = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode; // optional right-side controls
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
};

/**
 * Card shell with a full-bleed header band that always paints to the top rounded corners.
 */
export default function WidgetCard({
  title,
  description,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header band */}
      <div
        className={cn(
          "flex items-start justify-between p-6 bg-muted/50 border-b",
          headerClassName
        )}
      >
        <div>
          <h3 className="text-base font-medium leading-none">{title}</h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="ml-4">{actions}</div> : null}
      </div>

      {/* Content */}
      <div className={cn("p-6", contentClassName)}>{children}</div>
    </div>
  );
}
