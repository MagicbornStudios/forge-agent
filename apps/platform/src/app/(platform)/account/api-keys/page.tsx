import { redirect } from 'next/navigation';

export default function AccountApiKeysRedirectPage() {
  redirect('/dashboard/api-keys');
}
