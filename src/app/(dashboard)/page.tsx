import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { user } = await validateRequest();

  console.log(user);
  if (!user) {
    return redirect('/sign-in');
  }

  return <p>This is an authenticated page.</p>;
  // return <Button>Click me</Button>;
}
