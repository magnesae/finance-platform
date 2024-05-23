import { SignInForm } from '@/components/sign-in/sign-in-form';
import Image from 'next/image';

const SignInPage = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="h-full lg:flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4 pt-16">
          <h1 className="font-bold text-3xl">Login</h1>
          <p className="text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="flex items-center justify-center mt-8">
          <SignInForm />
        </div>
      </div>
      <div className="h-full bg-zinc-900 hidden lg:flex items-center justify-center">
        <Image src="/logo.svg" alt="Logo" width={100} height={100} />
      </div>
    </div>
  );
};

export default SignInPage;
