import { NextRequest, NextResponse } from 'next/server';
import { generateDLVCConfirmationEmail } from './email-template';
import { sendSMS, smsTemplates } from '@/lib/sms';
import { processFileWithWatermark } from '@/lib/watermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 DLVC submission received');

    let formData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error('❌ Error parsing form data:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      );
    }

    // Extract form fields (if available from session)
    const data = {
      firstName: (formData.get('firstName') as string) || '',
      lastName: (formData.get('lastName') as string) || '',
      email: (formData.get('email') as string) || '',
      phone: (formData.get('phone') as string) || '',
      businessType: (formData.get('businessType') as string) || '',
      fundingAmount: (formData.get('fundingAmount') as string) || '',
      timeInBusiness: (formData.get('timeInBusiness') as string) || '',
      creditScore: (formData.get('creditScore') as string) || '',
      monthlyRevenue: (formData.get('monthlyRevenue') as string) || '',
      businessName: (formData.get('businessName') as string) || '',
      source: (formData.get('source') as string) || 'dlvc',
    };

    // Extract files
    const driversLicense = formData.get('driversLicense') as File | null;
    const voidCheck = formData.get('voidCheck') as File | null;

    // Debug logging
    console.log('📁 DLVC Files received:');
    console.log('  Driver\'s License:', driversLicense ? `${driversLicense.name} (${(driversLicense.size / 1024).toFixed(2)} KB)` : 'NOT PROVIDED');
    console.log('  Void Check:', voidCheck ? `${voidCheck.name} (${(voidCheck.size / 1024).toFixed(2)} KB)` : 'NOT PROVIDED');

    // Validate files are present
    if (!driversLicense || !voidCheck) {
      console.error('❌ Missing required files');
      return NextResponse.json(
        { error: "Both Driver's License and Void Check are required" },
        { status: 400 }
      );
    }

    // Check if we have email for sending confirmations
    const hasEmail = data.email && data.email.trim() !== '';
    const hasFullData = data.firstName && data.lastName && data.email;
    console.log('📋 Has full application data:', hasFullData);
    console.log('📋 Has email for notifications:', hasEmail);
    console.log('📋 Email:', data.email);
    console.log('📋 Phone:', data.phone);

    // Format the email content
    const emailContent = hasFullData ? `
DLVC VERIFICATION DOCUMENTS RECEIVED
=====================================

CONTACT INFORMATION:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

BUSINESS INFORMATION:
${data.businessName ? `Business Name: ${data.businessName}\n` : ''}Business Type: ${data.businessType || 'Not provided'}
Funding Amount Needed: ${data.fundingAmount || 'Not provided'}
Time in Business: ${data.timeInBusiness || 'Not provided'}
Monthly Revenue: ${data.monthlyRevenue || 'Not provided'}
Credit Score: ${data.creditScore || 'Not provided'}

VERIFICATION DOCUMENTS:
1. Driver's License: ${driversLicense.name} (${(driversLicense.size / 1024 / 1024).toFixed(2)} MB)
2. Void Check: ${voidCheck.name} (${(voidCheck.size / 1024 / 1024).toFixed(2)} MB)

TRACKING:
Source: ${data.source}
Page: /dlvc

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

ACTION REQUIRED:
1. Verify Identity (Driver's License)
2. Complete Final Underwriting (Verify Bank Account)
3. Send Contract to Customer
    ` : `
DLVC VERIFICATION DOCUMENTS (Direct Upload)
============================================

VERIFICATION DOCUMENTS:
1. Driver's License: ${driversLicense.name} (${(driversLicense.size / 1024 / 1024).toFixed(2)} MB)
2. Void Check: ${voidCheck.name} (${(voidCheck.size / 1024 / 1024).toFixed(2)} MB)

NOTE: User uploaded verification documents directly via /dlvc page.
Please review the attached files.

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

ACTION REQUIRED:
1. Verify Identity (Driver's License)
2. Complete Final Underwriting (Verify Bank Account)
3. Send Contract to Customer
    `;

    // Log to console
    console.log('='.repeat(60));
    console.log('DLVC VERIFICATION DOCUMENTS RECEIVED');
    console.log('='.repeat(60));
    console.log(emailContent);
    console.log('='.repeat(60));

    // Try to send email notification
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && apiKey !== 're_123456789_your_api_key_here' && apiKey.startsWith('re_')) {
        console.log('📧 RESEND_API_KEY found, attempting to send emails...');

        // Dynamic import of Resend
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);

        // Convert files to attachments with watermarking
        console.log('🖊️ Processing Driver\'s License with watermark...');
        const dlProcessed = await processFileWithWatermark(driversLicense);
        console.log(`  Driver's License: ${driversLicense.name} -> ${dlProcessed.filename} (${dlProcessed.buffer.length} bytes)`);

        console.log('🖊️ Processing Void Check with watermark...');
        const vcProcessed = await processFileWithWatermark(voidCheck);
        console.log(`  Void Check: ${voidCheck.name} -> ${vcProcessed.filename} (${vcProcessed.buffer.length} bytes)`);

        const attachments = [
          {
            filename: `DL_${dlProcessed.filename}`,
            content: dlProcessed.buffer,
          },
          {
            filename: `VC_${vcProcessed.filename}`,
            content: vcProcessed.buffer,
          },
        ];

        console.log(`📎 Total attachments prepared: ${attachments.length}`);
        console.log(`  1. ${attachments[0].filename} (${attachments[0].content.length} bytes)`);
        console.log(`  2. ${attachments[1].filename} (${attachments[1].content.length} bytes)`);

        // Send notification email
        console.log('📧 Sending notification email...');
        const notificationResult = await resend.emails.send({
          from: 'Highline Funding Applications <info@highlinefunding.com>',
          to: 'info@highlinefunding.com',
          subject: hasFullData
            ? `🎯 DLVC: ${data.firstName} ${data.lastName} - Ready for Final Underwriting`
            : hasEmail
            ? `🎯 DLVC: ${data.email} - Ready for Final Underwriting`
            : `📄 DLVC Documents Uploaded - Ready for Review`,
          text: emailContent,
          replyTo: hasEmail ? data.email : undefined,
          attachments: attachments,
        });
        console.log('✅ Notification email sent! ID:', notificationResult.data?.id);

        // Send confirmation to applicant if we have their email
        if (hasEmail) {
          console.log('📧 Sending confirmation email to:', data.email);
          const firstName = data.firstName || 'Valued Customer';
          const confirmationResult = await resend.emails.send({
            from: 'Highline Funding <info@highlinefunding.com>',
            to: data.email,
            subject: `Documents Received${data.firstName ? ` - ${data.firstName}` : ''}, Your Funding is in Progress!`,
            html: generateDLVCConfirmationEmail({
              firstName: firstName,
              lastName: data.lastName || '',
              fundingAmount: data.fundingAmount || '',
              businessName: data.businessName || '',
            }),
            text: `Dear ${firstName},\n\nWe've received your verification documents.\n\n✓ Driver's License Received\n✓ Void Check Received\n\nWhat happens next:\n1. We verify your identity\n2. We complete final underwriting on your account\n3. We send you the contract to sign\n\nQuestions? Call us at (305) 515-7319\n\nBest regards,\nHighline Funding Team`,
          });
          console.log('✅ Confirmation email sent! ID:', confirmationResult.data?.id);
        }
      } else {
        console.log('⚠️ RESEND_API_KEY not configured or invalid. Emails not sent.');
        console.log('  Current key starts with:', apiKey?.substring(0, 10) || 'NOT SET');
      }
    } catch (emailError: any) {
      // Log but don't fail the submission
      console.error('❌ Email error (non-fatal):', emailError?.message);
    }

    // Send SMS notifications (INDEPENDENT of email - always try to send if we have phone)
    if (data.phone) {
      try {
        console.log('📱 Attempting to send SMS notifications...');

        const customerName = data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.email || 'Unknown';

        // SMS to team
        const teamResult = await sendSMS({
          to: process.env.TEAM_PHONE_NUMBER || '3055157319',
          message: smsTemplates.dlvcToTeam(
            customerName,
            data.businessName || 'Not provided'
          ),
        });
        console.log('📱 Team SMS result:', teamResult);

        // SMS to applicant (no next step - they're done!)
        const applicantResult = await sendSMS({
          to: data.phone,
          message: smsTemplates.dlvcToApplicant(data.firstName || 'Valued Customer'),
        });
        console.log('📱 Applicant SMS result:', applicantResult);

        console.log('✅ SMS notifications sent!');
      } catch (smsError: any) {
        console.error('⚠️ SMS error (non-critical):', smsError.message);
      }
    }

    console.log('✅ DLVC submission processed successfully');

    return NextResponse.json({
      success: true,
      message: 'Verification documents submitted successfully',
      applicationId: `DLVC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      filesUploaded: 2,
    });

  } catch (error: any) {
    console.error('❌ DLVC submission error:', error?.message || error);
    console.error('Stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to process verification documents. Please try again.' },
      { status: 500 }
    );
  }
}
