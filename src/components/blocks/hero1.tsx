import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

export interface Hero1Props {
  badge?: string;
  heading: string;
  description: string;
  buttons?: {
    primary?: { text: string; url: string };
    secondary?: { text: string; url: string };
  };
  image: { src: string; alt: string };
  /** Utility classes for padding / background / etc. */
  className?: string;
}

export default function Hero1({
  badge,
  heading,
  description,
  buttons,
  image,
  className = "py-20 lg:py-32", // ⬅️ default, but easily overridden
}: Hero1Props) {
  return (
    <section className={clsx(className)}>
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* text col */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <span className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium">
                {badge}
                <ArrowUpRight className="size-4" />
              </span>
            )}
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
              {heading}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              {description}
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              {buttons?.primary && (
                <Button asChild className="w-full sm:w-auto">
                  <a href={buttons.primary.url}>{buttons.primary.text}</a>
                </Button>
              )}
              {buttons?.secondary && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href={buttons.secondary.url}>
                    {buttons.secondary.text}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* image col */}
          <img
            src={image.src}
            alt={image.alt}
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
}
