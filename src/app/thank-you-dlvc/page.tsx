'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Check, PartyPopper } from 'lucide-react';

function ThankYouDLVCContent() {
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
              <PartyPopper className="w-14 h-14 text-green-600" strokeWidth={2} />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 text-center">
            Congratulations{fullName && `, ${fullName}`}!
          </h1>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
            <div className="text-center mb-8">
              <p className="text-xl md:text-2xl text-gray-700 mb-6 font-semibold">
                Your verification documents for {businessName} have been received!
              </p>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Documents Received</h2>
                </div>

                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-lg">
                      <strong>Driver&apos;s License Received</strong> - Your identity verification document has been submitted
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-700 text-lg">
                      <strong>Void Check Received</strong> - Your bank account information has been recorded
                    </p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">What Happens Next</h3>
                <div className="space-y-3 max-w-xl mx-auto">
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Identity Verified</p>
                      <p className="text-sm text-gray-600">Your driver&apos;s license has been received</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Final Underwriting: In Progress!</p>
                      <p className="text-sm text-gray-600">Your bank details are being verified</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-yellow-50 rounded-lg p-3 shadow-sm border-2 border-yellow-400">
                    <div className="w-7 h-7 bg-[#FF8C42] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 animate-pulse">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Contract & Funding</p>
                      <p className="text-sm text-gray-600">Check your email for the funding agreement to sign</p>
                    </div>
                  </div>
                </div>
                <p className="text-center text-green-700 font-medium mt-4">
                  We will reach out only if anything else is needed!
                </p>
              </div>

              {/* Call to Action */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
                <p className="text-xl font-semibold text-gray-900 mb-4">
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
                  <p className="text-gray-600">
                    Our team is standing by to answer your questions
                  </p>
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

export default function ThankYouDLVCPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8C42] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouDLVCContent />
    </Suspense>
  );
}
