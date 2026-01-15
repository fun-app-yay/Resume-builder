
import React, { useState } from 'react';
import { ResumeData } from '../../types';
import { suggestKatakana } from '../../services/geminiService';

interface Props {
  data: ResumeData['personalInfo'];
  onChange: (newData: ResumeData['personalInfo']) => void;
}

export const PersonalInfoForm: React.FC<Props> = ({ data, onChange }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handleSuggestKatakana = async () => {
    const fullName = `${data.lastName} ${data.firstName}`.trim();
    if (!fullName) {
      alert("Please enter your name first.");
      return;
    }

    setIsSuggesting(true);
    const suggestion = await suggestKatakana(fullName);
    if (suggestion) {
      onChange({ ...data, furigana: suggestion });
    }
    setIsSuggesting(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Last Name (Surname)</label>
          <input
            type="text"
            name="lastName"
            value={data.lastName}
            onChange={handleChange}
            placeholder="Smith"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">First Name</label>
          <input
            type="text"
            name="firstName"
            value={data.firstName}
            onChange={handleChange}
            placeholder="John"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex justify-between items-end">
            <label className="block text-sm font-medium text-slate-700">Furigana (Phonetic Japanese)</label>
            <button
              type="button"
              onClick={handleSuggestKatakana}
              disabled={isSuggesting}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isSuggesting ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting...
                </>
              ) : (
                <>✨ Suggest Katakana</>
              )}
            </button>
          </div>
          <input
            type="text"
            name="furigana"
            value={data.furigana}
            onChange={handleChange}
            placeholder="スミス ジョン"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
          <p className="text-[10px] text-slate-500 mt-1">Japanese resumes require your name written in Katakana for pronunciation.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
          <input
            type="date"
            name="birthDate"
            value={data.birthDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Gender</label>
          <select
            name="gender"
            value={data.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border bg-white"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Japanese Phone Number (No +81)</label>
          <input
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="08012345678"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
          <p className="text-xs text-slate-500 mt-1">Include the Japanese local number (e.g. starting with 070, 080, 090).</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Current Address in Japan</label>
          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
      </div>
    </div>
  );
};
