"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getAuthErrorMessage } from '@/lib/auth-errors';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { AppLoader } from '@/components/app-loader';

const formSchema = z.object({
  code: z.string().min(6, { message: "Verification code must be 6 digits." }).max(6, { message: "Verification code must be 6 digits." }),
});

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get('email');

  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds for resend cooldown
  const [canResend, setCanResend] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!userEmail) {
      toast.error("Email not provided for verification. Please log in again.");
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [userEmail, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const startResendCooldown = useCallback(() => {
    setCanResend(false);
    setCountdown(60);
  }, []);

  const handleResendCode = async () => {
    if (!userEmail) {
      toast.error("Email not available to resend code.");
      return;
    }
    setIsResending(true);
    try {
      // Supabase's resend method for OTPs
      const { error } = await supabase.auth.resend({
        type: 'signup', // Use 'signup' type to resend the initial confirmation OTP
        email: userEmail,
      });

      if (error) {
        console.error("EmailVerificationPage: Error resending code:", error);
        toast.error(getAuthErrorMessage(error));
      } else {
        toast.success("New verification code sent to your email!");
        startResendCooldown();
      }
    } catch (err: any) {
      console.error("EmailVerificationPage: Unexpected error resending code:", err);
      toast.error(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userEmail) {
      toast.error("Email not provided for verification.");
      return;
    }
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: values.code,
        type: 'email', // Type 'email' is used for email confirmation OTPs
      });

      if (error) {
        console.error("EmailVerificationPage: Error verifying code:", error);
        toast.error(getAuthErrorMessage(error));
      } else {
        toast.success("Email verified successfully! Redirecting to dashboard...");
        router.push('/'); // Redirect to dashboard on successful verification
      }
    } catch (err: any) {
      console.error("EmailVerificationPage: Unexpected error verifying code:", err);
      toast.error(err.message || "Failed to verify code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return <AppLoader message="Loading verification page..." />;
  }

  if (!userEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold text-destructive mb-4 tracking-tight">Error</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">Email not found. Please return to the login page.</p>
        <Button asChild className="mt-6 font-semibold">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 font-sans">
      <Card className="w-full max-w-md bg-card text-card-foreground shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-2">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold tracking-tight">Verify Your Email</CardTitle>
          <CardDescription className="text-base text-muted-foreground leading-relaxed">
            A 6-digit verification code has been sent to <span className="font-medium text-foreground">{userEmail}</span>.
            Please enter it below to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                {...form.register("code")}
              />
              {form.formState.errors.code && (
                <p className="text-destructive text-sm">{form.formState.errors.code.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={isVerifying}>
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" /> Verify Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-3">
            <p className="text-muted-foreground">
              Didn't receive the code?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={isResending || !canResend}
              className="w-full font-semibold"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Resend Code {canResend ? '' : `(${countdown}s)`}
                </>
              )}
            </Button>
            <Button asChild variant="link" className="w-full">
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}