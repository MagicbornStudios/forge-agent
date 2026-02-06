import { Card, CardContent, CardHeader } from '@forge/ui';
import { MagicCard } from '@/components/ui/magic-card';

export interface FeatureCardProps {
  title: string;
  description: string;
}

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <MagicCard className="p-0">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <h3 className="font-medium">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </MagicCard>
  );
}
