'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Upload, Check, Mail, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import campaignsData from '@/config/upload-campaigns.json';

interface Campaign { slug: string; title: string; images: string[]; }

const DOCUSIGN_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&env=na4&acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&v=2";

export default function CampaignUploadPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [files, setFiles] = useState<{statement1: File | null; statement2: File | null; statement3: File | null;}>({ statement1: null, statement2: null, statement3: null });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docusignLoading, setDocusignLoading] = useState(true);
  const [docusignError, setDocusignError] = useState(false);

  useEffect(() => {
    if (docusignLoading) {
      const timeout = setTimeout(() => { if (docusignLoading) { setDocusignError(true); setDocusignLoading(false); } }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [docusignLoading]);

  const handleDocusignLoad = useCallback(() => { setDocusignLoading(false); setDocusignError(false); }, []);

  useEffect(() => {
    const storedCampaigns = localStorage.getItem('hlf_campaigns');
    if (storedCampaigns) {
      try {
        const campaigns = JSON.parse(storedCampaigns);
        const foundCampaign = campaigns.find((c: Campaign) => c.slug === slug);
        if (foundCampaign) { setCampaign(foundCampaign); setIsLoading(false); return; }
      } catch (e) {}
    }
    const configCampaign = campaignsData.campaigns.find((c: Campaign) => c.slug === slug);
    if (configCampaign) { setCampaign(configCampaign); }
    setIsLoading(false);
  }, [slug]);

  useEffect(() => {
    const storedData = sessionStorage.getItem('applicationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setApplicationData(data);
      if (data.email) setContactEmail(data.email);
      if (data.phone) setContactPhone(data.phone);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'statement1' | 'statement2' | 'statement3') => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (file && errors[field]) { setErrors(prev => ({ ...prev, [field]: '' })); }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!files.statement1) newErrors.statement1 = 'Bank statement #1 is required';
    if (!files.statement2) newErrors.statement2 = 'Bank statement #2 is required';
    if (!files.statement3) newErrors.statement3 = 'Bank statement #3 is required';
    if (!contactEmail.trim()) { newErrors.contactEmail = 'Email is required'; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) { newErrors.contactEmail = 'Please enter a valid email address'; }
    if (!contactPhone.trim()) { newErrors.contactPhone = 'Phone number is required'; }
    else if (contactPhone.replace(/\D/g, '').length < 10) { newErrors.contactPhone = 'Please enter a valid phone number'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (applicationData) { Object.keys(applicationData).forEach(key => { formData.append(key, applicationData[key]); }); }
      formData.set('email', contactEmail);
      formData.set('phone', contactPhone);
      formData.set('campaign', slug);
      if (files.statement1) formData.append('bankStatements', files.statement1);
      if (files.statement2) formData.append('bankStatements', files.statement2);
      if (files.statement3) formData.append('bankStatements', files.statement3);

      const response = await fetch('/api/submit-with-files', { method: 'POST', body: formData });
      if (response.ok) {
        sessionStorage.removeItem('applicationData');
        const firstName = applicationData?.firstName || 'Valued';
        const lastName = applicationData?.lastName || 'Customer';
        const businessName = applicationData?.businessName || 'Your Business';
        router.push(`/thank-you-upload?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&businessName=${encodeURIComponent(businessName)}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'There was an error submitting your documents.'}`);
      }
    } catch (error) { console.error('Upload error:', error); alert('There was an error submitting your documents.'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-green-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-700">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The upload page &quot;{slug}&quot; does not exist.</p>
          <Link href="/upload" className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition">
            Go to Main Upload Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Logo + Campaign Images */}
      <header className="bg-white border-b py-3 px-3 md:py-4 md:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo-final.png" alt="Highline Funding Logo" width={200} height={60} className="object-contain w-[100px] h-auto md:w-[180px]" />
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              {campaign.images.slice(0, 2).map((imgSrc: string, index: number) => (
                <img key={index} src={imgSrc} alt={`Campaign image ${index + 1}`} className="h-10 md:h-14 w-auto max-w-[100px] md:max-w-[160px] object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ))}
            </div>
          </div>
          <a href="tel:305-515-7319" className="hidden md:flex items-center gap-2">
            <Phone className="w-8 h-8 text-[#FF8C42]" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-700">Questions? Call Us!</span>
              <span className="text-2xl font-bold text-black">305-515-7319</span>
            </div>
          </a>
        </div>
        {campaign.title && (<div className="mt-3 pt-3 border-t"><h2 className="text-gray-900 text-lg md:text-xl font-bold text-center">{campaign.title}</h2></div>)}
      </header>

      {/* Mobile Phone */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 px-6">
          <Phone className="w-6 h-6 text-black" />
          <span className="text-lg font-bold text-black">305-515-7319</span>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gradient-to-br from-gray-50 via-white to-gray-50 px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Complete Your Application</h1>
            <p className="text-lg md:text-xl text-gray-600">Just three simple steps to get funded!</p>
          </div>

          {/* DocuSign Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Step 1: Owner & Business Verification</h2>
                <p className="text-gray-600">Zero impact to your credit score</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 relative">
              {docusignLoading && !docusignError && (<div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 min-h-[400px]"><Loader2 className="w-12 h-12 text-[#FF8C42] animate-spin mb-4" /><p className="text-lg font-semibold text-gray-900">Loading Owner & Business Verification...</p></div>)}
              {docusignError && (<div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center"><AlertCircle className="w-16 h-16 text-orange-500 mb-4" /><h3 className="text-xl font-bold text-gray-900 mb-2">Form not displaying correctly?</h3><a href={DOCUSIGN_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#FF8C42] hover:text-[#FF7028] font-semibold text-lg underline"><ExternalLink className="w-5 h-5" />Click here to open verification in a new window</a></div>)}
              {!docusignError && (<iframe src={DOCUSIGN_URL} width="100%" height="800" frameBorder="0" className={`w-full transition-opacity duration-300 ${docusignLoading ? 'opacity-0' : 'opacity-100'}`} title="DocuSign Identity Verification" onLoad={handleDocusignLoad} />)}
            </div>
          </div>

          {/* Bank Statements Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Step 2: Upload Bank Statements</h2>
                  <p className="text-gray-600">Upload your last 3 months of business bank statements</p>
                </div>
              </div>

              <div className="space-y-6">
                {(['statement1', 'statement2', 'statement3'] as const).map((field, idx) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-lg font-semibold text-gray-900 mb-3">Bank Statement #{idx + 1} *</label>
                    <input type="file" id={field} accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, field)} className="hidden" />
                    <label htmlFor={field} className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors[field] ? 'border-red-500 bg-red-50' : files[field] ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                      {files[field] ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files[field]?.name}</span></>) : (<><Upload className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload</span></>)}
                    </label>
                    {errors[field] && <p className="text-red-500 text-sm mt-2">{errors[field]}</p>}
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-[#FF8C42]" />Your Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => { setContactEmail(e.target.value); if (errors.contactEmail) setErrors(prev => ({ ...prev, contactEmail: '' })); }} placeholder="your@email.com" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] ${errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`} />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" id="contactPhone" value={contactPhone} onChange={(e) => { setContactPhone(e.target.value); if (errors.contactPhone) setErrors(prev => ({ ...prev, contactPhone: '' })); }} placeholder="(555) 123-4567" className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42] ${errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`} />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : 'Submit Documents & Complete Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <Image src="/logo-final.png" alt="Highline Funding Logo" width={200} height={60} className="mx-auto mb-4 object-contain" />
          <p className="text-sm text-gray-600">&copy; 2025 Highline Funding. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
