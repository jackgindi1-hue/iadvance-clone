'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Mail, ChevronDown, ChevronUp, LogIn, Lock } from 'lucide-react';
import Link from 'next/link';

const ADMIN_USERNAME = 'highline';
const ADMIN_PASSWORD = 'funding2025';

const generateEmailHTML = (bodyContent: string, buttonText: string, buttonUrl: string) => {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Highline Funding</title></head><body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;"><tr><td style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #FF8C42;"><img src="https://highlinefunding.com/logo-final.png" alt="Highline Funding" width="280" /></td></tr><tr><td style="padding: 40px 30px;">${bodyContent}<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;"><tr><td align="center"><a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 16px; font-weight: bold;">${buttonText}</a></td></tr></table></td></tr><tr><td style="background-color: #1a1a1a; padding: 30px;"><p style="color: #666666; font-size: 12px; text-align: center;">© 2025 Highline Funding. All rights reserved.</p></td></tr></table></td></tr></table></body></html>`;
};

const EMAIL_BODIES = [
  { id: 1, name: 'Email 1 - First Outreach (No Answer)', description: 'Send when you tried calling but couldn\'t reach them', subject: 'Following Up - Your Monthly Check-In | Highline Funding', defaultButtonText: 'Complete Owner Verification', defaultButtonUrl: 'https://highlinefunding.com/upload', body: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Hello <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">I just tried reaching you for your regularly scheduled monthly check-in regarding your open advance with our strategic partner.</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">Please use the secure link below to re-verify your business details. Once completed, we'll be able to present an updated offer with improved terms.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Thank you,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 2, name: 'Email 2 - After Phone Call', description: 'Send immediately after speaking with them on the phone', subject: 'Great Speaking With You - Next Steps | Highline Funding', defaultButtonText: 'Complete Owner Verification', defaultButtonUrl: 'https://highlinefunding.com/upload', body: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Hello <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">Thank you again for your time on the phone just now. As discussed, please use the link below to re-verify your business details.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 3, name: 'Email 3 - Follow-Up Reminder', description: 'Send 2-3 days after initial outreach if no response', subject: 'Quick Reminder - Verify Your Details | Highline Funding', defaultButtonText: 'Complete Owner Verification', defaultButtonUrl: 'https://highlinefunding.com/upload', body: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Hi again <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">Just reaching out regarding your monthly check-in. Please use the secure link below to re-verify your business details.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Thank you,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 4, name: 'Email 4 - Urgency / Limited Time Offer', description: 'Send to create urgency about improved terms expiring', subject: 'Time-Sensitive: Your Improved Offer | Highline Funding', defaultButtonText: 'Verify & Lock In Your Offer', defaultButtonUrl: 'https://highlinefunding.com/upload', body: `<div style="background-color: #fef3c7; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px;"><p style="color: #92400e; font-size: 14px; font-weight: bold; margin: 0;">⚡ Action Required - Improved Terms Available for a Limited Time</p></div><p style="color: #333333; font-size: 16px; line-height: 1.6;">Hello <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">Based on your positive payment history, you're currently eligible for <strong>improved terms</strong> on a new offer.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 5, name: 'Email 5 - Final Follow-Up / Last Chance', description: 'Send as final attempt before closing the opportunity', subject: 'Last Chance to Secure Your Improved Terms | Highline Funding', defaultButtonText: 'Complete Verification Now', defaultButtonUrl: 'https://highlinefunding.com/upload', body: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Hi <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">I've reached out a few times now and wanted to try one last time before I close out your file.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Wishing you continued success,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 6, name: 'Email 6 - DLVC Request (Identity Verification)', description: 'Send after bank statements received - request driver license & void check', subject: 'Final Step: Complete Your Identity Verification | Highline Funding', defaultButtonText: 'Complete Identity Verification', defaultButtonUrl: 'https://highlinefunding.com/dlvc', body: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Hello <strong>**REPLACE_WITH_FIRST_NAME**</strong>,</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">Great news! We've received your bank statements and your application is almost complete.</p><p style="color: #333333; font-size: 16px; line-height: 1.6;"><strong>Just one final step:</strong> Please complete your identity verification by uploading your driver's license and a void check.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Thank you,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` },
  { id: 7, name: 'Email 7 - Application Complete (After DLVC)', description: 'Send after identity verification complete - confirm everything received', subject: 'Application Complete - What Happens Next | Highline Funding', defaultButtonText: 'Visit Highline Funding', defaultButtonUrl: 'https://highlinefunding.com', body: `<div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 0 0 20px 0; text-align: center; border: 2px solid #22c55e;"><p style="color: #166534; font-size: 18px; font-weight: bold; margin: 0;">✓ Your Application is Complete!</p></div><p style="color: #333333; font-size: 16px; line-height: 1.6;">Congratulations <strong>**REPLACE_WITH_FIRST_NAME**</strong>!</p><p style="color: #333333; font-size: 16px; line-height: 1.6;">We've received all of your documents and your application is now complete. Our underwriting team will review your application within 24 hours.</p>`, closing: `<p style="color: #333333; font-size: 16px; line-height: 1.6;">Best regards,<br><strong>**REPLACE_WITH_YOUR_NAME**</strong></p>` }
];

