import { redirect } from 'next/navigation';

export default function DashboardProductDetailRedirectPage() {
  redirect('/dashboard/listings');
}
