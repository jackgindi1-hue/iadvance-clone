'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Upload, LogIn, Plus, Copy, Check, Trash2, ExternalLink, Settings, Globe, Mail, Github } from 'lucide-react';

const ADMIN_USERNAME = 'highline';
const ADMIN_PASSWORD = 'funding2025';

interface Campaign { slug: string; title: string; images: string[]; createdAt?: string; }

export default function PartnerToolsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'systems' | 'pages' | 'emails'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newSlug, setNewSlug] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [images, setImages] = useState<{ image1: string; image2: string }>({ image1: '', image2: '' });
  const [uploading, setUploading] = useState<{ image1: boolean; image2: boolean }>({ image1: false, image2: false });
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('hlf_campaigns');
    if (stored) { setCampaigns(JSON.parse(stored)); }
    const loggedIn = sessionStorage.getItem('hlf_logged_in');
    if (loggedIn === 'true') { setIsLoggedIn(true); }
  }, []);

  useEffect(() => {
    if (campaigns.length > 0) { localStorage.setItem('hlf_campaigns', JSON.stringify(campaigns)); }
  }, [campaigns]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      sessionStorage.setItem('hlf_logged_in', 'true');
      setLoginError('');
    } else { setLoginError('Invalid username or password'); }
  };

  const handleLogout = () => { setIsLoggedIn(false); sessionStorage.removeItem('hlf_logged_in'); };

  const handleImageSelect = (file: File, position: 'image1' | 'image2') => {
    setUploading(prev => ({ ...prev, [position]: true }));
    setError('');
    const reader = new FileReader();
    reader.onload = () => { const dataUrl = reader.result as string; setImages(prev => ({ ...prev, [position]: dataUrl })); setUploading(prev => ({ ...prev, [position]: false })); };
    reader.onerror = () => { setError('Failed to load image. Please try again.'); setUploading(prev => ({ ...prev, [position]: false })); };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, position: 'image1' | 'image2') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { setError('Image too large. Please use images under 500KB.'); return; }
      handleImageSelect(file, position);
    }
  };

  const generateCampaign = async () => {
    if (!newSlug.trim()) { setError('Please enter a URL name'); return; }
    if (!images.image1 || !images.image2) { setError('Please upload both images'); return; }
    const slug = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (campaigns.some(c => c.slug === slug)) { setError('This URL name already exists.'); return; }
    setGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch('/api/create-campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, title: newTitle || '', images: [images.image1, images.image2] }) });
      const result = await response.json();
      if (!response.ok) { throw new Error(result.error || 'Failed to create campaign'); }
      const campaign: Campaign = { slug, title: newTitle || '', images: [images.image1, images.image2], createdAt: new Date().toISOString() };
      const updatedCampaigns = [...campaigns, campaign];
      setCampaigns(updatedCampaigns);
      localStorage.setItem('hlf_campaigns', JSON.stringify(updatedCampaigns));
      setGeneratedUrl(result.url);
      setSuccessMessage(result.message);
      setNewSlug(''); setNewTitle(''); setImages({ image1: '', image2: '' });
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate campaign.'); }
    finally { setGenerating(false); }
  };

  const copyUrl = () => { navigator.clipboard.writeText(generatedUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const deleteCampaign = (slug: string) => {
    if (confirm('Are you sure you want to delete this campaign from your list?')) {
      const updated = campaigns.filter(c => c.slug !== slug);
      setCampaigns(updated);
      localStorage.setItem('hlf_campaigns', JSON.stringify(updated));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Image src="/logo-final.png" alt="Highline Funding" width={200} height={60} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Partner Tools</h1>
            <p className="text-gray-600 mt-2">Login to manage campaign pages</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]" placeholder="Enter username" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]" placeholder="Enter password" />
            </div>
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-[#FF8C42] hover:bg-[#FF7028] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src="/logo-final.png" alt="Highline Funding" width={180} height={50} />
            <span className="text-gray-400">|</span>
            <span className="font-semibold text-gray-700">Partner Tools</span>
          </div>
          <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900 font-medium">Logout</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm">
          <button onClick={() => setActiveTab('campaigns')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'campaigns' ? 'bg-[#FF8C42] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Upload className="w-5 h-5" />Upload Pages
          </button>
          <button onClick={() => setActiveTab('systems')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'systems' ? 'bg-[#FF8C42] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Settings className="w-5 h-5" />Systems & Tools
          </button>
          <button onClick={() => setActiveTab('pages')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'pages' ? 'bg-[#FF8C42] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Globe className="w-5 h-5" />Site Pages
          </button>
          <button onClick={() => setActiveTab('emails')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === 'emails' ? 'bg-[#FF8C42] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Mail className="w-5 h-5" />Email Templates
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6 px-4">
        {activeTab === 'campaigns' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Plus className="w-6 h-6 text-[#FF8C42]" />Create New Upload Page</h2>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Page URL Name *</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">highlinefunding.com/upload/</span>
                  <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]" placeholder="upload1" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subheader Title (Optional)</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8C42]" placeholder="e.g., Special Funding Offer" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Header Images (2 Required) *</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['image1', 'image2'] as const).map((position, idx) => (
                    <div key={position} className="relative">
                      <p className="text-xs text-gray-500 mb-2 text-center">Image {idx + 1}</p>
                      <label className={`block aspect-video border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-[#FF8C42] ${images[position] ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                        <input type="file" accept="image/*" onChange={(e) => handleFileSelect(e, position)} className="hidden" disabled={uploading[position]} />
                        {uploading[position] ? (<div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF8C42]"></div></div>) : images[position] ? (<img src={images[position]} alt={`Image ${idx + 1}`} className="w-full h-full object-contain rounded-xl" />) : (<div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><Upload className="w-8 h-8 mb-2" /><span className="text-xs">Click to upload</span></div>)}
                      </label>
                      {images[position] && (<button onClick={() => setImages(prev => ({ ...prev, [position]: '' }))} className="absolute top-6 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><Trash2 className="w-3 h-3" /></button>)}
                    </div>
                  ))}
                </div>
              </div>
              {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
              {successMessage && (<div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2"><Check className="w-4 h-4 text-green-600" />{successMessage}</div>)}
              <button onClick={generateCampaign} disabled={generating} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? (<><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Generating...</>) : (<><Plus className="w-5 h-5" />Generate Upload Page</>)}
              </button>
              {generatedUrl && (<div className="mt-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl"><p className="text-green-800 font-semibold mb-2">Your new upload page is ready!</p><div className="flex items-center gap-2"><input type="text" value={generatedUrl} readOnly className="flex-1 px-4 py-2 bg-white border border-green-300 rounded-lg text-sm" /><button onClick={copyUrl} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-1">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy'}</button><a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1"><ExternalLink className="w-4 h-4" />Open</a></div></div>)}
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Upload Pages</h2>
              {campaigns.length === 0 ? (<p className="text-gray-500 text-center py-8">No campaigns created yet. Create your first one above!</p>) : (<div className="space-y-4">{campaigns.map((campaign) => (<div key={campaign.slug} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"><div className="flex items-center gap-4"><div className="flex gap-1">{campaign.images.map((img, i) => (<img key={i} src={img} alt="" className="w-12 h-8 object-cover rounded" />))}</div><div><p className="font-semibold text-gray-900">/upload/{campaign.slug}</p>{campaign.title && <p className="text-sm text-gray-500">{campaign.title}</p>}</div></div><div className="flex items-center gap-2"><a href={`/upload/${campaign.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 p-2"><ExternalLink className="w-5 h-5" /></a><button onClick={() => deleteCampaign(campaign.slug)} className="text-red-500 hover:text-red-600 p-2"><Trash2 className="w-5 h-5" /></button></div></div>))}</div>)}
            </div>
          </>
        )}

        {activeTab === 'systems' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-[#FF8C42]" />Systems & Services</h2>
            <div className="grid gap-4">
              <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <Globe className="w-10 h-10 text-teal-600" /><div className="flex-1"><p className="font-bold text-gray-900">Netlify</p><p className="text-sm text-gray-600">Website hosting & deployment</p></div><ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
              <a href="https://github.com/jackgindi1-hue/highline-funding" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <Github className="w-10 h-10 text-gray-800" /><div className="flex-1"><p className="font-bold text-gray-900">GitHub</p><p className="text-sm text-gray-600">Code repository</p></div><ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
              <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <Mail className="w-10 h-10 text-purple-600" /><div className="flex-1"><p className="font-bold text-gray-900">Resend</p><p className="text-sm text-gray-600">Email sending API</p></div><ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe className="w-6 h-6 text-[#FF8C42]" />Site Pages</h2>
            <div className="grid gap-4">
              {[{ name: 'Home', path: '/' }, { name: 'Upload Bank Statements', path: '/upload' }, { name: 'DLVC Upload', path: '/dlvc' }, { name: 'Thank You (Upload)', path: '/thank-you-upload' }, { name: 'Thank You (DLVC)', path: '/thank-you-dlvc' }, { name: 'Privacy Policy', path: '/privacy' }].map((page) => (
                <div key={page.path} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div><p className="font-bold text-gray-900">{page.name}</p><p className="text-sm text-gray-500">highlinefunding.com{page.path}</p></div>
                  <a href={`https://highlinefunding.com${page.path}`} target="_blank" rel="noopener noreferrer" className="bg-[#FF8C42] hover:bg-[#FF7028] text-white px-4 py-2 rounded-lg flex items-center gap-1"><ExternalLink className="w-4 h-4" />Open</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'emails' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Mail className="w-16 h-16 text-[#FF8C42] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Templates</h2>
            <p className="text-gray-600 mb-6">7 follow-up email templates for manual outreach</p>
            <a href="/email-templates" className="inline-flex items-center justify-center gap-2 bg-[#FF8C42] hover:bg-[#FF7028] text-white font-bold py-4 px-8 rounded-xl transition-all text-lg">
              <Mail className="w-5 h-5" />Open Email Templates
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
