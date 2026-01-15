
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are a professional Japanese resume (Rirekisho) translator. 
Your goal is to convert English resume details into concise, professional Japanese.

Follow these strict rules:
1. DO NOT translate names of Companies, Schools, or Organizations. Leave them in their original English/Latin script.
2. Use bullet points for tasks/descriptions.
3. Use professional, concise Japanese (Teinei-go but avoid over-long sentences). Avoid "Desu/Masu" in bullet points.
4. For "Contract Types", use appropriate Japanese: 正社員 (Full-time), アルバイト (Part-time), インターンシップ (Internship), 業務委託 (Contract/Freelance).
5. Ensure the tone is appropriate for a Japanese employer.
6. For skills, format as "Skill Name: Level" (e.g. "English: Native level").
7. IMPORTANT: If a field is empty or lacks meaningful content, return an EMPTY STRING. 
8. DO NOT provide placeholders like "Please describe your skills here" or "（こちらに具体的な技術スキルを記載してください）".
`;

export async function translateResumeSection(text: string, context: string): Promise<string> {
  if (!text || text.trim().length === 0) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following ${context} content into professional Japanese for a resume. If the content is empty or generic, return an empty string: \n\n${text}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, // Lower temperature for more consistent results
      },
    });

    const result = response.text || '';
    // Extra safety: if the model still hallucinated a placeholder, we clear it if it looks like one
    if (result.includes("こちらに") || result.includes("記載してください")) {
      return "";
    }
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return "";
  }
}

export async function suggestKatakana(englishName: string): Promise<string> {
  if (!englishName.trim()) return "";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide the Katakana (furigana) transliteration for this Western name: "${englishName}". Return ONLY the Katakana characters, nothing else. Example: "John Smith" -> "ジョン スミス"`,
      config: {
        systemInstruction: "You are a Japanese linguistics expert. Provide accurate Katakana transliterations for Western names.",
        temperature: 0.1,
      },
    });

    return (response.text || "").trim();
  } catch (error) {
    console.error("Katakana suggestion error:", error);
    return "";
  }
}

export async function autoTranslateAll(data: ResumeData): Promise<Partial<ResumeData>> {
  // Translate Work Experience
  const workPromises = data.workExperience.map(async (work) => ({
    id: work.id,
    translatedDescription: await translateResumeSection(work.description, "work experience tasks")
  }));

  // Translate Education
  const educationPromises = data.education.map(async (edu) => {
    const translatedDegree = await translateResumeSection(edu.degree, "academic degree or major");
    return {
      id: edu.id,
      translatedInstitution: edu.institution, // Keep original script for institution
      translatedDegree: translatedDegree
    };
  });

  // Translate Skills
  const skillsInput = [
    data.skills.languageLevel ? `Languages: ${data.skills.languageLevel}` : "",
    data.skills.technicalSkills ? `Technical: ${data.skills.technicalSkills}` : "",
    data.skills.hobbies ? `Hobbies: ${data.skills.hobbies}` : ""
  ].filter(Boolean).join("\n");

  const translatedSkillsText = skillsInput 
    ? await translateResumeSection(skillsInput, "skills and hobbies")
    : "";

  const [translatedWorks, translatedEdus, finalSkills] = await Promise.all([
    Promise.all(workPromises),
    Promise.all(educationPromises),
    Promise.resolve(translatedSkillsText)
  ]);

  return {
    workExperience: data.workExperience.map(w => ({
      ...w,
      translatedDescription: translatedWorks.find(tw => tw.id === w.id)?.translatedDescription || w.translatedDescription
    })),
    education: data.education.map(e => {
      const trans = translatedEdus.find(te => te.id === e.id);
      return {
        ...e,
        translatedInstitution: trans?.translatedInstitution || e.institution,
        translatedDegree: trans?.translatedDegree || e.degree
      };
    }),
    translatedSkills: {
      languageLevel: finalSkills, 
      technicalSkills: "", // Combined into languageLevel for simplicity in rirekisho layout
      hobbies: ""
    }
  };
}
