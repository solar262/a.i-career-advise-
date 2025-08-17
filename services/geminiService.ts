import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisType, Employee, PredictionResult, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const roiSchema = {
  type: Type.OBJECT,
  properties: {
    predictedRoiPercentage: { type: Type.NUMBER, description: "Predicted Return on Investment as a percentage, e.g., 150.5" },
    summary: { type: Type.STRING, description: "A concise summary of the forecast and its rationale." },
    quarterlyImpact: {
      type: Type.ARRAY,
      description: "Projected performance uplift over the next four quarters.",
      items: {
        type: Type.OBJECT,
        properties: {
          quarter: { type: Type.STRING, description: "The quarter, e.g., 'Q3 2024'" },
          upliftPercentage: { type: Type.NUMBER, description: "The percentage uplift in relevant KPIs." }
        },
        required: ["quarter", "upliftPercentage"],
      },
    },
    keyFactors: {
      type: Type.ARRAY,
      description: "Key factors influencing this ROI prediction.",
      items: { type: Type.STRING }
    },
  },
  required: ["predictedRoiPercentage", "summary", "quarterlyImpact", "keyFactors"],
};

const skillGapSchema = {
  type: Type.OBJECT,
  properties: {
    analysisSummary: { type: Type.STRING, description: "A brief summary of the skill gap analysis." },
    futureSkills: {
      type: Type.ARRAY,
      description: "A list of skills that will be in high demand.",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING, description: "The name of the future-proof skill." },
          importance: { type: Type.NUMBER, description: "Importance rating from 1 (low) to 10 (high)." }
        },
        required: ["skill", "importance"],
      }
    },
    decliningSkills: {
      type: Type.ARRAY,
      description: "A list of skills with declining relevance.",
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING, description: "The name of the declining skill." },
          importance: { type: Type.NUMBER, description: "Importance rating from 1 (high relevance) to 10 (low relevance)." }
        },
        required: ["skill", "importance"],
      }
    },
  },
  required: ["analysisSummary", "futureSkills", "decliningSkills"],
};

const devPlanSchema = {
  type: Type.OBJECT,
  properties: {
    employeeName: { type: Type.STRING },
    currentRole: { type: Type.STRING },
    targetRole: { type: Type.STRING },
    summary: { type: Type.STRING, description: "A summary of the development plan's goals." },
    developmentSteps: {
      type: Type.ARRAY,
      description: "Actionable steps for the employee's development.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.NUMBER, description: "Sequential step number." },
          action: { type: Type.STRING, description: "Specific action or training to undertake." },
          resources: { type: Type.STRING, description: "Suggested resources (e.g., courses, books, mentors)." },
          timeline: { type: Type.STRING, description: "Estimated timeline for completion (e.g., '2 weeks')." }
        },
        required: ["step", "action", "resources", "timeline"],
      }
    },
  },
  required: ["employeeName", "currentRole", "targetRole", "summary", "developmentSteps"],
};

const generatePrompt = (type: AnalysisType, context: any): { prompt: string; schema: object } => {
  switch (type) {
    case AnalysisType.ROI_FORECAST:
      return {
        prompt: `Analyze the following training initiative and forecast its Return on Investment (ROI). Provide a detailed breakdown. Initiative: ${context.initiativeDescription}`,
        schema: roiSchema
      };
    case AnalysisType.SKILL_GAPS:
      return {
        prompt: `Identify future skill gaps for the following department/industry based on market trends and technological advancements. Department/Industry: ${context.departmentDescription}`,
        schema: skillGapSchema
      };
    case AnalysisType.DEV_PLAN:
      const { employee, goals } = context as { employee: Employee, goals: string };
      return {
        prompt: `Create a personalized development plan for ${employee.name}, currently a ${employee.role} in the ${employee.department} department. Their career goal is: "${goals}". The plan should help them reach a senior or related advanced role.`,
        schema: devPlanSchema
      };
    default:
      throw new Error("Invalid analysis type");
  }
};

export const generatePrediction = async (type: AnalysisType, context: any) => {
  try {
    const { prompt, schema } = generatePrompt(type, context);

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("API returned an empty response.");
    }
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return { error: `An error occurred while generating the prediction: ${error.message}` };
    }
    return { error: "An unknown error occurred while generating the prediction." };
  }
};

export type RefineContext = 'ROI_DESCRIPTION' | 'SKILL_GAPS_CONTEXT' | 'DEV_PLAN_GOALS';

const getRefinePrompt = (textToRefine: string, context: RefineContext): string => {
    switch (context) {
        case 'ROI_DESCRIPTION':
            return `You are an expert business analyst. Expand the following brief training initiative description into a detailed, professional paragraph of 3-4 sentences suitable for a detailed ROI analysis. Add plausible specifics like target audience, duration, key learning modules, and methodology. Do not add any preamble like "Here's the refined description:", just return the refined text. Here is the description: "${textToRefine}"`;
        case 'SKILL_GAPS_CONTEXT':
            return `You are a future-of-work strategist. Take the following department or industry name and expand it slightly to provide better context for a skill gap analysis. For example, if the input is 'Marketing', a good output would be 'The digital marketing landscape, focusing on consumer B2C engagement and data analytics'. Do not add any preamble, just return the refined text. Here is the context: "${textToRefine}"`;
        case 'DEV_PLAN_GOALS':
            return `You are a career development coach. Expand the following brief career goal into a more detailed, actionable objective of 2-3 sentences for a personalized development plan. Include aspects like desired leadership skills, technical competencies, and a potential timeline. Do not add any preamble, just return the refined text. Here is the goal: "${textToRefine}"`;
        default:
            return textToRefine;
    }
}

export const refineTextWithAI = async (textToRefine: string, context: RefineContext) => {
    if (!textToRefine.trim()) {
        return { error: "Cannot refine empty text." };
    }
    try {
        const prompt = getRefinePrompt(textToRefine, context);
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { temperature: 0.6 }
        });
        
        const refinedText = response.text.trim();
        if (!refinedText) {
            throw new Error("AI returned an empty response for refinement.");
        }
        return { refinedText };
    } catch (error) {
        console.error("Error calling Gemini API for refinement:", error);
        if (error instanceof Error) {
            return { error: `An error occurred during refinement: ${error.message}` };
        }
        return { error: "An unknown error occurred during refinement." };
    }
};

// --- CHAT FUNCTIONALITY ---

export const getChatStream = (systemInstruction: string, history: ChatMessage[]) => {
    return ai.models.generateContentStream({
        model,
        contents: history,
        config: {
            systemInstruction,
            temperature: 0.7,
        },
    });
};
