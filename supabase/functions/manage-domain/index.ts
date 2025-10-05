import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { jwtVerify } from 'https://deno.land/x/jose@v5.2.4/index.ts';
// Removed: import { lookupTxt } from "https://deno.land/x/dns@v1.1.0/mod.ts"; // For DNS TXT record lookup

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate a random alphanumeric string
function generateRandomAlphanumeric(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ message: 'Unauthorized: Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.substring(7);

    const SUPABASE_JWT_SECRET = Deno.env.get('APP_JWT_SECRET');
    if (!SUPABASE_JWT_SECRET) {
      return new Response(JSON.stringify({ message: 'Server configuration error: JWT secret missing.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const secretKey = new TextEncoder().encode(SUPABASE_JWT_SECRET);

    let authenticatedUserId: string;
    try {
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
      });
      if (!payload || !payload.sub) {
        throw new Error('Invalid JWT payload: Missing user ID (sub)');
      }
      authenticatedUserId = payload.sub as string;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return new Response(JSON.stringify({ message: 'Unauthorized: Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, domain, verificationCode } = await req.json();

    if (action === 'add_domain') {
      if (!domain) {
        return new Response(JSON.stringify({ message: 'Domain is required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate a new verification code
      const newVerificationCode = `yaarsite-verify=${generateRandomAlphanumeric(16)}`;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          custom_domain: domain,
          domain_verification_code: newVerificationCode,
          domain_verified_at: null, // Reset verification status
          updated_at: new Date().toISOString(),
        })
        .eq('id', authenticatedUserId);

      if (updateError) {
        console.error("Error updating profile with custom domain:", updateError);
        return new Response(JSON.stringify({ message: updateError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ message: 'Domain added for verification.', verificationCode: newVerificationCode }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'verify_domain') {
      if (!domain || !verificationCode) {
        return new Response(JSON.stringify({ message: 'Domain and verification code are required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let verified = false;
      try {
        // Perform DNS TXT record lookup using Deno's built-in API
        const txtRecords = await Deno.resolveDns(`_yaarsite.${domain}`, "TXT");
        console.log(`DNS TXT records for _yaarsite.${domain}:`, txtRecords);

        // Check if any TXT record matches the expected verification code
        verified = txtRecords.some(record => record.includes(verificationCode));
      } catch (dnsError) {
        console.error("DNS lookup failed:", dnsError);
        // Treat DNS lookup failure as not verified
        verified = false;
      }

      if (verified) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            domain_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', authenticatedUserId);

        if (updateError) {
          console.error("Error updating domain_verified_at:", updateError);
          return new Response(JSON.stringify({ message: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ verified }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ message: 'Invalid action.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: any) {
    console.error("Edge Function caught error:", error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});