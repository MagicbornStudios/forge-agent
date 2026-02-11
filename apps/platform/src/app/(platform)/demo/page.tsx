import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Product demo</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        Interactive product demo and walkthrough are coming soon.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-primary hover:underline">
        Back to home
      </Link>
    </div>
  );
}
