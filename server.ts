import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialise Gemini SDK with mandatory telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are OmniTranslate AI, an elite, context-aware translation engine combining structural accuracy, idiomatic fluency, and cultural awareness.

CRITICAL RULES:
1. Detect the source language automatically unless specified.
2. Translate the input text accurately while matching the requested tone (Default to Natural/Idiomatic if not specified).
3. If an idiom, slang, or cultural phrase is used, do not translate it literally. Provide the equivalent phrase in the target language.

You must ALWAYS reply strictly in this valid JSON format so the application frontend can parse it:
{
  "translatedText": "The final polished translation here",
  "detectedLanguage": "English",
  "toneApplied": "Professional",
  "idiomsAndContext": [
    {
      "original": "Break a leg",
      "translation": "Viel Glück / Hals- und Beinbruch",
      "explanation": "An idiom used to wish performers good luck before a show, not to be taken literally."
    }
  ],
  "alternativePhrases": [
    "Alternative way to say it 1",
    "Alternative way to say it 2"
  ]
}`;

// Translate endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const {
      text,
      targetLanguage = 'Spanish',
      sourceLanguage = 'Auto-Detect',
      tone = 'Natural/Idiomatic',
      context = '',
      formality = 'auto',
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text to translate is required' });
    }

    const prompt = `Translate the following text into ${targetLanguage}.
${sourceLanguage && sourceLanguage !== 'Auto-Detect' ? `Source Language specified: ${sourceLanguage}` : 'Detect the source language automatically.'}
Requested Tone: ${tone || 'Natural/Idiomatic'}
${formality && formality !== 'auto' ? `Formality Preference: ${formality}` : ''}
${context ? `Cultural / Domain Context Notes: ${context}` : ''}

Input Text to translate:
"""
${text}
"""`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        translatedText: {
          type: Type.STRING,
          description: 'The final polished translation matching the requested tone and culturally localized idioms.',
        },
        detectedLanguage: {
          type: Type.STRING,
          description: 'The detected or confirmed source language of the input text.',
        },
        toneApplied: {
          type: Type.STRING,
          description: 'The tone applied to the translation.',
        },
        idiomsAndContext: {
          type: Type.ARRAY,
          description: 'Array of detected idioms, slang, colloquialisms, or cultural expressions with their equivalents and explanations.',
          items: {
            type: Type.OBJECT,
            properties: {
              original: {
                type: Type.STRING,
                description: 'The original phrase or idiom found in the source text.',
              },
              translation: {
                type: Type.STRING,
                description: 'The culturally resonant equivalent in the target language.',
              },
              explanation: {
                type: Type.STRING,
                description: 'Cultural explanation detailing why this translation was chosen instead of a literal translation.',
              },
            },
            required: ['original', 'translation', 'explanation'],
          },
        },
        alternativePhrases: {
          type: Type.ARRAY,
          description: 'Alternative phrasings or synonyms for the translation in the target language.',
          items: {
            type: Type.STRING,
          },
        },
      },
      required: [
        'translatedText',
        'detectedLanguage',
        'toneApplied',
        'idiomsAndContext',
        'alternativePhrases',
      ],
    };

    // Resilient model calling with fallback
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next candidate...`, err?.message || err);
        // Quick pause before retry
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from translation models');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate translation.',
    });
  }
});

// Compare multiple tones endpoint
app.post('/api/compare-tones', async (req, res) => {
  try {
    const { text, targetLanguage = 'Spanish', tones = ['Natural/Idiomatic', 'Professional', 'Casual/Slang', 'Poetic/Literary'] } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Translate the following text into ${targetLanguage} across multiple distinct tones: ${tones.join(', ')}.
For each tone, localize idioms accurately and adapt grammar, register, and vocabulary.

Input Text:
"""
${text}
"""`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        detectedLanguage: { type: Type.STRING },
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tone: { type: Type.STRING },
              translatedText: { type: Type.STRING },
              nuanceNotes: { type: Type.STRING },
            },
            required: ['tone', 'translatedText'],
          },
        },
      },
      required: ['detectedLanguage', 'results'],
    };

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText = '';

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Compare tones model ${model} failed, trying next...`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!responseText) {
      throw lastError || new Error('No response from comparison models');
    }

    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Tone comparison error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to compare tones.' });
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore', language = 'auto' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 500), // optimal length for crisp unary audio
              speechMetadata: {
                style: `Natural, clear, articulate native speaker pronunciation in ${language}`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio stream returned from Gemini TTS' });
    }

    return res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniTranslate AI] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