export default function EmailTemplatesPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [expandedEmail, setExpandedEmail] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedSubject, setCopiedSubject] = useState<number | null>(null);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('hlf_logged_in');
    if (loggedIn === 'true') { setIsLoggedIn(true); }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('hlf_logged_in', 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else { setLoginError('Invalid username or password'); }
  };

  const getFullEmailHTML = (template: typeof EMAIL_BODIES[0]) => {
    const fullBody = template.body + template.closing;
    return generateEmailHTML(fullBody, template.defaultButtonText, template.defaultButtonUrl);
  };

  const copyToClipboard = (text: string, id: number, type: 'html' | 'subject') => {
    navigator.clipboard.writeText(text);
    if (type === 'html') { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); }
    else { setCopiedSubject(id); setTimeout(() => setCopiedSubject(null), 2000); }
  };

  if (isLoading) {
    return (<div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-[#FF8C42] border-t-transparent rounded-full"></div></div>);
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div>
            <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600 mt-2">Login required to access email templates</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent outline-none" placeholder="Enter username" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent outline-none" placeholder="Enter password" />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FF7028] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition flex items-center justify-center gap-2"><LogIn className="w-5 h-5" />Login</button>
          </form>
          <div className="mt-6 text-center"><Link href="/ptns" className="text-[#FF8C42] hover:underline text-sm">← Back to Partner Tools</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center"><Mail className="w-6 h-6 text-white" /></div>
              <div><h1 className="text-2xl font-bold text-gray-900">Email Templates</h1><p className="text-gray-600">7 Follow-Up Email Templates for Your CRM</p></div>
            </div>
            <Link href="/ptns" className="text-[#FF8C42] hover:underline text-sm">← Back to Partner Tools</Link>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 mb-2">Variables to Replace:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">**REPLACE_WITH_FIRST_NAME**</code> → Customer&apos;s first name</li>
              <li><code className="bg-blue-100 px-2 py-0.5 rounded">**REPLACE_WITH_YOUR_NAME**</code> → Your name (the sender)</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {EMAIL_BODIES.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <button onClick={() => setExpandedEmail(expandedEmail === template.id ? null : template.id)} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${template.id >= 6 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-[#FF8C42] to-[#FF7028]'}`}>{template.id}</div>
                  <div className="text-left"><h2 className="text-lg font-bold text-gray-900">{template.name}</h2><p className="text-sm text-gray-600">{template.description}</p></div>
                </div>
                {expandedEmail === template.id ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
              </button>
              {expandedEmail === template.id && (
                <div className="border-t">
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <div><span className="text-sm font-semibold text-gray-600">Subject Line:</span><p className="text-gray-900 font-medium">{template.subject}</p></div>
                    <button onClick={() => copyToClipboard(template.subject, template.id, 'subject')} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm font-medium transition">
                      {copiedSubject === template.id ? (<><Check className="w-4 h-4 text-green-600" />Copied!</>) : (<><Copy className="w-4 h-4" />Copy Subject</>)}
                    </button>
                  </div>
                  <div className="p-4 bg-blue-50 border-b flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-900">Button links to:</span>
                    <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-medium">{template.defaultButtonUrl}</code>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Email Preview:</h3>
                      <button onClick={() => copyToClipboard(getFullEmailHTML(template), template.id, 'html')} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition">
                        {copiedId === template.id ? (<><Check className="w-4 h-4" />HTML Copied!</>) : (<><Copy className="w-4 h-4" />Copy HTML</>)}
                      </button>
                    </div>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-100"><iframe srcDoc={getFullEmailHTML(template)} className="w-full h-[500px]" title={`Email ${template.id} Preview`} /></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
