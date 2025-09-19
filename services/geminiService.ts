// FIX: Import GoogleGenAI and types for interacting with the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

// FIX: Initialize the GoogleGenAI client using the API_KEY from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are an expert p5.js creative coder and a short-form storyteller. Your goal is to generate p5.js code for an animation and a narration script based on a user's prompt.
You must return a JSON object with two properties: "code" and "script".

- "code": This should contain the p5.js code. The code should be simple, well-commented, and self-contained within the standard p5.js 'setup()' and 'draw()' functions.
  - The animation should run on a canvas of size 360x640. Initialize it with 'createCanvas(360, 640);' in the 'setup()' function.
  - Do not use any external libraries or assets. All visuals must be generated with p5.js drawing functions.
  - The p5.sound library is available. To comply with browser policies, start any audio context inside a 'mousePressed()' or 'keyPressed()' function. If you add sound, please also implement a mute toggle (e.g., via 'm' key).
- "script": This should be a short, engaging narration for the animation (maximum 50 words). It should describe what's happening or add a creative layer to the visual.

Example response format:
{
  "code": "function setup() {\\n  createCanvas(360, 640);\\n}\\n\\nfunction draw() {\\n  background(220);\\n  ellipse(width / 2, height / 2, 50, 50);\\n}",
  "script": "A simple circle, waiting for an adventure to begin on this gray canvas."
}

Do not include any HTML, CSS, or any other languages in the "code" property. Do not wrap the JSON response in markdown backticks. Only return the raw JSON object.`;

export interface AnimationResponse {
    code: string;
    script: string;
}

export const generateAnimationCode = async (prompt: string): Promise<AnimationResponse> => {
  try {
    // FIX: Use ai.models.generateContent to generate code from a prompt, following SDK guidelines.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING, description: "The p5.js code for the animation." },
                    script: { type: Type.STRING, description: "A short, engaging narration script for the animation." }
                },
                required: ["code", "script"]
            },
        },
    });

    // FIX: Access the 'text' property directly from the response object for the generated content.
    const responseText = response.text.trim();
    const parsed: AnimationResponse = JSON.parse(responseText);
    
    if (!parsed.code || typeof parsed.script === 'undefined') {
        throw new Error("API response is missing 'code' or 'script' properties.");
    }
    return parsed;
  } catch (error) {
    console.error("Error generating animation code:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
        code: `// Error generating code: ${errorMessage}`,
        script: "Could not generate a script due to an error."
    };
  }
};

export const refineCodeWithChat = async (message: string, currentCode: string, currentScript: string, history: ChatMessage[]): Promise<AnimationResponse> => {
    
    const chatHistory: ChatMessage[] = [
        ...history,
        {
            role: 'user',
            parts: [{ text: message }],
        },
    ];

    try {
        // FIX: Use ai.models.generateContent with chat history for code refinement.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: chatHistory,
            config: {
                systemInstruction: `${systemInstruction}
The user has provided initial code and a script which you should now refine based on their requests. Here is the current code:
\`\`\`javascript
${currentCode}
\`\`\`
And here is the current script: "${currentScript}"

Your task is to take the user's refinement request and return a new, complete JSON object containing the updated "code" and "script".
If the user's request is purely visual (e.g., "make it blue"), update the code and keep the script the same or adjust it slightly to match.
If the request is about the story (e.g., "make it happier"), you should primarily update the script and make minor, corresponding changes to the code if necessary.
Remember, only return the raw JSON object, without any markdown formatting or explanations.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        code: { type: Type.STRING, description: "The updated p5.js code for the animation." },
                        script: { type: Type.STRING, description: "The updated narration script for the animation." }
                    },
                    required: ["code", "script"]
                },
            },
        });
        
        // FIX: Access the 'text' property directly from the response object for the refined code.
        const responseText = response.text.trim();
        const parsed: AnimationResponse = JSON.parse(responseText);

        if (!parsed.code || typeof parsed.script === 'undefined') {
            throw new Error("API response is missing 'code' or 'script' properties during chat.");
        }
        
        return parsed;
    } catch (error) {
        console.error("Error refining code with chat:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during refinement.";
        return {
            code: `// Error refining code: ${errorMessage}`,
            script: "Could not refine the script due to an error."
        };
    }
};