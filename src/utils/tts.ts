let currentAudio: HTMLAudioElement | null = null;

export async function playPronunciation(
  text: string,
  targetLanguage: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  // Stop existing audio if playing
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  onStart?.();

  try {
    // 1. Try Gemini 3.8 Flash Lite TTS endpoint first
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: targetLanguage,
        voice: 'Kore',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        currentAudio = audio;
        audio.onended = () => {
          currentAudio = null;
          onEnd?.();
        };
        audio.onerror = () => {
          fallbackSpeechSynthesis(text, targetLanguage, onEnd);
        };
        await audio.play();
        return;
      }
    }
    // Fallback if API returned non-200 or no data
    fallbackSpeechSynthesis(text, targetLanguage, onEnd);
  } catch (err) {
    console.warn('Gemini TTS network issue, falling back to Web Speech:', err);
    fallbackSpeechSynthesis(text, targetLanguage, onEnd);
  }
}

function fallbackSpeechSynthesis(text: string, targetLanguage: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    // Find closest language code
    const langMap: Record<string, string> = {
      Spanish: 'es-ES',
      English: 'en-US',
      French: 'fr-FR',
      German: 'de-DE',
      Japanese: 'ja-JP',
      Italian: 'it-IT',
      Portuguese: 'pt-BR',
      Russian: 'ru-RU',
      'Chinese (Simplified)': 'zh-CN',
      'Chinese (Traditional)': 'zh-TW',
      Korean: 'ko-KR',
      Dutch: 'nl-NL',
      Swedish: 'sv-SE',
      Polish: 'pl-PL',
      Turkish: 'tr-TR',
      Arabic: 'ar-SA',
      Hindi: 'hi-IN',
    };

    if (langMap[targetLanguage]) {
      utterance.lang = langMap[targetLanguage];
    }

    utterance.rate = 0.95;
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('Speech synthesis error:', e);
    onEnd?.();
  }
}

export function stopPronunciation() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
