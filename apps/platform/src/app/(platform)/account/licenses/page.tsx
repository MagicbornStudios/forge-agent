import { redirect } from 'next/navigation';

export default function AccountLicensesRedirectPage() {
  redirect('/dashboard/licenses');
}
