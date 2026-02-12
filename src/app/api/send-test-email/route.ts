import { NextRequest, NextResponse } from 'next/server';
import { generateConfirmationEmail, generateUploadConfirmationEmail } from '../submit-application/email-template';
import { generateDLVCConfirmationEmail } from '../submit-dlvc/email-template';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailType, recipientEmail, firstName, lastName, businessName, fundingAmount } = body;

    // Validate required fields
    if (!emailType || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: emailType and recipientEmail are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    const data = {
      firstName: firstName || 'John',
      lastName: lastName || 'Smith',
      businessName: businessName || 'ABC Company LLC',
      fundingAmount: fundingAmount || '50000-100000',
    };

    let html = '';
    let subject = '';

    switch (emailType) {
      case 'confirmation':
        html = generateConfirmationEmail(data);
        subject = `[TEST] Application Received - Next Steps for ${data.firstName}`;
        break;
      case 'upload':
        html = generateUploadConfirmationEmail(data);
        subject = `[TEST] One More Step - Complete Your Application for ${data.firstName}`;
        break;
      case 'dlvc':
        html = generateDLVCConfirmationEmail(data);
        subject = `[TEST] Documents Received - ${data.firstName}, Your Funding is in Progress!`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Dynamic import of Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email using Resend
    const { data: emailResult, error } = await resend.emails.send({
      from: 'Highline Funding <noreply@highlinefunding.com>',
      to: [recipientEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: `Failed to send email: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`,
      emailId: emailResult?.id,
      emailType,
      subject,
    });
  } catch (error) {
    console.error('Send test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
