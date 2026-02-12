// Email templates for DLVC submissions

interface EmailData {
  firstName: string;
  lastName: string;
  fundingAmount: string;
  businessName?: string;
}

export function generateDLVCConfirmationEmail(data: EmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Complete - Highline Funding</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header with Celebration -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px; text-align: center;">
              <img src="https://highlinefunding.com/logo-final.png" alt="Highline Funding" style="height: 50px; margin-bottom: 20px;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Application Complete!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 18px;">You're all set, ${data.firstName}!</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <!-- Completion Checklist -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <h2 style="margin: 0 0 20px; color: #166534; font-size: 18px; text-align: center;">✅ All Documents Received</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top">
                                <span style="color: #22c55e; font-size: 18px;">✓</span>
                              </td>
                              <td style="color: #166534; font-size: 16px;">Driver's License Received</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top">
                                <span style="color: #22c55e; font-size: 18px;">✓</span>
                              </td>
                              <td style="color: #166534; font-size: 16px;">Void Check Received</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="30" valign="top">
                                <span style="color: #22c55e; font-size: 18px;">✓</span>
                              </td>
                              <td style="color: #166534; font-size: 16px;">Application Under Review</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 25px; text-align: center;">
                A dedicated funding specialist will contact you within <strong>24 hours</strong> to discuss your funding options and finalize your application.
              </p>

              <!-- What Happens Next -->
              <h2 style="color: #333; font-size: 20px; margin: 30px 0 15px; text-align: center;">What Happens Next?</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding: 15px; background-color: #fef3c7; border-radius: 10px; margin-bottom: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="60" valign="top">
                          <div style="width: 40px; height: 40px; background-color: #fbbf24; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">1</div>
                        </td>
                        <td valign="top">
                          <strong style="color: #92400e; font-size: 16px;">Identity Verification</strong>
                          <p style="margin: 5px 0 0; color: #78350f; font-size: 14px;">We'll verify your driver's license</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td height="10"></td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #dbeafe; border-radius: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="60" valign="top">
                          <div style="width: 40px; height: 40px; background-color: #3b82f6; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">2</div>
                        </td>
                        <td valign="top">
                          <strong style="color: #1e40af; font-size: 16px;">Final Underwriting</strong>
                          <p style="margin: 5px 0 0; color: #1e3a8a; font-size: 14px;">We'll complete the final review</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td height="10"></td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #dcfce7; border-radius: 10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="60" valign="top">
                          <div style="width: 40px; height: 40px; background-color: #22c55e; border-radius: 50%; text-align: center; line-height: 40px; color: white; font-weight: bold; font-size: 18px;">3</div>
                        </td>
                        <td valign="top">
                          <strong style="color: #166534; font-size: 16px;">Get Funded! 🎉</strong>
                          <p style="margin: 5px 0 0; color: #15803d; font-size: 14px;">Sign your contract and receive your funds</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin-top: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 15px; color: #64748b; font-size: 14px;">Questions? Our team is here to help!</p>
                    <a href="tel:3055157319" style="display: inline-block; background-color: #FF8C42; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 50px; font-size: 16px; font-weight: bold;">
                      📞 Call (305) 515-7319
                    </a>
                  </td>
                </tr>
              </table>
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
