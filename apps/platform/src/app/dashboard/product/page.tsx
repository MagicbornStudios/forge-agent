import { redirect } from 'next/navigation';

export default function DashboardProductRedirectPage() {
  redirect('/dashboard/listings');
}
