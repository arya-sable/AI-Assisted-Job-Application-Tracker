import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface ParsedJobDescription {
  companyName: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
  salaryRange: string;
  resumeSuggestions: string[];
}

const PARSE_SYSTEM_PROMPT = `You are an expert recruiter. Extract structured data from job descriptions.
Return ONLY valid JSON matching this exact schema — no markdown, no extra text:
{
  "companyName": string,
  "role": string,
  "requiredSkills": string[],
  "niceToHaveSkills": string[],
  "seniority": string,
  "location": string,
  "salaryRange": string,
  "resumeSuggestions": string[]  // 3-5 specific resume bullet points tailored to this role
}
Use an empty string for salaryRange when the JD does not mention compensation. Preserve useful salary text such as "$120k-$150k", "₹12 LPA - ₹18 LPA", "Up to €90,000", "DOE", or "competitive".
Resume bullet points must:
- Start with a strong action verb (Built, Designed, Reduced, Implemented, Led...)
- Reference specific technologies or skills from the JD
- Include a measurable outcome where possible
- Be specific to THIS role, not generic advice`;

export const parseJobDescription = async (
  jobDescription: string
): Promise<ParsedJobDescription> => {
  if (!jobDescription?.trim()) {
    throw new Error('Job description cannot be empty');
  }

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: PARSE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Parse this job description:\n\n${jobDescription.slice(0, 8000)}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) throw new Error('Groq returned an empty response');

  const parsed = JSON.parse(rawContent) as Partial<ParsedJobDescription>;

  const required: (keyof ParsedJobDescription)[] = [
    'companyName', 'role', 'requiredSkills', 'niceToHaveSkills',
    'seniority', 'location', 'resumeSuggestions',
  ];

  for (const field of required) {
    if (parsed[field] === undefined || parsed[field] === null) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }

  return {
    companyName: parsed.companyName ?? '',
    role: parsed.role ?? '',
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
    niceToHaveSkills: Array.isArray(parsed.niceToHaveSkills) ? parsed.niceToHaveSkills : [],
    seniority: parsed.seniority ?? '',
    location: parsed.location ?? '',
    salaryRange: typeof parsed.salaryRange === 'string' ? parsed.salaryRange : '',
    resumeSuggestions: Array.isArray(parsed.resumeSuggestions)
      ? parsed.resumeSuggestions.slice(0, 5)
      : [],
  };
};
