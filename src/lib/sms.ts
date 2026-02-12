// SMS utility using Twilio
// To use: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to Netlify env vars
// BUILD VERSION: 2026-02-12-v3 - Include email/phone in ALL team SMS notifications

interface SMSOptions {
  to: string;
  message: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Format phone number to E.164 format (required by Twilio)
function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  // If it's 11 digits and starts with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  // Otherwise, assume it already has country code
  return `+${digits}`;
}

export async function sendSMS({ to, message }: SMSOptions): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('⚠️ Twilio not configured - SMS not sent');
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const formattedTo = formatPhoneNumber(to);
    console.log(`📱 Sending SMS to ${formattedTo}...`);

    // Use Twilio REST API directly (no SDK needed)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ SMS sent! SID: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } else {
      console.error(`❌ SMS failed:`, result.message);
      return { success: false, error: result.message };
    }
  } catch (error: any) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
}

// Pre-built SMS templates with full content + links at bottom
// Updated to include email/phone in ALL team notifications
export const smsTemplates = {
  // === NEW APPLICATION ===
  // To Team: Full details about the new lead
  newApplicationToTeam: (name: string, businessName: string, amount: string, phone: string, email?: string) =>
    `NEW APPLICATION RECEIVED
${name} from ${businessName}
Requested: ${amount}
Phone: ${phone}${email ? `
Email: ${email}` : ''}
Review and follow up ASAP!`,

  // To Applicant: Thank them, explain next steps, then link
  newApplicationToApplicant: (firstName: string, businessName: string) =>
    `Hi ${firstName}! Thank you for applying with Highline Funding.
We've received your application for ${businessName} and a funding specialist will review it shortly.
NEXT STEP: Please upload your last 3 months of business bank statements to complete your application.
Upload here: https://highlinefunding.com/upload
Questions? Call us: (305) 515-7319`,

  // === BANK STATEMENTS UPLOADED ===
  // To Team: Notify about upload (includes email/phone when available)
  bankStatementsToTeam: (name: string, businessName: string, fileCount: number, email?: string, phone?: string) =>
    `BANK STATEMENTS RECEIVED
${name} from ${businessName} uploaded ${fileCount} bank statement${fileCount > 1 ? 's' : ''}.${email ? `
Email: ${email}` : ''}${phone ? `
Phone: ${phone}` : ''}
Documents ready for review!`,

  // To Applicant: Confirm receipt, explain final step, then link
  bankStatementsToApplicant: (firstName: string) =>
    `Hi ${firstName}! We've received your bank statements - thank you!
FINAL STEP: Please complete identity verification to finalize your application. This quick and secure process only takes a few minutes.
Complete verification here: https://highlinefunding.com/dlvc
Questions? Call us: (305) 515-7319`,

  // === DLVC COMPLETED ===
  // To Team: Ready for final review (includes email/phone when available)
  dlvcToTeam: (name: string, businessName: string, email?: string, phone?: string) =>
    `APPLICATION COMPLETE
${name} from ${businessName} has completed all steps:
- Application submitted
- Bank statements uploaded
- Identity verification complete${email ? `
Email: ${email}` : ''}${phone ? `
Phone: ${phone}` : ''}
Ready for final review and funding decision!`,

  // To Applicant: Confirm everything received, explain what happens next
  dlvcToApplicant: (firstName: string) =>
    `Hi ${firstName}! Congratulations - your application is complete!
We've received all your documents:
- Application
- Bank statements
- Identity verification
A funding specialist will contact you shortly to discuss your personalized funding options.
Thank you for choosing Highline Funding!
Questions? Call us: (305) 515-7319`,
};
