import { redirect } from 'next/navigation';

export default function AccountBillingRedirectPage() {
  redirect('/dashboard/billing');
}
