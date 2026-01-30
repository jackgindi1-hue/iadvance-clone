import { NextRequest, NextResponse } from 'next/server';
import { generateConfirmationEmail, generateUploadConfirmationEmail } from '../submit-application/email-template';
import { generateDLVCConfirmationEmail } from '../submit-dlvc/email-template';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailType, firstName, lastName, businessName, fundingAmount } = body;

    const data = {
      firstName: firstName || 'John',
      lastName: lastName || 'Smith',
      businessName: businessName || 'ABC Company LLC',
      fundingAmount: fundingAmount || '50000-100000',
    };

    let html = '';
    let subject = '';
    let description = '';

    switch (emailType) {
      case 'confirmation':
        html = generateConfirmationEmail(data);
        subject = `Application Received - Next Steps for ${data.firstName}`;
        description = 'Sent after user submits the pre-qualification form on the homepage';
        break;
      case 'upload':
        html = generateUploadConfirmationEmail(data);
        subject = `One More Step - Complete Your Application for ${data.firstName}`;
        description = 'Sent after user uploads their bank statements';
        break;
      case 'dlvc':
        html = generateDLVCConfirmationEmail(data);
        subject = `Documents Received - ${data.firstName}, Your Funding is in Progress!`;
        description = 'Sent after user uploads their driver\'s license and void check';
        break;
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      html,
      subject,
      description,
      emailType,
    });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json({ error: 'Failed to generate email preview' }, { status: 500 });
  }
}