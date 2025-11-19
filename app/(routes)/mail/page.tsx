import { redirect } from 'next/navigation';

export default function MailRootPage() {
  redirect('/mail/inbox');
}
