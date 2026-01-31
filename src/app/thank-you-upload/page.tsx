'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Check } from 'lucide-react';

function ThankYouUploadContent() {
  const searchParams = useSearchParams();
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const businessName = searchParams.get('businessName') || 'Your Business';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-3 px-3 md:py-5 md:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center bg-white rounded-lg px-1 py-1 md:px-4 md:py-2 flex-shrink-0 cursor-pointer hover:opacity-90 transition">
            <Image src="/logo-final.png" alt="Highline Funding Logo" width={280} height={80} className="object-contain w-[120px] h-auto md:w-[280px]" />
          </Link>
          <div className="flex items-center gap-3 md:gap-6">
            <a href="tel:305-515-7319" className="hidden md:flex items-center gap-2 md:gap-3 phone-hover">
              <Phone className="w-7 h-7 md:w-8 md:h-8 phone-ring text-[#FF8C42] flex-shrink-0" />
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm font-semibold text-gray-700 whitespace-nowrap">Questions? Call Us!</span>
                <span className="text-lg md:text-2xl font-bold text-black whitespace-nowrap">305-515-7319</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow bg-gradient-to-br from-green-50 via-green-100 to-blue-50 px-4 py-12 pb-24 md:pb-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto w-full relative z-10">
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <Check className="w-16 h-16 text-green-600" strokeWidth={3} />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 text-center">
            Thank You{fullName && `, ${fullName}`}!
          </h1>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="text-center mb-8">
              <p className="text-xl md:text-2xl text-gray-700 mb-6 font-semibold">
                We&apos;ve received your application and bank statements for {businessName}
              </p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Application Submitted</h2>
                </div>

                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-lg">
                      <strong>Your application is being reviewed</strong> - Our team is carefully reviewing your information
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-lg">
                      <strong>We&apos;ll call you soon</strong> - A funding specialist will contact you within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* NEXT STEP: Complete Identity Verification */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">
                    One More Step to Complete Your Application
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Complete Identity Verification
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-lg mx-auto">
                    To finalize your funding application, please upload your driver&apos;s license and void check.
                  </p>
                  <Link
                    href="/dlvc"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF8C42] to-[#FF7028] hover:from-[#FF7028] hover:to-[#e5631d] text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Complete Identity Verification
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                <p className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  Have Questions? We&apos;re Here to Help!
                </p>
                <div className="flex flex-col items-center gap-3">
                  <a
                    href="tel:3055157319"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full text-center w-full md:w-auto text-lg transition-all transform hover:scale-105"
                  >
                    <Phone className="inline-block w-5 h-5 mr-2" />
                    Call (305) 515-7319
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 md:py-16 px-4 md:px-6 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <Image src="/logo-final.png" alt="Highline Funding Logo" width={200} height={60} className="mx-auto mb-4 object-contain" />
          <p className="text-sm text-gray-600">&copy; 2025 Highline Funding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function ThankYouUploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8C42] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouUploadContent />
    </Suspense>
  );
}
