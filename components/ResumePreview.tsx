
import React from 'react';
import { ResumeData } from '../types';

interface Props {
  data: ResumeData;
}

export const ResumePreview: React.FC<Props> = ({ data }) => {
  const { personalInfo, education, workExperience, certifications, skills, translatedSkills } = data;

  // Formatting for Japanese Resume Style
  const formatDateJapanese = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
  };

  // Only show education entries that have an institution name
  const filteredEducation = education.filter(edu => edu.institution && edu.institution.trim() !== '');

  return (
    <div id="resume-preview-content" className="max-w-[210mm] mx-auto bg-white shadow-xl p-[20mm] border border-slate-200 text-slate-900 leading-relaxed print:shadow-none print:border-0" style={{ fontSize: '10.5pt' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl font-bold tracking-widest border-b-2 border-slate-900 pb-1">履 歴 書</h1>
        <div className="text-sm">
          {new Date().getFullYear()}年 {new Date().getMonth() + 1}月 {new Date().getDate()}日 現在
        </div>
      </div>

      {/* Personal Info Grid */}
      <div className="grid grid-cols-[1fr_150px] border-2 border-slate-900 mb-6">
        <div className="border-r border-slate-900">
          <div className="border-b border-slate-900 p-1 text-[8pt] bg-slate-50">ふりがな: {personalInfo.furigana}</div>
          <div className="p-4 flex items-baseline gap-4">
            <span className="text-xl font-bold">{personalInfo.lastName} {personalInfo.firstName}</span>
            <span className="text-sm">({personalInfo.gender === 'Male' ? '男' : '女'})</span>
          </div>
          <div className="border-t border-slate-900 grid grid-cols-[auto_1fr] text-sm">
            <div className="p-2 border-r border-slate-900 bg-slate-50">生年月日</div>
            <div className="p-2">
              {personalInfo.birthDate ? new Date(personalInfo.birthDate).getFullYear() : '____'}年 
              {personalInfo.birthDate ? new Date(personalInfo.birthDate).getMonth() + 1 : '__'}月 
              {personalInfo.birthDate ? new Date(personalInfo.birthDate).getDate() : '__'}日生 
              (満 {personalInfo.birthDate ? new Date().getFullYear() - new Date(personalInfo.birthDate).getFullYear() : '__'} 歳)
            </div>
          </div>
          <div className="border-t border-slate-900 p-2 text-sm">
            住所: {personalInfo.address}
          </div>
          <div className="border-t border-slate-900 p-2 text-sm grid grid-cols-2">
            <div>電話: {personalInfo.phone}</div>
            <div>E-mail: {personalInfo.email}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-[8pt] text-slate-400 p-2 text-center italic">
          Photo Area<br/>(Apply photo here)
        </div>
      </div>

      {/* Visa Status Section */}
      <div className="border-2 border-slate-900 border-t-0 mb-6 p-2 text-sm bg-rose-50">
        <strong>在留資格 / Visa Status:</strong> {data.visa.type || 'Working Holiday'} (Expiry: {data.visa.expiryDate || 'Not specified'})
      </div>

      {/* Education & Work Experience */}
      <table className="w-full border-2 border-slate-900 border-collapse mb-6 text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-r border-b border-slate-900 w-24 p-1">年</th>
            <th className="border-r border-b border-slate-900 w-16 p-1">月</th>
            <th className="border-b border-slate-900 p-1">学歴・職歴</th>
          </tr>
        </thead>
        <tbody>
          {/* Education Header */}
          <tr>
            <td className="border-r border-slate-900"></td>
            <td className="border-r border-slate-900"></td>
            <td className="text-center font-bold tracking-widest py-1">学 歴</td>
          </tr>
          {filteredEducation.map((edu) => (
            <React.Fragment key={edu.id}>
              {edu.startDate && (
                <tr>
                  <td className="border-r border-slate-900 text-center">{new Date(edu.startDate).getFullYear()}</td>
                  <td className="border-r border-slate-900 text-center">{new Date(edu.startDate).getMonth() + 1}</td>
                  <td className="px-2">
                    {edu.translatedInstitution || edu.institution} {edu.translatedDegree || edu.degree} 入学 ({edu.country})
                  </td>
                </tr>
              )}
              {edu.endDate && (
                <tr>
                  <td className="border-r border-slate-900 text-center">{new Date(edu.endDate).getFullYear()}</td>
                  <td className="border-r border-slate-900 text-center">{new Date(edu.endDate).getMonth() + 1}</td>
                  <td className="px-2">
                    {edu.translatedInstitution || edu.institution} {edu.status === 'Graduated' ? '卒業' : '終了'} ({edu.country})
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}

          {/* Work Header */}
          <tr>
            <td className="border-r border-slate-900"></td>
            <td className="border-r border-slate-900"></td>
            <td className="text-center font-bold tracking-widest py-1 border-t border-slate-300">職 歴</td>
          </tr>
          {workExperience.map((work) => (
            <React.Fragment key={work.id}>
              {work.startDate && (
                <tr>
                  <td className="border-r border-slate-900 text-center">{new Date(work.startDate).getFullYear()}</td>
                  <td className="border-r border-slate-900 text-center">{new Date(work.startDate).getMonth() + 1}</td>
                  <td className="px-2 font-medium">{work.company} 入社 ({work.country})</td>
                </tr>
              )}
              {work.translatedDescription && (
                <tr>
                  <td className="border-r border-slate-900"></td>
                  <td className="border-r border-slate-900"></td>
                  <td className="px-4 text-[9pt] text-slate-700 whitespace-pre-wrap pb-2">
                    {work.translatedDescription}
                  </td>
                </tr>
              )}
              {work.endDate && (
                <tr>
                  <td className="border-r border-slate-900 text-center">{new Date(work.endDate).getFullYear()}</td>
                  <td className="border-r border-slate-900 text-center">{new Date(work.endDate).getMonth() + 1}</td>
                  <td className="px-2">{work.company} 一身上の都合により退社</td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {/* Ending row */}
          <tr>
            <td className="border-r border-slate-900"></td>
            <td className="border-r border-slate-900"></td>
            <td className="text-right px-4">以上</td>
          </tr>
        </tbody>
      </table>

      {/* Certifications */}
      <table className="w-full border-2 border-slate-900 border-collapse mb-6 text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border-r border-b border-slate-900 w-24 p-1">年</th>
            <th className="border-r border-b border-slate-900 w-16 p-1">月</th>
            <th className="border-b border-slate-900 p-1">免許・資格</th>
          </tr>
        </thead>
        <tbody>
          {certifications.map((cert) => (
            <tr key={cert.id}>
              <td className="border-r border-slate-900 text-center p-1">{new Date(cert.date).getFullYear()}</td>
              <td className="border-r border-slate-900 text-center p-1">{new Date(cert.date).getMonth() + 1}</td>
              <td className="px-2 py-1">
                {cert.name} {cert.isDrivingLicense ? '取得' : '合格'} ({cert.country})
                {cert.hasInternationalPermit && <div className="text-[8pt] text-slate-600">※ 国際免許証 取得 (日本国内での運転可能)</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Skills & Others */}
      <div className="grid grid-cols-1 border-2 border-slate-900 p-4 text-sm gap-4">
        <div>
          <div className="font-bold border-b border-slate-300 mb-1">語学・スキル (Languages & Skills)</div>
          <div className="whitespace-pre-wrap min-h-[1em]">
            {translatedSkills?.languageLevel || skills.languageLevel || ''}
          </div>
        </div>
        <div>
          <div className="font-bold border-b border-slate-300 mb-1">趣味・特技 (Hobbies & Interests)</div>
          <div className="whitespace-pre-wrap min-h-[1em]">
            {skills.hobbies || ''}
          </div>
        </div>
      </div>
    </div>
  );
};
