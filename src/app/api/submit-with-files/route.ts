import { NextRequest, NextResponse } from 'next/server';
import { generateUploadConfirmationEmail } from '../submit-application/email-template';
import { sendSMS, smsTemplates } from '@/lib/sms';
import { processFileWithWatermark } from '@/lib/watermark';

// BUILD VERSION: 2026-02-12-v1 - Include email/phone in ALL notifications + send BOTH copies
export async function POST(request: NextRequest) {
  console.log('📬 [ROUTE-v4] submit-with-files route called');
  try {
    const formData = await request.formData();

    // Extract form fields
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      businessType: formData.get('businessType') as string,
      fundingAmount: formData.get('fundingAmount') as string,
      timeInBusiness: formData.get('timeInBusiness') as string,
      creditScore: formData.get('creditScore') as string,
      monthlyRevenue: formData.get('monthlyRevenue') as string,
      businessName: formData.get('businessName') as string,
      source: formData.get('source') as string,
      campaign: formData.get('campaign') as string,
    };

    // Extract files
    const files = formData.getAll('bankStatements') as File[];

    // Debug logging
    console.log('📁 Files received:', files.length);
    files.forEach((file, index) => {
      console.log(`  File ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    });

    // Validate files are present
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one bank statement is required' },
        { status: 400 }
      );
    }

    // Check if we have email for sending confirmations
    const hasEmail = data.email && data.email.trim() !== '';
    const hasPhone = data.phone && data.phone.trim() !== '';
    const hasFullData = data.firstName && data.lastName && data.email;

    // Log contact info
    console.log('📧 Email provided:', data.email);
    console.log('📱 Phone provided:', data.phone);
    console.log('📧 Has full application data:', hasFullData);

    // Format the email content - ALWAYS include email and phone when provided
    const contactSection = (hasEmail || hasPhone) ? `
CONTACT INFORMATION:
${hasEmail ? `Email: ${data.email}\n` : ''}${hasPhone ? `Phone: ${data.phone}\n` : ''}` : '';

    const emailContent = hasFullData ? `
New Business Funding Application Received WITH BANK STATEMENTS

Application Details:

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

ATTACHMENTS:
${files.map((file, index) => `${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}

NOTE: This email contains BOTH watermarked AND original (non-watermarked) copies of each statement.

TRACKING:
${data.source ? `Source Button/Form: ${data.source}\n` : ''}${data.campaign ? `Campaign: ${data.campaign}\n` : ''}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

Action Required: Please contact the applicant within 2 hours.
    ` : `
Bank Statements Uploaded
${contactSection}
ATTACHMENTS:
${files.map((file, index) => `${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`).join('\n')}

NOTE: This email contains BOTH watermarked AND original (non-watermarked) copies of each statement.
${data.campaign ? `\nCampaign: ${data.campaign}` : ''}

Submitted: ${new Date().toLocaleString('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'full',
  timeStyle: 'long'
})}

Action Required: Please review the attached bank statements and contact the customer.
    `;

    // Log to console for debugging
    console.log('='.repeat(60));
    console.log('NEW APPLICATION WITH FILES RECEIVED');
    console.log('='.repeat(60));
    console.log(emailContent);
    console.log('='.repeat(60));

    // Send email notification to info@highlinefunding.com
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789_your_api_key_here') {
        // Dynamic import of Resend to avoid build-time issues
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Process files with watermarking - send BOTH watermarked AND original copies
        console.log('🖊️ Processing files with watermarks (will send BOTH copies)...');
        console.log(`🖊️ Total files to process: ${files.length}`);

        const attachments: { filename: string; content: Buffer }[] = [];

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          console.log(`  Processing file ${index + 1}/${files.length}: ${file.name}`);

          try {
            // Get the original file buffer first
            const originalBytes = await file.arrayBuffer();
            const originalBuffer = Buffer.from(originalBytes);

            // Create a new File object for watermarking (since arrayBuffer consumes the stream)
            const fileForWatermark = new File([originalBuffer], file.name, { type: file.type });

            // Get file extension and base name
            const ext = file.name.substring(file.name.lastIndexOf('.'));
            const baseName = file.name.substring(0, file.name.lastIndexOf('.'));

            // Add ORIGINAL (non-watermarked) copy first
            const originalFilename = `ORIGINAL_Statement${index + 1}_${baseName}${ext}`;
            attachments.push({
              filename: originalFilename,
              content: originalBuffer,
            });
            console.log(`    ✅ Added ORIGINAL: ${originalFilename}: ${originalBuffer.length} bytes`);

            // Try to create watermarked copy
            try {
              const { buffer: watermarkedBuffer, watermarked } = await processFileWithWatermark(fileForWatermark);

              if (watermarked) {
                const watermarkedFilename = `WATERMARKED_Statement${index + 1}_${baseName}${ext}`;
                attachments.push({
                  filename: watermarkedFilename,
                  content: watermarkedBuffer,
                });
                console.log(`    ✅ Added WATERMARKED: ${watermarkedFilename}: ${watermarkedBuffer.length} bytes`);
              } else {
                console.log(`    ⚠️ Watermarking failed for ${file.name}, only original included`);
              }
            } catch (wmErr: any) {
              console.error(`    ⚠️ Watermark error for ${file.name}: ${wmErr?.message || 'Unknown error'}`);
              console.log(`    📎 Only original copy will be sent`);
            }
          } catch (err: any) {
            console.error(`    ❌ FAILED to process file ${file.name}: ${err?.message}`);
          }
        }

        console.log(`🖊️ Finished processing. Attachments created: ${attachments.length}`);

        console.log(`📎 Total attachments prepared: ${attachments.length}`);
        attachments.forEach((att, index) => {
          console.log(`  Attachment ${index + 1}: ${att.filename}`);
        });

        // Calculate total attachment size
        const totalSize = attachments.reduce((sum, att) => sum + att.content.length, 0);
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
        console.log(`📎 Total attachment size: ${totalSizeMB} MB (${attachments.length} files)`);

        // Warn if attachments are large (Resend limit is 40MB)
        if (totalSize > 35 * 1024 * 1024) {
          console.warn('⚠️ Attachments are very large, may hit Resend limits');
        }

        // Build subject line with email/phone info
        let subjectLine: string;
        if (hasFullData) {
          subjectLine = `🔔 NEW LEAD (${attachments.length} FILES): ${data.firstName} ${data.lastName}${data.fundingAmount ? ` - ${data.fundingAmount}` : ''}`;
        } else if (hasEmail && hasPhone) {
          subjectLine = `📄 Bank Statements (${attachments.length} FILES) - ${data.email} - ${data.phone}`;
        } else if (hasEmail) {
          subjectLine = `📄 Bank Statements (${attachments.length} FILES) - ${data.email}`;
        } else if (hasPhone) {
          subjectLine = `📄 Bank Statements (${attachments.length} FILES) - Phone: ${data.phone}`;
        } else {
          subjectLine = `📄 Bank Statements Uploaded (${attachments.length} FILES)`;
        }

        // Add campaign to subject if present
        if (data.campaign) {
          subjectLine = `[${data.campaign}] ${subjectLine}`;
        }

        // Send notification email to info@highlinefunding.com with attachments
        console.log('📧 Attempting to send notification email with attachments to info@highlinefunding.com...');
        console.log(`📧 Sending ${attachments.length} attachments to info@highlinefunding.com`);
        console.log(`📧 Subject: ${subjectLine}`);

        const notificationResult = await resend.emails.send({
          from: 'Highline Funding Applications <info@highlinefunding.com>',
          to: 'info@highlinefunding.com',
          subject: subjectLine,
          text: emailContent,
          replyTo: hasEmail ? data.email : undefined,
          attachments: attachments,
        });

        console.log('✅ Notification email with attachments sent! ID:', notificationResult.data?.id);

        // Log if there was an error in the response
        if (notificationResult.error) {
          console.error('❌ Resend reported an error:', notificationResult.error);
        }

        // Send confirmation email to applicant if we have their email
        if (hasEmail) {
          console.log('📧 Attempting to send confirmation email to applicant:', data.email);
          const firstName = data.firstName || 'Valued Customer';
          const confirmationResult = await resend.emails.send({
            from: 'Highline Funding <info@highlinefunding.com>',
            to: data.email,
            subject: `One More Step - Complete Your Application${data.firstName ? ` for ${data.firstName}` : ''}`,
            html: generateUploadConfirmationEmail({
              firstName: firstName,
              lastName: data.lastName || '',
              fundingAmount: data.fundingAmount || '',
              businessName: data.businessName || '',
            }),
            text: `Dear ${firstName},\n\nGreat news! We've received your bank statements.\n\n✓ Bank Statements Received\n\nFINAL STEP!\nUpload your Driver's License and Void Check to complete your application:\nhttps://highlinefunding.com/dlvc\n\nWhat's Next:\n1. Upload Driver's License & Void Check\n2. Our team reviews your information\n3. Get funded - some lenders offer same-day funding!\n\nQuestions? Call us at (305) 515-7319\n\nBest regards,\nHighline Funding Team\n1101 Brickell Ave, South Tower, Miami, FL 33131`,
          });
          console.log('✅ Confirmation email sent! ID:', confirmationResult.data?.id);
          console.log('✅ BOTH emails sent successfully!');
        } else {
          console.log('⚠️ No applicant email available - only notification email sent');
        }
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

    // Send SMS notifications (INDEPENDENT of email - always try to send if we have phone)
    if (hasPhone) {
      try {
        console.log('📱 Attempting to send SMS notifications...');

        const customerName = data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : data.email || 'Unknown';

        // SMS to team
        const teamResult = await sendSMS({
          to: process.env.TEAM_PHONE_NUMBER || '3055157319',
          message: smsTemplates.bankStatementsToTeam(
            customerName,
            data.businessName || 'Not provided',
            files.length,
            data.email || undefined,
            data.phone || undefined
          ),
        });
        console.log('📱 Team SMS result:', teamResult);

        // SMS to applicant with link to next step (/dlvc)
        const applicantResult = await sendSMS({
          to: data.phone,
          message: smsTemplates.bankStatementsToApplicant(data.firstName || 'Valued Customer'),
        });
        console.log('📱 Applicant SMS result:', applicantResult);

        console.log('✅ SMS notifications sent!');
      } catch (smsError: any) {
        console.error('⚠️ SMS error (non-critical):', smsError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully with bank statements',
      applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      filesUploaded: files.length,
    });

  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    );
  }
}
