
import React from 'react';
import { ResumeData } from '../../types';

interface Props {
  data: ResumeData['visa'];
  onChange: (newData: ResumeData['visa']) => void;
}

export const VisaStatusForm: React.FC<Props> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">Visa Information</h2>
      <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 mb-6">
        <p className="text-sm text-rose-800">
          <strong>Tip:</strong> Japanese employers are very interested in how much time you have left on your Working Holiday visa.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Visa Type</label>
          <input
            type="text"
            name="type"
            value={data.type}
            onChange={handleChange}
            placeholder="Working Holiday"
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={data.expiryDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 border"
          />
        </div>
      </div>
    </div>
  );
};
