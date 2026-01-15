
import React, { useState, useCallback, useMemo } from 'react';
import { ResumeData, FormStep, Education, WorkExperience, Certification } from './types';
import { StepIndicator } from './components/StepIndicator';
import { PersonalInfoForm } from './components/forms/PersonalInfoForm';
import { VisaStatusForm } from './components/forms/VisaStatusForm';
import { ResumePreview } from './components/ResumePreview';
import { autoTranslateAll, translateResumeSection } from './services/geminiService';

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    furigana: '',
    gender: 'Male',
    birthDate: '',
    email: '',
    phone: '',
    address: '',
  },
  visa: {
    type: 'Working Holiday',
    expiryDate: '',
    validityRemaining: '',
  },
  education: [
    { id: 'edu-elem', institution: '', degree: 'Elementary School', startDate: '', endDate: '', country: '', status: 'Graduated' },
    { id: 'edu-mid', institution: '', degree: 'Middle School', startDate: '', endDate: '', country: '', status: 'Graduated' },
    { id: 'edu-high', institution: '', degree: 'High School', startDate: '', endDate: '', country: '', status: 'Graduated' },
    { id: 'edu-uni', institution: '', degree: 'University / Vocational', startDate: '', endDate: '', country: '', status: 'Graduated' },
  ],
  workExperience: [],
  certifications: [],
  skills: {
    languageLevel: 'English: Native\nJapanese: Conversational',
    technicalSkills: '',
    hobbies: '',
  },
};

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.PERSONAL);
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const steps = useMemo(() => Object.values(FormStep), []);

  const handlePersonalInfoChange = (info: ResumeData['personalInfo']) => {
    setData(prev => ({ ...prev, personalInfo: info }));
  };

  const handleVisaChange = (visa: ResumeData['visa']) => {
    setData(prev => ({ ...prev, visa }));
  };

  const updateEducationField = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      degree: 'Additional Education',
      startDate: '',
      endDate: '',
      country: '',
      status: 'Graduated'
    };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const addWork = () => {
    const newWork: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      country: '',
      contractType: 'Full-time',
      description: ''
    };
    setData(prev => ({ ...prev, workExperience: [...prev.workExperience, newWork] }));
  };

  const addCert = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: '',
      date: '',
      country: '',
      isDrivingLicense: false
    };
    setData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
  };

  const handleTranslateAll = async () => {
    setIsTranslating(true);
    try {
      const updates = await autoTranslateAll(data);
      setData(prev => ({ 
        ...prev, 
        ...updates,
        translatedSkills: updates.translatedSkills || prev.translatedSkills 
      }));
      alert("AI translation complete! Check the preview tab.");
      setCurrentStep(FormStep.PREVIEW);
    } catch (error) {
      console.error(error);
      alert("Failed to translate. Check your API key or connection.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDownloadDocx = () => {
    const content = document.getElementById('resume-preview-content')?.innerHTML;
    if (!content) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Resume</title>
      <style>
        body { font-family: 'Noto Sans JP', sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid black; padding: 5px; }
      </style>
      </head><body>
    `;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.personalInfo.lastName}_${data.personalInfo.firstName}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendEmail = async () => {
    if (!data.personalInfo.email) {
      alert("Please enter your email address in the Personal Info section.");
      setCurrentStep(FormStep.PERSONAL);
      return;
    }

    setIsSending(true);
    // Simulate API call to backend email service
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsSending(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const renderEducationSection = (id: string, label: string, isOptional = false, canDelete = false) => {
    const edu = data.education.find(e => e.id === id);
    if (!edu) return null;

    return (
      <div className="p-4 border rounded-lg bg-white mb-4 relative group">
        {canDelete && (
          <button 
            onClick={() => removeEducation(id)}
            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove this education entry"
          >
            ✕
          </button>
        )}
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-slate-700">{label} {isOptional && <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-slate-500 mb-1 block">School/Institution Name</label>
            <input 
              placeholder="e.g. Lincoln High School" 
              value={edu.institution} 
              onChange={e => updateEducationField(id, 'institution', e.target.value)} 
              className="w-full p-2 border rounded text-sm" 
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Course/Major/Degree</label>
            <input 
              placeholder="e.g. Science Stream" 
              value={edu.degree} 
              onChange={e => updateEducationField(id, 'degree', e.target.value)} 
              className="w-full p-2 border rounded text-sm" 
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Country</label>
            <input 
              placeholder="e.g. Australia" 
              value={edu.country} 
              onChange={e => updateEducationField(id, 'country', e.target.value)} 
              className="w-full p-2 border rounded text-sm" 
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
              <input 
                type="date" 
                value={edu.startDate} 
                onChange={e => updateEducationField(id, 'startDate', e.target.value)} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">End Date (Graduation)</label>
              <input 
                type="date" 
                value={edu.endDate} 
                onChange={e => updateEducationField(id, 'endDate', e.target.value)} 
                className="w-full p-2 border rounded text-sm" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Status</label>
            <select 
              value={edu.status} 
              onChange={e => updateEducationField(id, 'status', e.target.value as any)} 
              className="w-full p-2 border rounded text-sm bg-white"
            >
              <option value="Graduated">Graduated (卒業)</option>
              <option value="Enrolled">Still Enrolled (在籍中)</option>
              <option value="Withdrawn">Withdrawn (中退)</option>
              <option value="Completed">Completed (修了)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case FormStep.PERSONAL:
        return <PersonalInfoForm data={data.personalInfo} onChange={handlePersonalInfoChange} />;
      case FormStep.VISA:
        return <VisaStatusForm data={data.visa} onChange={handleVisaChange} />;
      case FormStep.EDUCATION:
        const standardIds = ['edu-elem', 'edu-mid', 'edu-high', 'edu-uni'];
        const extraEducation = data.education.filter(e => !standardIds.includes(e.id));

        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Education History</h2>
            <p className="text-sm text-slate-500 mb-4 italic">Please fill in your schools from Elementary to University. Japanese resumes often look for a full record.</p>
            
            {renderEducationSection('edu-elem', 'Elementary School (Primary)')}
            {renderEducationSection('edu-mid', 'Middle School (Junior High)')}
            {renderEducationSection('edu-high', 'High School (Senior High)')}
            {renderEducationSection('edu-uni', 'University / Vocational', true)}

            {extraEducation.map((edu, idx) => (
              <React.Fragment key={edu.id}>
                {renderEducationSection(edu.id, `Other Education / Degrees`, true, true)}
              </React.Fragment>
            ))}

            <button 
              onClick={addEducation} 
              className="w-full py-3 border-2 border-dashed border-rose-200 rounded-lg text-rose-500 font-medium hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span> Add More Education / Specialized Training
            </button>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
              Note: If you didn't attend University or have more than one degree, use the button above. Blank sections will be hidden.
            </div>
          </div>
        );
      case FormStep.WORK:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Work Experience</h2>
            {data.workExperience.map((work, idx) => (
              <div key={work.id} className="p-4 border rounded-lg bg-white relative">
                <button 
                  onClick={() => setData(prev => ({ ...prev, workExperience: prev.workExperience.filter(w => w.id !== work.id) }))}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                >✕</button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Company Name" value={work.company} onChange={e => {
                    const newList = [...data.workExperience];
                    newList[idx].company = e.target.value;
                    setData(prev => ({ ...prev, workExperience: newList }));
                  }} className="p-2 border rounded" />
                  <input placeholder="Position" value={work.position} onChange={e => {
                    const newList = [...data.workExperience];
                    newList[idx].position = e.target.value;
                    setData(prev => ({ ...prev, workExperience: newList }));
                  }} className="p-2 border rounded" />
                  <div className="flex gap-2">
                    <input type="date" value={work.startDate} onChange={e => {
                      const newList = [...data.workExperience];
                      newList[idx].startDate = e.target.value;
                      setData(prev => ({ ...prev, workExperience: newList }));
                    }} className="p-2 border rounded flex-1" />
                    <input type="date" value={work.endDate} onChange={e => {
                      const newList = [...data.workExperience];
                      newList[idx].endDate = e.target.value;
                      setData(prev => ({ ...prev, workExperience: newList }));
                    }} className="p-2 border rounded flex-1" />
                  </div>
                  <select value={work.contractType} onChange={e => {
                    const newList = [...data.workExperience];
                    newList[idx].contractType = e.target.value as any;
                    setData(prev => ({ ...prev, workExperience: newList }));
                  }} className="p-2 border rounded bg-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                  <textarea 
                    placeholder="Tasks and achievements (Explain as details as possible for the AI translator)" 
                    value={work.description} 
                    onChange={e => {
                      const newList = [...data.workExperience];
                      newList[idx].description = e.target.value;
                      setData(prev => ({ ...prev, workExperience: newList }));
                    }} 
                    className="p-2 border rounded md:col-span-2 h-32" 
                  />
                </div>
              </div>
            ))}
            <button onClick={addWork} className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50">+ Add Work Experience</button>
          </div>
        );
      case FormStep.SKILLS:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Licenses, Skills & Hobbies</h2>
            
            {/* Certs Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">Licenses & Certificates</h3>
              {data.certifications.map((cert, idx) => (
                <div key={cert.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 border rounded items-center">
                  <input placeholder="License Name" value={cert.name} onChange={e => {
                    const nl = [...data.certifications];
                    nl[idx].name = e.target.value;
                    setData(prev => ({ ...prev, certifications: nl }));
                  }} className="p-2 border rounded" />
                  <input type="date" value={cert.date} onChange={e => {
                    const nl = [...data.certifications];
                    nl[idx].date = e.target.value;
                    setData(prev => ({ ...prev, certifications: nl }));
                  }} className="p-2 border rounded" />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center text-xs text-slate-500">
                      <input type="checkbox" checked={cert.isDrivingLicense} onChange={e => {
                        const nl = [...data.certifications];
                        nl[idx].isDrivingLicense = e.target.checked;
                        setData(prev => ({ ...prev, certifications: nl }));
                      }} className="mr-1" /> Is DL?
                    </label>
                    <label className="flex items-center text-xs text-slate-500">
                      <input type="checkbox" checked={cert.hasInternationalPermit} onChange={e => {
                        const nl = [...data.certifications];
                        nl[idx].hasInternationalPermit = e.target.checked;
                        setData(prev => ({ ...prev, certifications: nl }));
                      }} className="mr-1" /> Int'l Permit?
                    </label>
                    <button onClick={() => setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== cert.id) }))} className="ml-auto text-red-400">✕</button>
                  </div>
                </div>
              ))}
              <button onClick={addCert} className="text-rose-500 text-sm font-medium hover:underline">+ Add License</button>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">General Skills & Hobbies</h3>
              <div>
                <label className="block text-sm text-slate-600">Language Proficiency</label>
                <textarea 
                  value={data.skills.languageLevel} 
                  onChange={e => setData(prev => ({ ...prev, skills: { ...prev.skills, languageLevel: e.target.value }}))}
                  className="w-full p-2 border rounded mt-1 h-20"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Hobbies (Keep it simple, avoid 'Travel' alone)</label>
                <textarea 
                  value={data.skills.hobbies} 
                  onChange={e => setData(prev => ({ ...prev, skills: { ...prev.skills, hobbies: e.target.value }}))}
                  className="w-full p-2 border rounded mt-1 h-20"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <button 
                onClick={handleTranslateAll} 
                disabled={isTranslating}
                className={`w-full py-4 bg-slate-900 text-white rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isTranslating ? 'AI is translating to Japanese...' : 'Generate Japanese Translation (AI)'}
              </button>
            </div>
          </div>
        );
      case FormStep.PREVIEW:
        return <ResumePreview data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Toast Notification */}
      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Resume sent to {data.personalInfo.email}!
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Sakura Resume Builder</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {currentStep === FormStep.PREVIEW && (
            <>
              <button 
                onClick={() => window.print()}
                className="px-3 md:px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                <span className="hidden md:inline">Print PDF</span>
              </button>
              <button 
                onClick={handleDownloadDocx}
                className="px-3 md:px-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                <span className="hidden md:inline">Download DOCX</span>
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={isSending}
                className="px-3 md:px-4 py-2 bg-rose-500 text-white rounded-md text-sm font-medium hover:bg-rose-600 flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                {isSending ? (
                   <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sending...
                   </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span>Send to Email</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto mt-8 px-4">
        <StepIndicator 
          currentStep={currentStep} 
          steps={steps} 
          onStepClick={setCurrentStep} 
        />

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 no-print-background">
          {renderCurrentStep()}
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-8 no-print">
          <button 
            onClick={() => {
              const idx = steps.indexOf(currentStep);
              if (idx > 0) setCurrentStep(steps[idx - 1]);
            }}
            disabled={currentStep === steps[0]}
            className="px-6 py-2 border border-slate-300 rounded-md text-slate-600 font-medium hover:bg-white disabled:opacity-30 transition-all"
          >
            Previous
          </button>
          {currentStep !== FormStep.PREVIEW && (
            <button 
              onClick={() => {
                const idx = steps.indexOf(currentStep);
                if (idx < steps.length - 1) setCurrentStep(steps[idx + 1]);
              }}
              className="px-8 py-2 bg-rose-500 text-white rounded-md font-medium hover:bg-rose-600 shadow-md transition-all"
            >
              Next Step
            </button>
          )}
        </div>
      </main>

      {/* Info Panel for Translator Guidelines */}
      <aside className="fixed right-4 bottom-4 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-4 hidden xl:block no-print animate-slideUp">
        <h4 className="text-sm font-bold text-rose-500 mb-2">Translation Checklist</h4>
        <ul className="text-xs text-slate-600 space-y-2">
          <li>• Name: Surname + First Name</li>
          <li>• Phone: No +81 prefix</li>
          <li>• Education: Chronological order</li>
          <li>• Company Names: Leave in English</li>
          <li>• Descriptions: Bullet points, no desu/masu</li>
          <li>• Driving License: Mention Int'l permit</li>
        </ul>
      </aside>
    </div>
  );
};

export default App;
