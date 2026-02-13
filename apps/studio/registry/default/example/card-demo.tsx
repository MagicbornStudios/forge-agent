'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@forge/ui/card';
import { Button } from '@forge/ui/button';

export function CardDemo() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Optional description for the card.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Main content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  );
}

export default CardDemo;
