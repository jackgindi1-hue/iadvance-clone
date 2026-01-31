'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Check, CreditCard, FileText, Mail } from 'lucide-react';

export default function DLVCPage() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [files, setFiles] = useState<{driversLicense: File | null; voidCheck: File | null;}>({
    driversLicense: null, voidCheck: null,
  });
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem('applicationData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setApplicationData(data);
      if (data.email) setContactEmail(data.email);
      if (data.phone) setContactPhone(data.phone);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'driversLicense' | 'voidCheck') => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [field]: file }));
    if (file && errors[field]) { setErrors(prev => ({ ...prev, [field]: '' })); }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!files.driversLicense) newErrors.driversLicense = "Driver's License is required";
    if (!files.voidCheck) newErrors.voidCheck = 'Void Check is required';
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
      if (files.driversLicense) formData.append('driversLicense', files.driversLicense);
      if (files.voidCheck) formData.append('voidCheck', files.voidCheck);

      const response = await fetch('/api/submit-dlvc', { method: 'POST', body: formData });
      if (response.ok) {
        sessionStorage.removeItem('applicationData');
        const firstName = applicationData?.firstName || 'Valued';
        const lastName = applicationData?.lastName || 'Customer';
        const businessName = applicationData?.businessName || 'Your Business';
        router.push(`/thank-you-dlvc?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&businessName=${encodeURIComponent(businessName)}`);
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
          <Link href="/" className="flex items-center">
            <Image src="/logo-final.png" alt="Highline Funding Logo" width={280} height={80} className="object-contain w-[120px] h-auto md:w-[280px]" />
          </Link>
          <a href="tel:305-515-7319" className="hidden md:flex items-center gap-2">
            <Phone className="w-8 h-8 text-[#FF8C42]" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-700">Questions? Call Us!</span>
              <span className="text-2xl font-bold text-black">305-515-7319</span>
            </div>
          </a>
        </div>
      </header>

      {/* Mobile Sticky Footer - Phone */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-green-500 shadow-lg">
        <a href="tel:305-515-7319" className="flex items-center justify-center gap-3 py-4 px-6">
          <Phone className="w-6 h-6 text-black" />
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Complete Your Verification</h1>
            <p className="text-lg md:text-xl text-gray-600">Just two quick steps to finalize your funding{applicationData?.firstName ? `, ${applicationData.firstName}` : ''}!</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Driver's License Upload */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete Identity Verification</h2>
                  <p className="text-gray-600">(Driver&apos;s License Required)</p>
                </div>
              </div>
              <div>
                <label htmlFor="driversLicense" className="block text-lg font-semibold text-gray-900 mb-3">Driver&apos;s License *</label>
                <input type="file" id="driversLicense" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'driversLicense')} className="hidden" />
                <label htmlFor="driversLicense" className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors.driversLicense ? 'border-red-500 bg-red-50' : files.driversLicense ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  {files.driversLicense ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files.driversLicense.name}</span></>) : (<><CreditCard className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload your Driver&apos;s License</span></>)}
                </label>
                {errors.driversLicense && <p className="text-red-500 text-sm mt-2">{errors.driversLicense}</p>}
              </div>
            </div>

            {/* Void Check Upload */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF8C42] to-[#FF7028] rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Upload a Void Check</h2>
                  <p className="text-gray-600">For your business (where you want the funds deposited)</p>
                </div>
              </div>
              <div>
                <label htmlFor="voidCheck" className="block text-lg font-semibold text-gray-900 mb-3">Void Check *</label>
                <input type="file" id="voidCheck" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'voidCheck')} className="hidden" />
                <label htmlFor="voidCheck" className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 ${errors.voidCheck ? 'border-red-500 bg-red-50' : files.voidCheck ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  {files.voidCheck ? (<><Check className="w-6 h-6 text-green-600" /><span className="text-green-700 font-medium">{files.voidCheck.name}</span></>) : (<><FileText className="w-6 h-6 text-gray-500" /><span className="text-gray-600">Click to upload your Void Check</span></>)}
                </label>
                {errors.voidCheck && <p className="text-red-500 text-sm mt-2">{errors.voidCheck}</p>}
              </div>

              {/* Contact Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#FF8C42]" />Your Contact Information
                </h3>
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

              {/* Submit Button */}
              <div className="mt-8">
                <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Submitting...' : 'Submit Documents'}
                </button>
              </div>
            </div>
          </form>

          {/* Help Section */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 text-center">
            <p className="text-xl font-semibold text-gray-900 mb-4">Need Help or Have Questions?</p>
            <a href="tel:3055157319" className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full transition-all transform hover:scale-105">
              <Phone className="inline-block w-5 h-5 mr-2" />Call (305) 515-7319
            </a>
          </div>
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
