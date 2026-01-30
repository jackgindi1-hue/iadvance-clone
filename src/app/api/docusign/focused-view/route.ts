import { NextRequest, NextResponse } from 'next/server';

// DocuSign configuration
const DOCUSIGN_INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY || '';
const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID || '';
const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID || '';
const DOCUSIGN_BASE_URL = process.env.DOCUSIGN_BASE_URL || 'https://na4.docusign.net';
const DOCUSIGN_OAUTH_URL = process.env.DOCUSIGN_OAUTH_BASE_URL || 'https://account.docusign.com';
const DOCUSIGN_RSA_PRIVATE_KEY = process.env.DOCUSIGN_RSA_PRIVATE_KEY || '';

// PowerForm fallback URL
const POWERFORM_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&env=na4&acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&v=2";

async function getAccessToken(): Promise<string> {
  // Dynamic import to avoid build issues
  const { SignJWT, importPKCS8 } = await import('jose');

  // Clean the RSA key - handle escaped newlines
  let rsaKey = DOCUSIGN_RSA_PRIVATE_KEY;
  if (rsaKey.includes('\\n')) {
    rsaKey = rsaKey.replace(/\\n/g, '\n');
  }

  // Trim and clean the key
  rsaKey = rsaKey.trim();

  console.log('RSA Key length:', rsaKey.length);
  console.log('RSA Key starts with:', rsaKey.substring(0, 50));

  // Import the private key
  const privateKey = await importPKCS8(rsaKey, 'RS256');

  // Create JWT assertion
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    iss: DOCUSIGN_INTEGRATION_KEY,
    sub: DOCUSIGN_USER_ID,
    aud: 'account.docusign.com',
    scope: 'signature impersonation',
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  // Exchange JWT for access token
  const tokenResponse = await fetch(`${DOCUSIGN_OAUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token error:', errorText);
    throw new Error(`Failed to get access token: ${tokenResponse.status} - ${errorText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function createEnvelopeWithEmbeddedSigning(
  accessToken: string,
  signerEmail: string,
  signerName: string,
  returnUrl: string
): Promise<string> {
  // Create envelope with embedded signing
  const envelopeDefinition = {
    emailSubject: 'Highline Funding - Business Application',
    documents: [
      {
        documentBase64: Buffer.from(`
          <html>
            <head><style>body{font-family:Arial,sans-serif;padding:40px;}</style></head>
            <body>
              <h1>Highline Funding Business Application</h1>
              <p>Applicant: ${signerName}</p>
              <p>Email: ${signerEmail}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <br/><br/>
              <p>I authorize Highline Funding to verify my business information and run a soft credit check.</p>
              <br/><br/>
              <p>Signature: /sig1/</p>
              <p>Date Signed: /date1/</p>
            </body>
          </html>
        `).toString('base64'),
        name: 'Business Application',
        fileExtension: 'html',
        documentId: '1',
      },
    ],
    recipients: {
      signers: [
        {
          email: signerEmail,
          name: signerName,
          recipientId: '1',
          clientUserId: signerEmail, // Required for embedded signing
          routingOrder: '1',
          tabs: {
            signHereTabs: [
              {
                anchorString: '/sig1/',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
                anchorYOffset: '-10',
              },
            ],
            dateSignedTabs: [
              {
                anchorString: '/date1/',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
                anchorYOffset: '-10',
              },
            ],
          },
        },
      ],
    },
    status: 'sent',
  };

  // Create envelope
  const envelopeResponse = await fetch(
    `${DOCUSIGN_BASE_URL}/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    }
  );

  if (!envelopeResponse.ok) {
    const errorText = await envelopeResponse.text();
    console.error('Envelope error:', errorText);
    throw new Error(`Failed to create envelope: ${envelopeResponse.status}`);
  }

  const envelopeData = await envelopeResponse.json();
  const envelopeId = envelopeData.envelopeId;

  // Create recipient view (embedded signing URL)
  const viewRequest = {
    returnUrl: returnUrl,
    authenticationMethod: 'none',
    email: signerEmail,
    userName: signerName,
    clientUserId: signerEmail,
    frameAncestors: ['https://highlinefunding.com', 'https://same.new'],
    messageOrigins: ['https://highlinefunding.com'],
  };

  const viewResponse = await fetch(
    `${DOCUSIGN_BASE_URL}/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(viewRequest),
    }
  );

  if (!viewResponse.ok) {
    const errorText = await viewResponse.text();
    console.error('View error:', errorText);
    throw new Error(`Failed to create signing view: ${viewResponse.status}`);
  }

  const viewData = await viewResponse.json();
  return viewData.url;
}

export async function POST(request: NextRequest) {
  try {
    // Check if RSA key is configured
    if (!DOCUSIGN_RSA_PRIVATE_KEY || !DOCUSIGN_INTEGRATION_KEY) {
      console.log('DocuSign not fully configured, using PowerForm fallback');
      console.log('Has RSA Key:', !!DOCUSIGN_RSA_PRIVATE_KEY);
      console.log('Has Integration Key:', !!DOCUSIGN_INTEGRATION_KEY);
      return NextResponse.json({
        success: false,
        useFallback: true,
        fallbackUrl: POWERFORM_URL,
        message: 'DocuSign API not configured',
      });
    }

    const body = await request.json();
    const { email, name, returnUrl } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Get access token
    console.log('Getting access token...');
    const accessToken = await getAccessToken();
    console.log('Got access token');

    // Create envelope and get signing URL
    console.log('Creating envelope...');
    const signingUrl = await createEnvelopeWithEmbeddedSigning(
      accessToken,
      email,
      name,
      returnUrl || 'https://highlinefunding.com/upload?signed=complete'
    );
    console.log('Got signing URL:', signingUrl);

    return NextResponse.json({
      success: true,
      signingUrl,
      useFallback: false,
    });
  } catch (error: any) {
    console.error('Focused View error:', error);

    // Return fallback on any error
    return NextResponse.json({
      success: false,
      useFallback: true,
      fallbackUrl: POWERFORM_URL,
      error: error.message || 'Failed to create signing session',
    });
  }
}

export async function GET() {
  const hasRsaKey = !!DOCUSIGN_RSA_PRIVATE_KEY;
  const hasIntegrationKey = !!DOCUSIGN_INTEGRATION_KEY;

  return NextResponse.json({
    message: 'DocuSign Focused View API',
    configured: hasRsaKey && hasIntegrationKey,
    hasRsaKey,
    hasIntegrationKey,
    rsaKeyLength: DOCUSIGN_RSA_PRIVATE_KEY.length,
    status: hasRsaKey && hasIntegrationKey ? 'Ready' : 'Missing configuration',
    usage: 'POST with { email, name, returnUrl? }',
  });
}
