'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormState } from 'react-dom';
import { signUpAction } from '@/actions/auth';
import { useRef } from 'react';

export const signUpSchema = z.object({
  username: z.string().trim().min(2).max(50),
  password: z.string().trim().min(2).max(50),
  confirmPassword: z.string().trim().min(2).max(50),
});

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, null);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="grid gap-2"
            ref={formRef}
            action={formAction}
            onSubmit={(evt) => {
              evt.preventDefault();
              form.handleSubmit(() => {
                formAction(new FormData(formRef.current!));
              })(evt);
            }}
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create an account
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up/github" className="w-full">
                Sign up with GitHub
              </Link>
            </Button>
          </form>
        </Form>
        {/* Handle form errors form server side */}
        {state?.fieldError ? (
          <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {Object.values(state.fieldError).map((err) => (
              <li className="ml-4" key={err}>
                {err}
              </li>
            ))}
          </ul>
        ) : state?.formError ? (
          <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
            {state?.formError}
          </p>
        ) : null}
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="#" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
