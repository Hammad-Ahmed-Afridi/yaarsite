"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft, Copy, ExternalLink, CheckCircle, XCircle, Loader2, RefreshCcw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard-header';
import { useSession } from '@/components/session-context-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AppLoader } from '@/components/app-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const domainSchema = z.object({
  customDomain: z.string().min(3, { message: "Domain must be at least 3 characters." }).regex(/^(?!:\/\/)([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(\/\S*)?$/, { message: "Invalid domain format." }),
});

export default function FreeDomainPage() {
  const { user, profile, isLoading: isSessionLoading, refreshProfile, session } = useSession();
  const router = useRouter();
  const [isSubmittingDomain, setIsSubmittingDomain] = useState(false);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      customDomain: profile?.custom_domain || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        customDomain: profile.custom_domain || "",
      });
    }
  }, [profile, form]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
    } else {
      toast.success("Signed out successfully!");
      router.push('/login');
    }
  };

  const handleCopyUrl = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.info(message);
  };

  const handleOpenStoreUrl = () => {
    const urlToOpen = profile?.custom_domain && profile.domain_verified_at ? `https://${profile.custom_domain}` : profile?.store_url;
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
  };

  const onSubmitDomain = async (values: z.infer<typeof domainSchema>) => {
    if (!user || !session) {
      toast.error("You must be logged in to add a custom domain.");
      return;
    }
    setIsSubmittingDomain(true);
    try {
      const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "vpfrtytxeimezwxhhtuf";
      const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-domain`;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'add_domain',
          domain: values.customDomain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add custom domain.");
      }

      toast.success("Custom domain added. Please update your DNS records.");
      await refreshProfile(); // Fetch updated profile with verification code
    } catch (error: any) {
      console.error("Error adding custom domain:", error);
      toast.error(error.message || "An unexpected error occurred while adding your domain.");
    } finally {
      setIsSubmittingDomain(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!user || !session || !profile?.custom_domain || !profile.domain_verification_code) {
      toast.error("Domain or verification code missing. Please add your domain first.");
      return;
    }
    setIsVerifyingDomain(true);
    try {
      const SUPABASE_PROJECT_ID = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || "vpfrtytxeimezwxhhtuf";
      const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-domain`;

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'verify_domain',
          domain: profile.custom_domain,
          verificationCode: profile.domain_verification_code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Domain verification failed.");
      }

      const result = await response.json();
      if (result.verified) {
        toast.success("Domain verified successfully! Your store is now accessible via your custom domain.");
      } else {
        toast.error("Domain not yet verified. Please ensure your DNS records are correctly set and try again.");
      }
      await refreshProfile(); // Fetch updated profile with verification status
    } catch (error: any) {
      console.error("Error verifying custom domain:", error);
      toast.error(error.message || "An unexpected error occurred during domain verification.");
    } finally {
      setIsVerifyingDomain(false);
    }
  };

  const displayStoreUrl = profile?.custom_domain && profile.domain_verified_at
    ? `https://${profile.custom_domain}`
    : profile?.store_url || "Store URL not available";

  const isCustomDomainActive = profile?.custom_domain && profile.domain_verified_at;

  if (isSessionLoading) {
    return <AppLoader message="Loading page..." />;
  }

  if (!profile || profile.tenant_name === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center font-sans">
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Store Not Configured</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">Please set up your store first from the dashboard to access domain features.</p>
        <Button asChild className="font-semibold">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <DashboardHeader profile={profile} onSignOut={handleSignOut} />

      <main className="flex-1 p-4 sm:p-8 flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">Your Store Link & Custom Domain</h1>
        </div>
        <Globe className="h-24 w-24 text-primary mb-6" />
        <p className="text-lg text-muted-foreground mb-8 max-w-prose leading-relaxed">
          Manage your store's public URL. You can use your free Yaarsite subdomain or connect a custom .com domain.
        </p>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Current Store URL</CardTitle>
            <CardDescription className="text-base leading-relaxed">This is the direct link to your online store.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2">
              <Input
                value={displayStoreUrl}
                readOnly
                className="flex-1 text-base"
              />
              <Button variant="outline" size="icon" onClick={() => handleCopyUrl(displayStoreUrl, "Store URL copied to clipboard!")} disabled={!profile.store_url && !profile.custom_domain}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleOpenStoreUrl} disabled={!profile.store_url && !profile.custom_domain}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild className="font-semibold w-full max-w-xs" disabled={!profile.store_url && !profile.custom_domain}>
              <Link href={displayStoreUrl} target="_blank" rel="noopener noreferrer">
                Visit Your Store
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Connect a Custom .com Domain</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Use your own professional domain (e.g., `yourstorename.com`) for your Yaarsite store.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left space-y-6">
            <form onSubmit={form.handleSubmit(onSubmitDomain)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customDomain" className="text-sm font-medium">Your Custom Domain</Label>
                <Input
                  id="customDomain"
                  placeholder="e.g., yourstorename.com"
                  {...form.register("customDomain")}
                  disabled={isSubmittingDomain || isCustomDomainActive}
                />
                {form.formState.errors.customDomain && (
                  <p className="text-destructive text-sm">{form.formState.errors.customDomain.message}</p>
                )}
              </div>
              {!isCustomDomainActive && (
                <Button type="submit" className="w-full font-semibold" disabled={isSubmittingDomain}>
                  {isSubmittingDomain ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Domain...
                    </>
                  ) : (
                    "Add Custom Domain"
                  )}
                </Button>
              )}
            </form>

            {profile.custom_domain && (
              <div className="space-y-4 mt-6">
                <h3 className="text-xl font-semibold">Verification Steps:</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To verify your domain, please add the following **TXT record** to your domain's DNS settings at your domain registrar (e.g., GoDaddy, Namecheap).
                </p>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Record Type:</Label>
                  <div className="flex items-center gap-2">
                    <Input value="TXT" readOnly className="flex-1 font-mono" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyUrl("TXT", "Record Type copied!")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Host/Name:</Label>
                  <div className="flex items-center gap-2">
                    <Input value={`_yaarsite.${profile.custom_domain}`} readOnly className="flex-1 font-mono" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyUrl(`_yaarsite.${profile.custom_domain}`, "Host/Name copied!")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">Value:</Label>
                  <div className="flex items-center gap-2">
                    <Input value={profile.domain_verification_code || "N/A"} readOnly className="flex-1 font-mono" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyUrl(profile.domain_verification_code || "", "Verification Value copied!")} disabled={!profile.domain_verification_code}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  DNS changes can take a few minutes to a few hours to propagate.
                </p>

                <div className="flex items-center gap-2 mt-4">
                  {profile.domain_verified_at ? (
                    <Badge className="bg-green-500 text-white font-medium flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Verified ({format(new Date(profile.domain_verified_at), 'MMM d, yyyy')})
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="font-medium flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> Pending Verification
                    </Badge>
                  )}
                  <Button
                    type="button"
                    onClick={handleVerifyDomain}
                    disabled={isVerifyingDomain || isCustomDomainActive}
                    className="font-semibold"
                  >
                    {isVerifyingDomain ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4" /> Verify Domain
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full max-w-2xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Professional Short Links</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              For social media bios and marketing, you can create a shorter, more memorable link that redirects to your Yaarsite store.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 1: Bitly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bitly allows you to create custom short links (e.g., `bit.ly/YourStoreName`).
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Go to <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bitly.com</a> and sign up for a free account.</li>
                <li>Click "Create new" and select "Link".</li>
                <li>Paste your Yaarsite Store URL (copied above) into the "Destination" field.</li>
                <li>Customize the "Back-half" (the part after `bit.ly/`) to something memorable for your store.</li>
                <li>Save your new short link and use it in your social media bios!</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://bitly.com/" target="_blank" rel="noopener noreferrer">Go to Bitly</a>
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Option 2: Linktree</h3>
              <p className="text-muted-foreground leading-relaxed">
                Linktree is perfect for creating a single, mobile-friendly landing page with multiple links, ideal for Instagram bios.
              </p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1 leading-relaxed">
                <li>Go to <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Linktr.ee</a> and sign up for a free account.</li>
                <li>Add a new link and paste your Yaarsite Store URL (copied above).</li>
                <li>Customize the title of the link (e.g., "Shop Our Store").</li>
                <li>Share your Linktree URL (`linktr.ee/YourStoreName`) in your social media bios.</li>
              </ol>
              <Button asChild variant="outline" className="mt-2 font-semibold">
                <a href="https://linktr.ee/" target="_blank" rel="noopener noreferrer">Go to Linktree</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}