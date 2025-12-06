"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="flex items-center p-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/signup">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold ml-4">Terms and Conditions</h1>
      </header>

      <main className="flex-1 p-4 sm:p-8 flex justify-center">
        <Card className="w-full max-w-3xl bg-card text-card-foreground shadow-lg rounded-3xl">
          <CardHeader className="text-center space-y-2">
            <FileText className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="text-3xl font-bold tracking-tight">Yaarsite Terms of Service</CardTitle>
            <CardDescription className="text-base text-muted-foreground leading-relaxed">
              Please read these terms carefully before using our services.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-left text-base leading-relaxed">
            <p>
              Welcome to Yaarsite! These Terms of Service ("Terms") govern your access to and use of the Yaarsite website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
            </p>

            <h3 className="text-xl font-semibold mt-4">1. Account Registration and Use</h3>
            <p>
              When you register for an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 className="text-xl font-semibold mt-4">2. Your Store and Products</h3>
            <p>
              Yaarsite allows you to create and manage an online store. You are solely responsible for the products you list, their descriptions, pricing, stock, and compliance with all applicable laws and regulations. Yaarsite is not responsible for the content of your store or the products you sell.
            </p>

            <h3 className="text-xl font-semibold mt-4">3. Payments and Fees</h3>
            <p>
              You agree to pay all fees associated with your use of the Service as described on our pricing page. All fees are non-refundable. Yaarsite may change its fees at any time, but will provide you with advance notice.
            </p>

            <h3 className="text-xl font-semibold mt-4">4. Prohibited Activities</h3>
            <p>
              You agree not to engage in any of the following prohibited activities:
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Violating any applicable laws or regulations.</li>
                <li>Selling illegal, counterfeit, or harmful products.</li>
                <li>Infringing on the intellectual property rights of others.</li>
                <li>Distributing spam, malware, or other harmful content.</li>
                <li>Attempting to interfere with the proper functioning of the Service.</li>
              </ul>
            </p>

            <h3 className="text-xl font-semibold mt-4">5. Termination</h3>
            <p>
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>

            <h3 className="text-xl font-semibold mt-4">6. Disclaimer of Warranties</h3>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Yaarsite makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h3 className="text-xl font-semibold mt-4">7. Limitation of Liability</h3>
            <p>
              In no event shall Yaarsite or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Yaarsite's website, even if Yaarsite or a Yaarsite authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h3 className="text-xl font-semibold mt-4">8. Governing Law</h3>
            <p>
              These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold mt-4">9. Changes to Terms</h3>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <p className="mt-8 text-sm text-muted-foreground">
              Last updated: December 06, 2025
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}