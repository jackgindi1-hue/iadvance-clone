import { NextRequest, NextResponse } from 'next/server';
import { generateConfirmationEmail } from './email-template';
import { sendSMS, smsTemplates } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'businessType', 'fundingAmount', 'timeInBusiness', 'creditScore', 'monthlyRevenue'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Format the email content
    const emailContent = `
New Business Funding Application Received

Application Details:


CONTACT INFORMATION:
Name: ${formData.firstName} ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}

BUSINESS INFORMATION:
${formData.businessName ? `Business Name: ${formData.businessName}\n` : ''}Business Type: ${formData.businessType}
Funding Amount Needed: ${formData.fundingAmount}
Time in Business: ${formData.timeInBusiness}
Monthly Revenue: ${formData.monthlyRevenue}
Credit Score: ${formData.creditScore}

TRACKING:
${formData.source ? `Source Button/Form: ${formData.source}\n` : ''}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

Action Required: Please contact the applicant within 2 hours.
    `;

    // Log to console for debugging
    console.log('='.repeat(60));
    console.log('NEW APPLICATION RECEIVED');
    console.log('='.repeat(60));
    console.log(emailContent);
    console.log('='.repeat(60));

    // Send email notification to info@highlinefunding.com
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789_your_api_key_here') {
        // Dynamic import of Resend to avoid build-time issues
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Send notification email to info@highlinefunding.com FIRST
        console.log('📧 Attempting to send notification email to info@highlinefunding.com...');
        const notificationResult = await resend.emails.send({
          from: 'Highline Funding Applications <info@highlinefunding.com>',
          to: 'info@highlinefunding.com',
          subject: `🔔 NEW LEAD: ${formData.firstName} ${formData.lastName} - ${formData.fundingAmount}`,
          text: emailContent,
          replyTo: formData.email,
        });
        console.log('✅ Notification email sent! ID:', notificationResult.data?.id);

        // Send confirmation email to applicant with thank you page design
        console.log('📧 Attempting to send confirmation email to applicant...');
        const confirmationResult = await resend.emails.send({
          from: 'Highline Funding <info@highlinefunding.com>',
          to: formData.email,
          subject: `Application Received - Next Steps for ${formData.firstName}`,
          html: generateConfirmationEmail({
            firstName: formData.firstName,
            lastName: formData.lastName,
            fundingAmount: formData.fundingAmount,
            businessName: formData.businessName,
          }),
          text: `Dear ${formData.firstName},\n\nThank you for your funding application with Highline Funding.\n\nYour application has been received and is being reviewed by our team. A funding specialist will contact you within 24 hours to discuss your options.\n\nIf you have questions, please call us at (305) 515-7319.\n\nBest regards,\nHighline Funding Team\n1101 Brickell Ave, South Tower, Miami, FL 33131`,
        });
        console.log('✅ Confirmation email sent! ID:', confirmationResult.data?.id);
        console.log('✅ BOTH emails sent successfully!');
      } else {
        console.error('❌ RESEND_API_KEY not configured! Current value:', process.env.RESEND_API_KEY ? 'SET (but might be placeholder)' : 'NOT SET');
        console.log('⚠️ Emails NOT sent. Please configure RESEND_API_KEY in Netlify environment variables.');
      }
    } catch (emailError: any) {
      // Log detailed email error but don't fail the submission
      console.error('❌ ERROR sending emails:');
      console.error('Error message:', emailError?.message);
      console.error('Error stack:', emailError?.stack);
      console.error('Full error:', JSON.stringify(emailError, null, 2));
      console.log('⚠️ Form submission will still succeed, but emails were not sent');
    }

    // Send SMS notifications (INDEPENDENT of email - always try to send)
    try {
      console.log('📱 Attempting to send SMS notifications...');
      
      // SMS to team
      await sendSMS({
        to: process.env.TEAM_PHONE_NUMBER || '3055157319',
        message: smsTemplates.newApplicationToTeam(
          `${formData.firstName} ${formData.lastName}`,
          formData.businessName || 'Not provided',
          formData.fundingAmount,
          formData.phone
        ),
      });

      // SMS to applicant with link to next step (/upload)
      await sendSMS({
        to: formData.phone,
        message: smsTemplates.newApplicationToApplicant(
          formData.firstName,
          formData.businessName || 'your business'
        ),
      });

      console.log('✅ SMS notifications sent!');
    } catch (smsError: any) {
      console.error('⚠️ SMS error (non-critical):', smsError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
}
