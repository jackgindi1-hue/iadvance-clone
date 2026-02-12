'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Lock, Clock, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const DOCUSIGN_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&env=na4&acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&v=2";

export default function DocuSignPage() {
  const [docusignLoading, setDocusignLoading] = useState(true);
  const [docusignError, setDocusignError] = useState(false);
  const [docusignKey, setDocusignKey] = useState(0);

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-3 px-3 md:py-4 md:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image
              src="/logo-final.png"
              alt="Highline Funding Logo"
              width={200}
              height={60}
              className="object-contain w-[120px] h-auto md:w-[200px]"
            />
          </Link>
          <a href="tel:305-515-7319" className="hidden md:flex items-center gap-3">
            <Phone className="w-8 h-8 text-[#FF8C42] flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-700">Questions? Call Us!</span>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-gray-600">Live Agents Standing By:</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                </span>
              </div>
              <span className="text-2xl font-bold text-black">305-515-7319</span>
            </div>
          </a>
        </div>
      </header>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 px-6">
          <Phone className="w-6 h-6 text-black flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-white">Questions? Tap to call!</span>
            <span className="text-lg font-bold text-black">305-515-7319</span>
          </div>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Complete Your Application
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Just three simple steps to get funded!
            </p>
          </div>

          {/* Step 1: DocuSign */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Step 1: Owner & Business Verification</h2>
                <p className="text-gray-600">
                  Zero impact to your credit score (Minimum 500 credit score to qualify)
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 relative">
              {docusignLoading && !docusignError && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 min-h-[400px]">
                  <Loader2 className="w-12 h-12 text-[#FF8C42] animate-spin mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">Loading Owner & Business Verification...</p>
                  <p className="text-sm text-gray-600 text-center max-w-md px-4">
                    Please wait while we load the secure form.
                  </p>
                </div>
              )}

              {docusignError && (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Form not displaying correctly?</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Click the link below to complete your verification.
                  </p>
                  <a
                    href={DOCUSIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#FF8C42] hover:text-[#FF7028] font-semibold text-lg underline"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Click here to open verification in a new window
                  </a>
                </div>
              )}

              {!docusignError && (
                <iframe
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
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Form not displaying correctly?</p>
              <a
                href={DOCUSIGN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#FF8C42] hover:text-[#FF7028] font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Click here to open verification in a new window
              </a>
            </div>
          </div>

          {/* Step 2: Bank Statements */}
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 md:p-8 mb-6 opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-500">Step 2: Upload Bank Statements</h2>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
                <p className="text-gray-400">Complete Step 1 first, then upload your bank statements</p>
              </div>
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">This step will be available after completing identity verification</p>
              <Link href="/upload" className="inline-block mt-4 text-[#FF8C42] font-semibold hover:underline">
                Go to Upload Page
              </Link>
            </div>
          </div>

          {/* Step 3: Get Funded */}
          <div className="bg-gray-100 rounded-2xl shadow-lg p-6 md:p-8 mb-8 opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-500">Step 3: Get Funded</h2>
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
                <p className="text-gray-400">We will take it from here once you complete the steps above</p>
              </div>
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">A funding specialist will contact you after all steps are completed</p>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-4">Need Help or Have Questions?</p>
            <a href="tel:3055157319" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105">
              <Phone className="inline-block w-5 h-5 mr-2" />
              Call (305) 515-7319
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <Image src="/logo-final.png" alt="Highline Funding Logo" width={200} height={60} className="mx-auto mb-4 object-contain" />
          <p className="text-sm text-gray-600">© 2025 Highline Funding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
