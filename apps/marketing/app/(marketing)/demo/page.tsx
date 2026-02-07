import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Product demo</h1>
      <p className="mt-4 max-w-lg text-center text-muted-foreground">
        Interactive demo and product walkthrough. Coming soon.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
