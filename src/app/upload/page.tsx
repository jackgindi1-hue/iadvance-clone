'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Upload, Check, Mail, ExternalLink } from 'lucide-react';

const DOCUSIGN_URL = "https://na4.docusign.net/Member/PowerFormSigning.aspx?PowerFormId=89764605-cb04-4695-9167-86dd1456c77a&env=na4&acct=c238cbb6-3f73-4721-9f47-2f0536de2c7a&v=2";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<{ statement1: File | null; statement2: File | null; statement3: File | null }>({ statement1: null, statement2: null, statement3: null });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || '';
      setIsMobile(/android|iphone|ipad|ipod|mobile/i.test(ua) || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'statement1' | 'statement2' | 'statement3') => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (file && errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!files.statement1) newErrors.statement1 = 'Required';
    if (!files.statement2) newErrors.statement2 = 'Required';
    if (!files.statement3) newErrors.statement3 = 'Required';
    if (!contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) newErrors.contactEmail = 'Valid email required';
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 10) newErrors.contactPhone = 'Valid phone required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('email', contactEmail);
      formData.set('phone', contactPhone);
      if (files.statement1) formData.append('bankStatements', files.statement1);
      if (files.statement2) formData.append('bankStatements', files.statement2);
      if (files.statement3) formData.append('bankStatements', files.statement3);
      const response = await fetch('/api/submit-with-files', { method: 'POST', body: formData });
      if (response.ok) {
        router.push('/thank-you-upload');
      } else {
        alert('Error submitting. Please try again.');
      }
    } catch { alert('Error submitting. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-3 px-3 md:py-5 md:px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Image src="/logo-final.png" alt="Highline Funding" width={280} height={80} className="w-[120px] md:w-[280px] h-auto" />
          </Link>
          <a href="tel:305-515-7319" className="hidden md:flex items-center gap-3">
            <Phone className="w-8 h-8 text-[#FF8C42]" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Questions? Call Us!</span>
              <span className="text-2xl font-bold">305-515-7319</span>
            </div>
          </a>
        </div>
      </header>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 text-white">
          <Phone className="w-6 h-6" />
          <span className="text-lg font-bold">305-515-7319</span>
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-gray-50 px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Complete Your Application</h1>
            <p className="text-lg text-gray-600">Three simple steps to get funded!</p>
          </div>

          {/* Step 1: DocuSign */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#FF8C42] rounded-full flex items-center justify-center text-white font-bold text-lg">1</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Sign Documents</h2>
                <p className="text-gray-600 text-sm">Complete your verification (no credit impact)</p>
              </div>
            </div>

            {isMobile ? (
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
                <p className="text-gray-600 mb-4">Tap to complete your secure verification</p>
                <a
                  href={DOCUSIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#FF8C42] hover:bg-[#FF7028] text-white font-bold py-4 px-8 rounded-full text-lg transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Open DocuSign
                </a>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200">
                  <iframe
                    src={DOCUSIGN_URL}
                    width="100%"
                    height="700"
                    frameBorder="0"
                    className="w-full"
                    title="DocuSign"
                    allow="geolocation; microphone; camera"
                  />
                </div>
                <div className="mt-3 text-center">
                  <a href={DOCUSIGN_URL} target="_blank" rel="noopener noreferrer" className="text-[#FF8C42] text-sm font-medium hover:underline">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Open in new window
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Upload Bank Statements */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FF8C42] rounded-full flex items-center justify-center text-white font-bold text-lg">2</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">Upload Bank Statements</h2>
                  <p className="text-gray-600 text-sm">Last 3 months of business bank statements</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {(['statement1', 'statement2', 'statement3'] as const).map((field, i) => (
                  <div key={field}>
                    <label className="block font-semibold mb-2">Statement #{i + 1} *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, field)} className="hidden" id={field} />
                    <label
                      htmlFor={field}
                      className={`flex items-center justify-center gap-2 w-full p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        files[field] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-[#FF8C42] hover:bg-orange-50'
                      }`}
                    >
                      {files[field] ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 truncate">{files[field]?.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-500">Click to upload</span>
                        </>
                      )}
                    </label>
                    {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#FF8C42]" />
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={`w-full p-3 border-2 rounded-xl ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="your@email.com"
                    />
                    {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={`w-full p-3 border-2 rounded-xl ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="(555) 123-4567"
                    />
                    {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-full text-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>

          {/* Step 3: Get Funded */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#FF8C42] rounded-full flex items-center justify-center text-white font-bold text-lg">3</div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold">Get Funded!</h2>
                <p className="text-gray-600 text-sm">We handle everything from here</p>
              </div>
            </div>
            <p className="text-gray-700">A funding specialist will contact you within 24 hours to finalize your application and get you funded fast!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 bg-white border-t hidden md:block">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          © 2025 Highline Funding. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
