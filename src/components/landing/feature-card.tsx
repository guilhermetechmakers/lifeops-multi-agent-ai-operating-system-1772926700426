import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIcon } from "./icon-map";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: FeatureCardProps) {
  const IconComponent = getIcon(icon);

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
        className
      )}
    >
      <CardHeader>
        <div className="rounded-lg bg-primary/10 p-3 w-fit">
          <IconComponent className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-foreground mt-2">{title}</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {ctaLabel && ctaHref && (
          <Link to={ctaHref} className="mt-4 inline-block">
            <Button
              variant="link"
              className="p-0 h-auto text-primary hover:text-primary/90 font-medium text-sm"
              data-tracking-id={`feature-cta-${title.toLowerCase().replace(/\s/g, "-")}`}
            >
              {ctaLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
