import { NextRequest, NextResponse } from 'next/server';
import { generateDLVCConfirmationEmail } from './email-template';
import { sendSMS, smsTemplates } from '@/lib/sms';
import { processFileWithWatermark } from '@/lib/watermark';
// BUILD VERSION: 2026-02-12-v2 - Send BOTH copies + campaign slug + email/phone in subjects
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
      campaign: (formData.get('campaign') as string) || '',
    };

    // Extract files
    const driversLicense = formData.get('driversLicense') as File | null;
    const voidCheck = formData.get('voidCheck') as File | null;

    // Debug logging
    console.log('📁 DLVC Files received:');
    console.log('  Drivers License:', driversLicense ? `${driversLicense.name} (${(driversLicense.size / 1024).toFixed(2)} KB)` : 'NOT PROVIDED');
    console.log('  Void Check:', voidCheck ? `${voidCheck.name} (${(voidCheck.size / 1024).toFixed(2)} KB)` : 'NOT PROVIDED');
    console.log('📧 Email:', data.email);
    console.log('📱 Phone:', data.phone);
    console.log('🏷️ Campaign:', data.campaign);

    // Validate files are present
    if (!driversLicense || !voidCheck) {
      console.error('❌ Missing required files');
      return NextResponse.json(
        { error: "Both Drivers License and Void Check are required" },
        { status: 400 }
      );
    }

    // Check if we have email for sending confirmations
    const hasEmail = data.email && data.email.trim() !== '';
    const hasPhone = data.phone && data.phone.trim() !== '';
    const hasFullData = data.firstName && data.lastName && data.email;

    console.log('📋 Has full application data:', hasFullData);
    console.log('📋 Has email for notifications:', hasEmail);

    // Format the email content - ALWAYS include contact info section
    const contactSection = (hasEmail || hasPhone) ? `
CONTACT INFORMATION:
${hasEmail ? `Email: ${data.email}\n` : ''}${hasPhone ? `Phone: ${data.phone}\n` : ''}` : '';

    const emailContent = hasFullData ? `
DLVC VERIFICATION DOCUMENTS RECEIVED
=====================================
CONTACT INFORMATION:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}

BUSINESS INFORMATION:
${data.businessName ? `Business Name: ${data.businessName}\n` : ''}Business Type: ${data.businessType || 'Not provided'}
Funding Amount Needed: ${data.fundingAmount || 'Not provided'}
Time in Business: ${data.timeInBusiness || 'Not provided'}
Monthly Revenue: ${data.monthlyRevenue || 'Not provided'}
Credit Score: ${data.creditScore || 'Not provided'}

VERIFICATION DOCUMENTS (4 files - ORIGINAL + WATERMARKED):
1. Drivers License: ${driversLicense.name} (${(driversLicense.size / 1024 / 1024).toFixed(2)} MB)
2. Void Check: ${voidCheck.name} (${(voidCheck.size / 1024 / 1024).toFixed(2)} MB)

NOTE: This email contains BOTH watermarked AND original (non-watermarked) copies of each document.

TRACKING:
Source: ${data.source}
${data.campaign ? `Campaign: ${data.campaign}\n` : ''}Page: /dlvc

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

ACTION REQUIRED:
1. Verify Identity (Drivers License)
2. Complete Final Underwriting (Verify Bank Account)
3. Send Contract to Customer
    ` : `
DLVC VERIFICATION DOCUMENTS (Direct Upload)
============================================
${contactSection}
VERIFICATION DOCUMENTS (4 files - ORIGINAL + WATERMARKED):
1. Drivers License: ${driversLicense.name} (${(driversLicense.size / 1024 / 1024).toFixed(2)} MB)
2. Void Check: ${voidCheck.name} (${(voidCheck.size / 1024 / 1024).toFixed(2)} MB)

NOTE: This email contains BOTH watermarked AND original (non-watermarked) copies of each document.
User uploaded verification documents directly via /dlvc page.
Please review the attached files.
${data.campaign ? `\nCampaign: ${data.campaign}` : ''}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

ACTION REQUIRED:
1. Verify Identity (Drivers License)
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

        // Process files with watermarking - send BOTH watermarked AND original copies
        console.log('🖊️ Processing files with watermarks (will send BOTH copies)...');

        const attachments: { filename: string; content: Buffer }[] = [];

        // Process Drivers License - BOTH copies
        console.log('🖊️ Processing Drivers License...');
        const dlOriginalBytes = await driversLicense.arrayBuffer();
        const dlOriginalBuffer = Buffer.from(dlOriginalBytes);
        const dlExt = driversLicense.name.substring(driversLicense.name.lastIndexOf('.'));
        const dlBaseName = driversLicense.name.substring(0, driversLicense.name.lastIndexOf('.'));

        // Add ORIGINAL Drivers License
        attachments.push({
          filename: `ORIGINAL_DL_${dlBaseName}${dlExt}`,
          content: dlOriginalBuffer,
        });
        console.log(`  ✅ Added ORIGINAL Drivers License: ${dlOriginalBuffer.length} bytes`);

        // Try to add WATERMARKED Drivers License
        try {
          const dlFileForWatermark = new File([dlOriginalBuffer], driversLicense.name, { type: driversLicense.type });
          const dlProcessed = await processFileWithWatermark(dlFileForWatermark);
          if (dlProcessed.watermarked) {
            attachments.push({
              filename: `WATERMARKED_DL_${dlBaseName}${dlExt}`,
              content: dlProcessed.buffer,
            });
            console.log(`  ✅ Added WATERMARKED Drivers License: ${dlProcessed.buffer.length} bytes`);
          }
        } catch (err: any) {
          console.log(`  ⚠️ Watermarking failed for DL: ${err?.message}`);
        }

        // Process Void Check - BOTH copies
        console.log('🖊️ Processing Void Check...');
        const vcOriginalBytes = await voidCheck.arrayBuffer();
        const vcOriginalBuffer = Buffer.from(vcOriginalBytes);
        const vcExt = voidCheck.name.substring(voidCheck.name.lastIndexOf('.'));
        const vcBaseName = voidCheck.name.substring(0, voidCheck.name.lastIndexOf('.'));

        // Add ORIGINAL Void Check
        attachments.push({
          filename: `ORIGINAL_VC_${vcBaseName}${vcExt}`,
          content: vcOriginalBuffer,
        });
        console.log(`  ✅ Added ORIGINAL Void Check: ${vcOriginalBuffer.length} bytes`);

        // Try to add WATERMARKED Void Check
        try {
          const vcFileForWatermark = new File([vcOriginalBuffer], voidCheck.name, { type: voidCheck.type });
          const vcProcessed = await processFileWithWatermark(vcFileForWatermark);
          if (vcProcessed.watermarked) {
            attachments.push({
              filename: `WATERMARKED_VC_${vcBaseName}${vcExt}`,
              content: vcProcessed.buffer,
            });
            console.log(`  ✅ Added WATERMARKED Void Check: ${vcProcessed.buffer.length} bytes`);
          }
        } catch (err: any) {
          console.log(`  ⚠️ Watermarking failed for VC: ${err?.message}`);
        }

        console.log(`📎 Total attachments prepared: ${attachments.length}`);
        attachments.forEach((att, index) => {
          console.log(`  ${index + 1}. ${att.filename}`);
        });

        // Build subject line with email/phone info + campaign
        let subjectLine: string;
        if (hasFullData) {
          subjectLine = `🎯 DLVC (${attachments.length} FILES): ${data.firstName} ${data.lastName} - Ready for Final Underwriting`;
        } else if (hasEmail && hasPhone) {
          subjectLine = `🎯 DLVC (${attachments.length} FILES): ${data.email} - ${data.phone}`;
        } else if (hasEmail) {
          subjectLine = `🎯 DLVC (${attachments.length} FILES): ${data.email}`;
        } else if (hasPhone) {
          subjectLine = `🎯 DLVC (${attachments.length} FILES): Phone: ${data.phone}`;
        } else {
          subjectLine = `📄 DLVC Documents Uploaded (${attachments.length} FILES) - Ready for Review`;
        }

        // Add campaign to subject if present
        if (data.campaign) {
          subjectLine = `[${data.campaign}] ${subjectLine}`;
        }

        // Send notification email
        console.log(`📧 Sending notification email with subject: ${subjectLine}`);
        const notificationResult = await resend.emails.send({
          from: 'Highline Funding Applications <info@highlinefunding.com>',
          to: 'info@highlinefunding.com',
          subject: subjectLine,
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
            text: `Dear ${firstName},\n\nWe have received your verification documents.\n\n✓ Drivers License Received\n✓ Void Check Received\n\nWhat happens next:\n1. We verify your identity\n2. We complete final underwriting on your account\n3. We send you the contract to sign\n\nQuestions? Call us at (305) 515-7319\n\nBest regards,\nHighline Funding Team`,
          });

          console.log('✅ Confirmation email sent! ID:', confirmationResult.data?.id);
        }
      } else {
        console.log('⚠️ RESEND_API_KEY not configured or invalid. Emails not sent.');
        console.log('  Current key starts with:', apiKey?.substring(0, 10) || 'NOT SET');
      }
    } catch (emailError: any) {
      // Log but do not fail the submission
      console.error('❌ Email error (non-fatal):', emailError?.message);
    }

    // Send SMS notifications (INDEPENDENT of email - always try to send if we have phone)
    if (hasPhone) {
      try {
        console.log('📱 Attempting to send SMS notifications...');
        const customerName = data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.email || 'Unknown';

        // SMS to team - include campaign if available
        let teamMessage = smsTemplates.dlvcToTeam(
          customerName,
          data.businessName || 'Not provided',
          data.email || undefined,
          data.phone || undefined
        );
        if (data.campaign) {
          teamMessage = `[${data.campaign}] ${teamMessage}`;
        }

        const teamResult = await sendSMS({
          to: process.env.TEAM_PHONE_NUMBER || '3055157319',
          message: teamMessage,
        });
        console.log('📱 Team SMS result:', teamResult);

        // SMS to applicant (no next step - they are done!)
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
