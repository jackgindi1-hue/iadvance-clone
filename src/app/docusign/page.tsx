'use client';
// BUILD_VERSION: 2026-01-30-v15-IFRAME-WITH-ERROR
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Lock, Clock, ShieldCheck, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
// DocuSign URL
const DOCUSIGN_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&amp;env=na4&amp;acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&amp;v=2";
export default function DocuSignPage() {
  // DocuSign iframe state
  const [docusignLoading, setDocusignLoading] = useState(true);
  const [docusignError, setDocusignError] = useState(false);
  const [docusignKey, setDocusignKey] = useState(0);
  // Timeout to detect if iframe fails to load
  useEffect(() => {
    if (docusignLoading) {
      const timeout = setTimeout(() => {
        if (docusignLoading) {
          setDocusignError(true);
          setDocusignLoading(false);
        }
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [docusignLoading, docusignKey]);
  const handleDocusignLoad = useCallback(() => {
    setDocusignLoading(false);
    setDocusignError(false);
  }, []);
  return (
    &lt;div className="min-h-screen bg-white flex flex-col"&gt;
      {/* Header */}
      &lt;header className="bg-white border-b py-3 px-3 md:py-4 md:px-6 shadow-sm sticky top-0 z-50"&gt;
        &lt;div className="max-w-7xl mx-auto flex justify-between items-center"&gt;
          &lt;Link href="/"&gt;
            &lt;Image
              src="/logo-final.png"
              alt="Highline Funding Logo"
              width={200}
              height={60}
              className="object-contain w-[120px] h-auto md:w-[200px]"
            /&gt;
          &lt;/Link&gt;
          {/* Desktop Phone */}
          &lt;a href="tel:305-515-7319" className="hidden md:flex items-center gap-3 phone-hover"&gt;
            &lt;Phone className="w-8 h-8 phone-ring text-[#FF8C42] flex-shrink-0" /&gt;
            &lt;div className="flex flex-col items-start"&gt;
              &lt;span className="text-sm font-semibold text-gray-700"&gt;Questions? Call Us!&lt;/span&gt;
              &lt;div className="flex items-center gap-2 mb-0.5"&gt;
                &lt;span className="text-xs text-gray-600"&gt;Live Agents Standing By:&lt;/span&gt;
                &lt;span className="relative flex h-2.5 w-2.5"&gt;
                  &lt;span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"&gt;&lt;/span&gt;
                  &lt;span className="relative inline-flex rounded-full h-full w-full bg-green-500"&gt;&lt;/span&gt;
                &lt;/span&gt;
              &lt;/div&gt;
              &lt;span className="text-2xl font-bold text-black"&gt;305-515-7319&lt;/span&gt;
            &lt;/div&gt;
          &lt;/a&gt;
        &lt;/div&gt;
      &lt;/header&gt;
      {/* Mobile Sticky Footer - Phone */}
      &lt;div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg"&gt;
        &lt;a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 px-6"&gt;
          &lt;Phone className="w-6 h-6 text-black flex-shrink-0" /&gt;
          &lt;div className="flex flex-col items-start"&gt;
            &lt;span className="text-xs font-semibold text-white"&gt;Questions? Tap to call!&lt;/span&gt;
            &lt;span className="text-lg font-bold text-black"&gt;305-515-7319&lt;/span&gt;
          &lt;/div&gt;
        &lt;/a&gt;
      &lt;/div&gt;
      {/* Main Content */}
      &lt;div className="flex-grow bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-8 pb-24 md:pb-8"&gt;
        &lt;div className="max-w-5xl mx-auto"&gt;
          {/* Page Title */}
          &lt;div className="text-center mb-8"&gt;
            &lt;h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"&gt;
              Complete Your Application
            &lt;/h1&gt;
            &lt;p className="text-lg md:text-xl text-gray-600"&gt;
              Just three simple steps to get funded!
            &lt;/p&gt;
          &lt;/div&gt;
          {/* Step 1: DocuSign - ACTIVE */}
          &lt;div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"&gt;
            &lt;div className="flex items-center gap-3 mb-6"&gt;
              &lt;div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl"&gt;
                1
              &lt;/div&gt;
              &lt;div&gt;
                &lt;h2 className="text-2xl font-bold text-gray-900"&gt;Step 1: Owner &amp; Business Verification&lt;/h2&gt;
                &lt;p className="text-gray-600 "&gt;
                  Zero impact to your credit score (Minimum 500 credit score to qualify)
                &lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            {/* DocuSign iframe for all devices with error handling */}
            &lt;div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 relative"&gt;
              {docusignLoading &amp;&amp; !docusignError &amp;&amp; (
                &lt;div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 min-h-[400px]"&gt;
                  &lt;Loader2 className="w-12 h-12 text-[#FF8C42] animate-spin mb-4" /&gt;
                  &lt;p className="text-lg font-semibold text-gray-900 mb-2"&gt;Loading Owner &amp; Business Verification...&lt;/p&gt;
                  &lt;p className="text-sm text-gray-600 text-center max-w-md px-4"&gt;
                    Please wait while we load the secure form.
                  &lt;/p&gt;
                &lt;/div&gt;
              )}
              {docusignError &amp;&amp; (
                &lt;div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center"&gt;
                  &lt;AlertCircle className="w-16 h-16 text-orange-500 mb-4" /&gt;
                  &lt;h3 className="text-xl font-bold text-gray-900 mb-2"&gt;Form not displaying correctly?&lt;/h3&gt;
                  &lt;p className="text-gray-600 mb-6 max-w-md"&gt;
                    Click the link below to complete your verification.
                  &lt;/p&gt;
                  &lt;a
                    href={DOCUSIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#FF8C42] hover:text-[#FF7028] font-semibold text-lg underline"
                  &gt;
                    &lt;ExternalLink className="w-5 h-5" /&gt;
                    Click here to open verification in a new window
                  &lt;/a&gt;
                &lt;/div&gt;
              )}
              {!docusignError &amp;&amp; (
                &lt;iframe
                  key={docusignKey}
                  src={DOCUSIGN_URL}
                  width="100%"
                  height="800"
                  frameBorder="0"
                  className={`w-full transition-opacity duration-300 ${docusignLoading ? 'opacity-0' : 'opacity-100'}`}
                  title="DocuSign Identity Verification"
                  onLoad={handleDocusignLoad}
                  allow="geolocation; microphone; camera"
                  referrerPolicy="no-referrer-when-downgrade"
                /&gt;
              )}
            &lt;/div&gt;
            {/* Fallback link always visible */}
            &lt;div className="mt-4 text-center"&gt;
              &lt;p className="text-sm text-gray-500 mb-2"&gt;Form not displaying correctly?&lt;/p&gt;
              &lt;a
                href={DOCUSIGN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FF8C42] hover:text-[#FF7028] font-medium text-sm"
              &gt;
                &lt;ExternalLink className="w-4 h-4" /&gt;
                Click here to open verification in a new window
              &lt;/a&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          {/* Step 2: Bank Statements - PENDING */}
          &lt;div className="bg-gray-100 rounded-2xl shadow-lg p-6 md:p-8 mb-6 opacity-60"&gt;
            &lt;div className="flex items-center gap-3 mb-4"&gt;
              &lt;div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl"&gt;
                2
              &lt;/div&gt;
              &lt;div className="flex-1"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;h2 className="text-xl font-bold text-gray-500"&gt;Step 2: Upload Bank Statements&lt;/h2&gt;
                  &lt;span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"&gt;
                    &lt;Clock className="w-3 h-3" /&gt;
                    Pending
                  &lt;/span&gt;
                &lt;/div&gt;
                &lt;p className="text-gray-400"&gt;Complete Step 1 first, then upload your bank statements&lt;/p&gt;
              &lt;/div&gt;
              &lt;Lock className="w-6 h-6 text-gray-400" /&gt;
            &lt;/div&gt;
            &lt;div className="bg-gray-200 rounded-xl p-8 text-center"&gt;
              &lt;p className="text-gray-500"&gt;This step will be available after completing identity verification&lt;/p&gt;
              &lt;Link href="/upload" className="inline-block mt-4 text-[#FF8C42] font-semibold hover:underline"&gt;
                Go to Upload Page →
              &lt;/Link&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          {/* Step 3: Get Funded - PENDING */}
          &lt;div className="bg-gray-100 rounded-2xl shadow-lg p-6 md:p-8 mb-8 opacity-60"&gt;
            &lt;div className="flex items-center gap-3 mb-4"&gt;
              &lt;div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl"&gt;
                3
              &lt;/div&gt;
              &lt;div className="flex-1"&gt;
                &lt;div className="flex items-center gap-2"&gt;
                  &lt;h2 className="text-xl font-bold text-gray-500"&gt;Step 3: Get Funded&lt;/h2&gt;
                  &lt;span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1"&gt;
                    &lt;Clock className="w-3 h-3" /&gt;
                    Pending
                  &lt;/span&gt;
                &lt;/div&gt;
                &lt;p className="text-gray-400"&gt;We'll take it from here once you complete the steps above&lt;/p&gt;
              &lt;/div&gt;
              &lt;Lock className="w-6 h-6 text-gray-400" /&gt;
            &lt;/div&gt;
            &lt;div className="bg-gray-200 rounded-xl p-8 text-center"&gt;
              &lt;p className="text-gray-500"&gt;A funding specialist will contact you after all steps are completed&lt;/p&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          {/* Help Section */}
          &lt;div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center"&gt;
            &lt;p className="text-xl font-semibold text-gray-900 mb-4"&gt;Need Help or Have Questions?&lt;/p&gt;
            &lt;a href="tel:3055157319" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105"&gt;
              &lt;Phone className="inline-block w-5 h-5 mr-2" /&gt;
              Call (305) 515-7319
            &lt;/a&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
      {/* Footer */}
      &lt;footer className="py-8 md:py-16 px-4 md:px-6 bg-white border-t mt-auto"&gt;
        &lt;div className="max-w-7xl mx-auto"&gt;
          {/* Mobile Layout */}
          &lt;div className="md:hidden space-y-6"&gt;
            &lt;div className="flex justify-between items-start gap-4"&gt;
              &lt;div className="space-y-3"&gt;
                &lt;div className="inline-block bg-white rounded-lg px-3 py-2"&gt;
                  &lt;Image src="/logo-final.png" alt="Highline Funding Logo" width={140} height={40} className="object-contain" /&gt;
                &lt;/div&gt;
                &lt;div className="text-gray-600 space-y-2"&gt;
                  &lt;div className="flex flex-col gap-1 text-xs"&gt;
                    &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Terms &amp; Conditions&lt;/a&gt;
                    &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Privacy Policy&lt;/a&gt;
                    &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Contact Us&lt;/a&gt;
                  &lt;/div&gt;
                  &lt;p className="text-xs"&gt;&amp;copy; 2025 Highline Funding. All rights reserved.&lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;
              &lt;div className="flex-shrink-0"&gt;
                &lt;h4 className="text-sm font-bold mb-3 text-black"&gt;Get In Touch&lt;/h4&gt;
                &lt;div className="space-y-2"&gt;
                  &lt;div className="flex items-start gap-2"&gt;
                    &lt;Phone className="w-3 h-3 text-[#FF8C42] flex-shrink-0 mt-1" /&gt;
                    &lt;div&gt;
                      &lt;p className="text-[10px] text-gray-600 mb-0.5"&gt;Phone&lt;/p&gt;
                      &lt;a href="tel:305-515-7319" className="text-xs text-black font-semibold hover:text-[#FF8C42] transition"&gt;305-515-7319&lt;/a&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          {/* Desktop Layout */}
          &lt;div className="hidden md:grid md:grid-cols-2 gap-12 items-start"&gt;
            &lt;div className="space-y-6"&gt;
              &lt;div className="inline-block bg-white rounded-lg px-6 py-3"&gt;
                &lt;Image src="/logo-final.png" alt="Highline Funding Logo" width={280} height={80} className="object-contain" /&gt;
              &lt;/div&gt;
              &lt;div className="text-gray-600 space-y-2"&gt;
                &lt;div className="flex flex-wrap gap-4 text-sm"&gt;
                  &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Terms &amp; Conditions&lt;/a&gt;
                  &lt;span&gt;|&lt;/span&gt;
                  &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Privacy Policy&lt;/a&gt;
                  &lt;span&gt;|&lt;/span&gt;
                  &lt;a href="#" className="hover:text-[#FF8C42] transition"&gt;Contact Us&lt;/a&gt;
                &lt;/div&gt;
                &lt;p className="text-sm"&gt;&amp;copy; 2025 Highline Funding. All rights reserved.&lt;/p&gt;
                &lt;div className="mt-6 pt-6 border-t border-gray-200"&gt;
                  &lt;p className="text-xs font-semibold text-gray-700 mb-2"&gt;Important Information About Procedures for Opening a New Account&lt;/p&gt;
                  &lt;p className="text-xs text-gray-600 leading-relaxed"&gt;
                    To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account.
                  &lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
            &lt;div className="ml-auto max-w-md"&gt;
              &lt;h4 className="text-2xl font-bold mb-6 text-black"&gt;Get In Touch&lt;/h4&gt;
              &lt;div className="space-y-4"&gt;
                &lt;div className="flex items-start gap-3"&gt;
                  &lt;Phone className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-1" /&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm text-gray-600 mb-1"&gt;Phone&lt;/p&gt;
                    &lt;a href="tel:305-515-7319" className="text-base text-black font-semibold hover:text-[#FF8C42] transition"&gt;305-515-7319&lt;/a&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="flex items-start gap-3"&gt;
                  &lt;svg className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
                    &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /&gt;
                  &lt;/svg&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm text-gray-600 mb-1"&gt;Email&lt;/p&gt;
                    &lt;a href="mailto:info@highlinefunding.com" className="text-base text-black font-semibold hover:text-[#FF8C42] transition"&gt;info@highlinefunding.com&lt;/a&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
                &lt;div className="flex items-start gap-3"&gt;
                  &lt;svg className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
                    &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /&gt;
                    &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /&gt;
                  &lt;/svg&gt;
                  &lt;div&gt;
                    &lt;p className="text-sm text-gray-600 mb-1"&gt;Address&lt;/p&gt;
                    &lt;p className="text-base text-black"&gt;1101 Brickell Ave, South Tower&lt;br /&gt;Miami, FL 33131&lt;/p&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/footer&gt;
      &lt;style jsx global&gt;{`
        .phone-hover:hover .phone-ring {
          animation: ring 1s ease-in-out;
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
      `}&lt;/style&gt;
    &lt;/div&gt;
  );
}