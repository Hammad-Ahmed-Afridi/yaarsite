"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-errors';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Phone, User, Store, Chrome } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  phoneNumber: z.string()
    .regex(/^03\d{9}$/, { message: "Must start with 03 and be 11 digits long." })
    .optional()
    .or(z.literal('')),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  React.useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log("Signup Page: Form validation errors:", form.formState.errors);
    }
  }, [form.formState.errors]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Signup Page: Attempting form submission with values:", values);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
            phone_number: values.phoneNumber || null,
          },
        },
      });

      if (error) {
        console.error("Signup Page: Supabase signup error:", error);
        toast.error(getAuthErrorMessage(error));
      } else {
        // Explicitly sign out the user after successful signup
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error("Signup Page: Error during sign out after signup:", signOutError);
          toast.error("Account created, but failed to sign out. Please try logging in.");
        } else {
          toast.success("Account created successfully! Please sign in.", { duration: 3000 });
          console.log("Signup Page: Account created and signed out. Redirecting to /login.");
          router.push('/login'); // Redirect to login page
        }
        form.reset(); // Reset the form after successful signup
      }
    } catch (submitError) {
      console.error("Signup Page: Unexpected error during form submission:", submitError);
      toast.error("An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
      console.log("Signup Page: Submission finished, isLoading set to false.");
    }
  };

  const handleGoogleSignUp = async () => {
    console.log("Signup Page: Attempting Google sign-up.");
    setIsGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Signup Page: Supabase Google sign-up error:", error);
      toast.error(getAuthErrorMessage(error));
      setIsGoogleLoading(false);
    }
    console.log("Signup Page: Google sign-up initiated. Awaiting redirect.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg">
        <CardHeader className="text-center space-y-2">
          <Store className="mx-auto h-10 w-10 text-primary" />
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground">Sign up to get started with your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10"
                  {...form.register("name")}
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="03001234567"
                  className="pl-10"
                  {...form.register("phoneNumber")}
                />
              </div>
              <p className="text-muted-foreground text-xs">Must start with 03 and be 11 digits long</p>
              {form.formState.errors.phoneNumber && (
                <p className="text-destructive text-sm">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-muted-foreground text-xs">Must be at least 6 characters long</p>
              {form.formState.errors.password && (
                <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="terms"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    id="terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {form.formState.errors.terms && (
              <p className="text-destructive text-sm">{form.formState.errors.terms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
              OR
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              "Signing up with Google..."
            ) : (
              <>
                <Chrome className="h-4 w-4" /> Sign up with Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}