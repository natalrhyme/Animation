# Gen P5* Animator

Gen P5* Animator is an interactive web application that brings your creative ideas to life by generating p5.js animations from simple text descriptions. Using the power of the Google Gemini API, you can describe an animation, see the generated code and a live preview instantly, and then refine your creation through a simple chat interface.

This tool is designed for artists, students, and creative coders of all levels—from beginners who want to learn p5.js to experienced developers looking for a rapid prototyping tool.

## Features

-   **AI-Powered Code Generation:** Describe the animation you want in plain English (e.g., "bouncing balls that change color on impact"), and the AI will generate the p5.js code for it.
-   **Live Preview:** See your animation running in real-time right next to the code.
-   **Iterative Refinement:** Use the chat to ask for changes. "Make the background black," "add more circles," or "make it react to the mouse" – the AI will understand and update the code accordingly.
-   **Code Display:** View the generated, well-commented p5.js code. You can easily copy it to use in your own projects.
-   **Fullscreen Mode:** Immerse yourself in your creation with a fullscreen animation view.
-   **Export & Share:** Record your animations as high-quality GIFs or WebM videos to save and share your work.

## How It Works

1.  **Describe:** You enter a prompt describing the animation you envision in the "Describe Your Animation" text area.
2.  **Generate:** The application sends your prompt to the Google Gemini API with a specialized system instruction that guides it to produce valid and creative p5.js code.
3.  **View:** The generated code is displayed on the left, and a live preview of the p5.js sketch is rendered in an iframe on the right.
4.  **Refine:** If you want to make changes, simply type your request into the "Refine Your Animation" chat box. The application maintains a conversation history with the AI, allowing it to understand the context and modify the existing code.
5.  **Record:** Once you're happy with the result, you can use the export feature to record a video of your animation.

## Technology Stack

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Model:** Google Gemini API (`@google/genai`)
-   **Animation:** p5.js (including p5.sound for audio)
-   **Recording:** `ccapture.js`

## Getting Started

To run this project, you need a valid Google Gemini API key. The application is configured to read this key from a `process.env.API_KEY` environment variable. Once the key is set up, you can serve the `index.html` file to start creating.
