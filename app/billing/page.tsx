import { redirect } from 'next/navigation';

export default function AdminBillingRedirect() {
  redirect('/transactions');
}
