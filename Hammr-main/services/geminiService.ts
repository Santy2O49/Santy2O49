import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface CampaignSuggestion {
  segment: string;
  category: string;
  platform: string;
  rationale: string;
}

export interface PriceSuggestion {
    basePrice: number;
}


export const getAIPricingSuggestion = async (
    jobType: string,
    complexity: string,
    location: string,
    demand: string
): Promise<PriceSuggestion> => {
    if (!process.env.API_KEY) {
        // Simple demo calculation for mock mode
        let base = 50;
        if (jobType.toLowerCase().includes('electrical')) base = 75;
        if (jobType.toLowerCase().includes('paint')) base = 150;
        if (jobType.toLowerCase().includes('ac')) base = 250;
        if (complexity === 'Medium') base *= 1.5;
        if (complexity === 'High') base *= 2.5;
        if (demand === 'High') base *= 1.2;
        if (demand === 'Low') base *= 0.9;
        return Promise.resolve({ basePrice: parseFloat(base.toFixed(2)) });
    }

    const prompt = `
        You are a pricing expert for a mobile app called "HAMMR" which operates in El Salvador.
        Your task is to provide a fair market base price suggestion in USD for a specific job.
        Do not consider any adjustments like user ratings or surge pricing yet; just the base price.

        Job Details:
        - Service Category: ${jobType}
        - Complexity: ${complexity}
        - Location: ${location}
        - Current Demand: ${demand}

        Based on these details, what is a fair base price for this job in El Salvador?
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            basePrice: {
                type: Type.NUMBER,
                description: 'The suggested fair market base price in USD.',
            },
        },
        required: ["basePrice"],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2, // Low temp for more deterministic pricing
                responseMimeType: "application/json",
                responseSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PriceSuggestion;
    } catch (error) {
        console.error("Error generating price suggestion:", error);
        throw new Error("Failed to generate price suggestion.");
    }
};

export const generateAdCopy = async (
  segment: string,
  category: string,
  platform: string
): Promise<string> => {
  if (!process.env.API_KEY) {
      return Promise.resolve(`**DEMO MODE**: API key not configured.
      
---
      
**Platform:** ${platform}
**Target Audience:** ${segment}
**Service:** ${category}

**Generated Ad Copy:**

**Headline:** Need ${category}? Find trusted local pros on HAMMR!

**Body:** 
Tired of endless searching? HAMMR connects you with skilled, vetted contractors in El Salvador for any job, big or small. Get fair price estimates and book with confidence.

**Call to Action:** Download HAMMR Today!`);
  }
    
  const prompt = `
    You are an expert marketing copywriter for a mobile app called "HAMMR" which operates in El Salvador.
    The app connects people (Contractees) with skilled workers (Contractors) for home services.
    
    Generate compelling and concise ad copy for the following campaign.
    The tone should be professional, trustworthy, and tailored for the specified platform.
    The language should be Spanish, localized for El Salvador.

    **Platform:** ${platform}
    **Target Audience:** ${segment}
    **Service Category:** ${category}

    Return only the ad copy text, without any preamble. Use Markdown for formatting if appropriate (e.g., for headlines).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 256,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating ad copy:", error);
    throw new Error("Failed to generate ad copy. Please check the console for details.");
  }
};


export const generateCampaignSuggestions = async (
  dataSummary: string
): Promise<CampaignSuggestion[]> => {
    if (!process.env.API_KEY) {
        return Promise.resolve([
            {
                segment: "New homeowners in San Salvador",
                category: "Plumbing Repair",
                platform: "Facebook",
                rationale: "Plumbing issues are common in new homes, and our data shows plumbing is a top category. Facebook allows precise geographic and demographic targeting for this segment."
            },
            {
                segment: "Families preparing for the rainy season",
                category: "Roof Leak Fix",
                platform: "Google Ads",
                rationale: "Target users actively searching for 'roof repair' before the rainy season. This is a high-intent audience that converts well."
            },
            {
                segment: "Landlords and property managers",
                category: "Garden Maintenance",
                platform: "Instagram",
                rationale: "Visually showcase well-maintained properties to attract property managers. Instagram's visual format is ideal for this."
            },
        ]);
    }

    const prompt = `
    You are an expert marketing strategist for a mobile app called "HAMMR" which operates in El Salvador.
    The app connects people (Contractees) with skilled workers (Contractors) for home services.

    Based on the following internal data summary, generate 3 creative and distinct marketing campaign suggestions. Each suggestion should be tailored to the data insights.

    Data Summary:
    ${dataSummary}
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          segment: {
            type: Type.STRING,
            description: 'A specific target audience segment.',
          },
          category: {
            type: Type.STRING,
            description: 'The most relevant service category to promote.',
          },
          platform: {
            type: Type.STRING,
            description: 'The most effective advertising platform (e.g., Facebook, Instagram).',
          },
          rationale: {
            type: Type.STRING,
            description: 'A brief explanation of why this campaign is a good idea based on the data.',
          }
        },
        required: ["segment", "category", "platform", "rationale"],
      },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema,
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as CampaignSuggestion[];
    } catch (error) {
        console.error("Error generating campaign suggestions:", error);
        throw new Error("Failed to generate campaign suggestions. Please check the console for details.");
    }
};
