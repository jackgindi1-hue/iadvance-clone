// Email templates for funding applications

interface EmailData {
  firstName: string;
  lastName: string;
  fundingAmount: string;
  businessName?: string;
}

export function generateConfirmationEmail(data: EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Received - Highline Funding</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF8C42 0%, #FF6B20 100%); padding: 30px; text-align: center;">
              <img src="https://highlinefunding.com/logo-final.png" alt="Highline Funding" style="height: 50px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Application Received!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333; margin: 0 0 20px;">Dear ${data.firstName},</p>

              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px;">
                Great news! Your funding application has been received and is being reviewed by our team.
              </p>

              <!-- Status Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50" valign="top">
                          <div style="width: 40px; height: 40px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 40px;">
                            <span style="color: white; font-size: 20px;">✓</span>
                          </div>
                        </td>
                        <td valign="top">
                          <h3 style="margin: 0 0 5px; color: #166534; font-size: 18px;">Application Submitted</h3>
                          <p style="margin: 0; color: #15803d; font-size: 14px;">Your application is now being processed</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h2 style="color: #333; font-size: 20px; margin: 30px 0 15px;">What Happens Next?</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">1.</td>
                        <td>
                          <strong style="color: #333;">Upload Bank Statements</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Upload your last 3 months of business bank statements</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">2.</td>
                        <td>
                          <strong style="color: #333;">Specialist Review</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">A dedicated funding specialist will review your application</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">3.</td>
                        <td>
                          <strong style="color: #333;">Get Funded!</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Receive your funds - some lenders offer same-day approval!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://highlinefunding.com/upload" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                      Upload Bank Statements →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #888; text-align: center; margin: 25px 0 0;">
                Questions? Call us at <a href="tel:3055157319" style="color: #FF8C42; text-decoration: none; font-weight: bold;">(305) 515-7319</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0 0 10px;">Highline Funding</p>
              <p style="color: #666; font-size: 12px; margin: 0;">1101 Brickell Ave, South Tower, Miami, FL 33131</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateUploadConfirmationEmail(data: EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bank Statements Received - Highline Funding</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center;">
              <img src="https://highlinefunding.com/logo-final.png" alt="Highline Funding" style="height: 50px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Bank Statements Received!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333; margin: 0 0 20px;">Dear ${data.firstName},</p>

              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px;">
                Great news! We've received your bank statements and your application is moving forward.
              </p>

              <!-- Status Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50" valign="top">
                          <div style="width: 40px; height: 40px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 40px;">
                            <span style="color: white; font-size: 20px;">✓</span>
                          </div>
                        </td>
                        <td valign="top">
                          <h3 style="margin: 0 0 5px; color: #166534; font-size: 18px;">Bank Statements Received</h3>
                          <p style="margin: 0; color: #15803d; font-size: 14px;">Your documents have been uploaded successfully</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Final Step Alert -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff7ed; border: 2px solid #FF8C42; border-radius: 12px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <h3 style="margin: 0 0 10px; color: #c2410c; font-size: 20px;">FINAL STEP!</h3>
                    <p style="margin: 0; color: #9a3412; font-size: 16px;">
                      Upload your Driver's License and Void Check to complete your application
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://highlinefunding.com/dlvc" style="display: inline-block; background-color: #FF8C42; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                      Complete Application →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <h2 style="color: #333; font-size: 20px; margin: 30px 0 15px;">What's Next?</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">1.</td>
                        <td>
                          <strong style="color: #333;">Upload Driver's License & Void Check</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Final documents needed for verification</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #eee;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">2.</td>
                        <td>
                          <strong style="color: #333;">Team Reviews Your Application</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Our specialists will review everything</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="30" valign="top" style="color: #FF8C42; font-weight: bold; font-size: 16px;">3.</td>
                        <td>
                          <strong style="color: #333;">Get Funded!</strong>
                          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Some lenders offer same-day funding!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #888; text-align: center; margin: 25px 0 0;">
                Questions? Call us at <a href="tel:3055157319" style="color: #FF8C42; text-decoration: none; font-weight: bold;">(305) 515-7319</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0 0 10px;">Highline Funding</p>
              <p style="color: #666; font-size: 12px; margin: 0;">1101 Brickell Ave, South Tower, Miami, FL 33131</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
