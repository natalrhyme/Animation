// FIX: Import GoogleGenAI and types for interacting with the Gemini API.
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// FIX: Initialize the GoogleGenAI client using the API_KEY from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const systemInstruction = `You are an expert p5.js creative coder. Your goal is to generate p5.js code for animations based on a user's prompt.
The user is a beginner, so your code should be simple, well-commented, and self-contained within the standard p5.js 'setup()' and 'draw()' functions.
You must not include any HTML, CSS, or any other languages.
You must not wrap your code in markdown backticks (\`\`\`).
You must only return the raw p5.js code.
The animation should run on a canvas of size 360x640. Initialize it with 'createCanvas(360, 640);' in the 'setup()' function.
Do not use any external libraries or assets. All visuals must be generated with p5.js drawing functions.

SOUND:
The p5.sound library is available. You can add sound effects using oscillators (e.g., p5.Oscillator) or noise.
To comply with browser policies, please start any audio context inside a 'mousePressed()' or 'keyPressed()' function. This is critical.
If you add sound, please also implement a mute toggle. A simple way is to check for a key press (like 'm') in keyPressed() to toggle a global 'isMuted' variable, and then use that variable to control the sound output (e.g., masterVolume(isMuted ? 0 : 1)).`;

export const generateAnimationCode = async (prompt: string): Promise<string> => {
  try {
    // FIX: Use ai.models.generateContent to generate code from a prompt, following SDK guidelines.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
        },
    });

    // FIX: Access the 'text' property directly from the response object for the generated content.
    const code = response.text;
    if (!code) {
        throw new Error("API returned an empty response.");
    }
    return code.trim();
  } catch (error) {
    console.error("Error generating animation code:", error);
    if (error instanceof Error) {
        return `// Error generating code: ${error.message}`;
    }
    return "// An unknown error occurred.";
  }
};

export const refineCodeWithChat = async (message: string, currentCode: string, history: ChatMessage[]): Promise<string> => {
    
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
The user has provided initial code which you should now refine based on their requests. Here is the current code:
\`\`\`javascript
${currentCode}
\`\`\`
Your task is to take the user's refinement request and return a new, complete, and valid p5.js script that incorporates the change.
Remember, only return the raw p5.js code, without any markdown formatting or explanations.`,
            },
        });
        
        // FIX: Access the 'text' property directly from the response object for the refined code.
        const newCode = response.text;
        if (!newCode) {
            throw new Error("API returned an empty response during chat.");
        }
        
        return newCode.trim();
    } catch (error) {
        console.error("Error refining code with chat:", error);
        if (error instanceof Error) {
            return `// Error refining code: ${error.message}`;
        }
        return "// An unknown error occurred during refinement.";
    }
};