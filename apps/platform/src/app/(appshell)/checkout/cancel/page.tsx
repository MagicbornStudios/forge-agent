import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Checkout cancelled</h1>
      <p className="mt-2 text-muted-foreground">You cancelled checkout. No charge was made.</p>
      <Button asChild className="mt-6">
        <Link href="/catalog">Back to catalog</Link>
      </Button>
    </div>
  );
}
