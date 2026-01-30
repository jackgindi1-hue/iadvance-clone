'use client';
// BUILD_VERSION: 2026-01-30-v19-FOCUSED-VIEW-MOBILE

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Upload, Check, Mail, Loader2, ExternalLink, User } from 'lucide-react';

// DocuSign PowerForm URL (for desktop iframe)
const DOCUSIGN_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&env=na4&acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&v=2";

export default function UploadPage() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [files, setFiles] = useState<{
    statement1: File | null;
    statement2: File | null;
    statement3: File | null;
  }>({
    statement1: null,
    statement2: null,
    statement3: null,
  });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile detection and Focused View state
  const [isMobile, setIsMobile] = useState(false);
  const [mobileFormName, setMobileFormName] = useState('');
  const [mobileFormEmail, setMobileFormEmail] = useState('');
  const [mobileFormErrors, setMobileFormErrors] = useState<Record<string, string>>({});
  const [isLoadingFocusedView, setIsLoadingFocusedView] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileUA || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const storedData = sessionStorage.getItem('applicationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setApplicationData(data);
      if (data.email) {
        setContactEmail(data.email);
        setMobileFormEmail(data.email);
      }
      if (data.phone) setContactPhone(data.phone);
      if (data.firstName) {
        setContactFirstName(data.firstName);
        setMobileFormName(`${data.firstName} ${data.lastName || ''}`.trim());
      }
      if (data.lastName) setContactLastName(data.lastName);
    }
  }, []);

  // Handle Focused View for mobile
  const handleMobileFocusedView = async () => {
    // Validate mobile form
    const newErrors: Record<string, string> = {};
    if (!mobileFormName.trim()) newErrors.name = 'Your name is required';
    if (!mobileFormEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileFormEmail)) {
      newErrors.email = 'Please enter a valid email';
    }
    setMobileFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoadingFocusedView(true);
    try {
      const response = await fetch('/api/docusign/focused-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mobileFormName,
          email: mobileFormEmail,
          returnUrl: `${window.location.origin}/upload?signed=complete`,
        }),
      });

      const data = await response.json();

      if (data.success && data.signingUrl) {
        // Redirect to DocuSign Focused View
        window.location.href = data.signingUrl;
      } else if (data.useFallback) {
        // Open PowerForm in new tab as fallback
        window.open(data.fallbackUrl || DOCUSIGN_URL, '_blank');
      } else {
        throw new Error(data.error || 'Failed to start signing');
      }
    } catch (error) {
      console.error('Focused View error:', error);
      // Fallback to PowerForm
      window.open(DOCUSIGN_URL, '_blank');
    } finally {
      setIsLoadingFocusedView(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'statement1' | 'statement2' | 'statement3') => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (file && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!files.statement1) newErrors.statement1 = 'Bank statement #1 is required';
    if (!files.statement2) newErrors.statement2 = 'Bank statement #2 is required';
    if (!files.statement3) newErrors.statement3 = 'Bank statement #3 is required';
    if (!contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (!contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    } else if (contactPhone.replace(/\D/g, '').length < 10) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (applicationData) {
        Object.keys(applicationData).forEach(key => {
          formData.append(key, applicationData[key]);
        });
      }
      formData.set('email', contactEmail);
      formData.set('phone', contactPhone);
      if (contactFirstName) formData.set('firstName', contactFirstName);
      if (contactLastName) formData.set('lastName', contactLastName);
      if (files.statement1) formData.append('bankStatements', files.statement1);
      if (files.statement2) formData.append('bankStatements', files.statement2);
      if (files.statement3) formData.append('bankStatements', files.statement3);

      const response = await fetch('/api/submit-with-files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        sessionStorage.removeItem('applicationData');
        const firstName = contactFirstName || applicationData?.firstName || 'Valued';
        const lastName = contactLastName || applicationData?.lastName || 'Customer';
        const businessName = applicationData?.businessName || 'Your Business';
        router.push(`/thank-you-upload?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&businessName=${encodeURIComponent(businessName)}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'There was an error submitting your documents. Please try again.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('There was an error submitting your documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                  <span className="text-[10px] md:text-xs text-gray-600 whitespace-nowrap">Live Agents Standing By:</span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                  </span>
                </div>
                <span className="text-lg md:text-2xl font-bold text-black whitespace-nowrap">305-515-7319</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Footer - Phone */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 px-6 phone-hover">
          <Phone className="w-6 h-6 phone-ring text-black flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-white">Questions? Tap to call!</span>
            <span className="text-lg font-bold text-black">305-515-7319</span>
          </div>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Complete Your Application
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Just three simple steps to get funded{applicationData?.firstName ? `, ${applicationData.firstName}` : ''}!
            </p>
          </div>

          {/* DocuSign Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
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

            {/* MOBILE: Focused View with name/email form */}
            {isMobile ? (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Verification</h3>
                  <p className="text-gray-600">Enter your details to start the secure signing process</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Full Name *</label>
                    <input
                      type="text"
                      value={mobileFormName}
                      onChange={(e) => {
                        setMobileFormName(e.target.value);
                        if (mobileFormErrors.name) setMobileFormErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="John Smith"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] transition-all ${mobileFormErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                    />
                    {mobileFormErrors.name && <p className="text-red-500 text-sm mt-1">{mobileFormErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={mobileFormEmail}
                      onChange={(e) => {
                        setMobileFormEmail(e.target.value);
                        if (mobileFormErrors.email) setMobileFormErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="you@email.com"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] transition-all ${mobileFormErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                    />
                    {mobileFormErrors.email && <p className="text-red-500 text-sm mt-1">{mobileFormErrors.email}</p>}
                  </div>
                </div>

                <button
                  onClick={handleMobileFocusedView}
                  disabled={isLoadingFocusedView}
                  className="w-full bg-gradient-to-r from-[#FF8C42] to-[#FF7028] hover:from-[#FF7028] hover:to-[#E56020] text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoadingFocusedView ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-6 h-6" />
                      <span>Start Secure Verification</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  You'll be redirected to DocuSign's secure mobile signing experience
                </p>
              </div>
            ) : (
              /* DESKTOP: Show iframe directly */
              <>
                <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200">
                  <iframe
                    src={DOCUSIGN_URL}
                    width="100%"
                    height="800"
                    frameBorder="0"
                    className="w-full"
                    title="DocuSign Identity Verification"
                    allow="geolocation; microphone; camera"
                  />
                </div>

                {/* Fallback link - ALWAYS VISIBLE for desktop */}
                <div className="mt-4 text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Form not displaying correctly?</p>
                  <a
                    href={DOCUSIGN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#FF8C42] hover:bg-[#FF7028] text-white font-semibold py-3 px-6 rounded-full transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Click here to open in a new window
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Bank Statements Upload Section */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Step 2: Upload Bank Statements</h2>
                    <p className="text-gray-600">Upload your last 3 months of business bank statements</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    {[files.statement1, files.statement2, files.statement3].filter(Boolean).length} / 3 Files
                  </span>
                </div>
              </div>

              <div className="md:hidden mb-4 bg-gray-100 px-4 py-2 rounded-full text-center">
                <span className="text-sm font-semibold text-gray-700">
                  {[files.statement1, files.statement2, files.statement3].filter(Boolean).length} of 3 Files Uploaded
                </span>
              </div>

              <div className="space-y-6">
                {/* Bank Statement #1 */}
                <div>
                  <label htmlFor="statement1" className="block text-lg font-semibold text-gray-900 mb-3">Bank Statement #1 *</label>
                  <div className="relative">
                    <input type="file" id="statement1" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'statement1')} className="hidden" />
                    <label htmlFor="statement1" className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors.statement1 ? 'border-red-500 bg-red-50' : files.statement1 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      {files.statement1 ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files.statement1.name}</span></>) : (<><Upload className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload or drag and drop</span></>)}
                    </label>
                  </div>
                  {errors.statement1 && <p className="text-red-500 text-sm mt-2">{errors.statement1}</p>}
                </div>

                {/* Bank Statement #2 */}
                <div>
                  <label htmlFor="statement2" className="block text-lg font-semibold text-gray-900 mb-3">Bank Statement #2 *</label>
                  <div className="relative">
                    <input type="file" id="statement2" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'statement2')} className="hidden" />
                    <label htmlFor="statement2" className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors.statement2 ? 'border-red-500 bg-red-50' : files.statement2 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      {files.statement2 ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files.statement2.name}</span></>) : (<><Upload className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload or drag and drop</span></>)}
                    </label>
                  </div>
                  {errors.statement2 && <p className="text-red-500 text-sm mt-2">{errors.statement2}</p>}
                </div>

                {/* Bank Statement #3 */}
                <div>
                  <label htmlFor="statement3" className="block text-lg font-semibold text-gray-900 mb-3">Bank Statement #3 *</label>
                  <div className="relative">
                    <input type="file" id="statement3" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'statement3')} className="hidden" />
                    <label htmlFor="statement3" className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors.statement3 ? 'border-red-500 bg-red-50' : files.statement3 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      {files.statement3 ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files.statement3.name}</span></>) : (<><Upload className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload or drag and drop</span></>)}
                    </label>
                  </div>
                  {errors.statement3 && <p className="text-red-500 text-sm mt-2">{errors.statement3}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#FF8C42]" />
                  Your Contact Information
                </h3>
                <p className="text-sm text-gray-600 mb-4">We'll send your funding updates and documents to this email.</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => { setContactEmail(e.target.value); if (errors.contactEmail) setErrors(prev => ({ ...prev, contactEmail: '' })); }} placeholder="your@email.com" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] transition-all ${errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`} />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" id="contactPhone" value={contactPhone} onChange={(e) => { setContactPhone(e.target.value); if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: '' })); }} placeholder="(555) 123-4567" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] transition-all ${errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`} />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                {[files.statement1, files.statement2, files.statement3].filter(Boolean).length < 3 && (
                  <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-yellow-900">Please upload all 3 bank statements before submitting</p>
                    <p className="text-xs text-yellow-800 mt-1">You have uploaded {[files.statement1, files.statement2, files.statement3].filter(Boolean).length} of 3 required files</p>
                  </div>
                )}
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden">
                  {isSubmitting && (
                    <span className="absolute inset-0 flex items-center justify-center bg-green-500">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                  <span className={isSubmitting ? 'invisible' : ''}>Submit Documents & Complete Application</span>
                </button>
              </div>
            </div>
          </form>

          {/* Step 3: Get Funded */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Step 3: Get Funded</h2>
                <p className="text-gray-600">We'll take it from here!</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <p className="text-lg text-gray-700 leading-relaxed">A dedicated funding specialist will reach out to discuss your personalized funding options.</p>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div><p className="font-semibold text-gray-900">Expert Guidance</p><p className="text-sm text-gray-600">Personalized funding advice</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div><p className="font-semibold text-gray-900">Fast Response</p><p className="text-sm text-gray-600">We'll contact you within 24 hours</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div><p className="font-semibold text-gray-900">Quick Funding</p><p className="text-sm text-gray-600">Same-day approval available</p></div>
                </div>
              </div>
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
      <footer className="py-8 md:py-16 px-4 md:px-6 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="md:hidden space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-3">
                <div className="inline-block bg-white rounded-lg px-3 py-2">
                  <Image src="/logo-final.png" alt="Highline Funding Logo" width={140} height={40} className="object-contain" />
                </div>
                <div className="text-gray-600 space-y-2">
                  <p className="text-xs">© 2025 Highline Funding. All rights reserved.</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <h4 className="text-sm font-bold mb-3 text-black">Get In Touch</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="w-3 h-3 text-[#FF8C42] flex-shrink-0 mt-1" />
                    <a href="tel:305-515-7319" className="text-xs text-black font-semibold">305-515-7319</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <div className="inline-block bg-white rounded-lg px-6 py-3">
                <Image src="/logo-final.png" alt="Highline Funding Logo" width={280} height={80} className="object-contain" />
              </div>
              <p className="text-sm text-gray-600">© 2025 Highline Funding. All rights reserved.</p>
            </div>
            <div className="ml-auto max-w-md">
              <h4 className="text-2xl font-bold mb-6 text-black">Get In Touch</h4>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#FF8C42] flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <a href="tel:305-515-7319" className="text-base text-black font-semibold hover:text-[#FF8C42] transition">305-515-7319</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .phone-hover:hover .phone-ring {
          animation: ring 1s ease-in-out;
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
