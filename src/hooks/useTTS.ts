import { useState, useEffect, useCallback, useRef } from "react";
import { playMeditationChime } from "../utils/audioChime";

export interface SpeakOptions {
  interrupt?: boolean; // Only if explicit user action demands immediate stop
  clearQueue?: boolean;
  chime?: boolean; // Play gentle acoustic chime with speech
}

export interface UseTTSResult {
  isSupported: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  speak: (text: string, options?: SpeakOptions) => void;
  stop: () => void;
  activeSubtitle: string;
  rate: number;
  setRate: (rate: number) => void;
  pitch: number;
  setPitch: (pitch: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  isAiVoice: boolean;
  setIsAiVoice: (useAi: boolean) => void;
  isLoadingAiAudio: boolean;
  isPlaying: boolean;
  testVoice: () => void;
}

// In-memory audio cache for zero-latency server audio
const audioClipCache = new Map<string, string>();
let isAiVoiceQuotaExceeded = false;

// Global persistent storage to prevent V8 Garbage Collection mid-speech
if (typeof window !== "undefined") {
  (window as any).__ophthal_active_utterances = (window as any).__ophthal_active_utterances || new Set();
}

/**
 * Normalizes and enriches Korean text with natural breath pauses (commas)
 * so synthesis sounds human, empathetic, and continuous rather than robotic.
 */
function enhanceKoreanProsody(raw: string): string {
  let text = raw.trim();
  // Ensure soft pauses around commas for natural cadence
  text = text.replace(/([가-힣]+)(입니다|하십시오|하세요|바랍니다|됩니다|뜨세요|감으세요|내쉬세요|마시세요)\b/g, "$1$2, ");
  // Remove redundant punctuation clusters
  text = text.replace(/,{2,}/g, ",");
  return text.trim();
}

/**
 * Score voices to find the highest-fidelity, most human-sounding Korean voice available.
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  // Language match
  if (lang === "ko-kr" || lang === "ko_kr" || lang === "ko") {
    score += 50;
  } else if (!lang.startsWith("ko")) {
    return 0; // Not a Korean voice
  }

  // Microsoft Edge Natural / Online Neural voices (Industry best in browsers)
  if (name.includes("online (natural)") || name.includes("natural")) {
    score += 100;
  }
  // Apple / Safari Enhanced / Premium voices
  if (name.includes("enhanced") || name.includes("premium")) {
    score += 90;
  }
  // Chrome Google Neural / High quality voices
  if (name.includes("google") && (name.includes("한국") || name.includes("korean"))) {
    score += 85;
  }
  // Known high-fidelity named personas
  if (name.includes("sunhi") || name.includes("yuna") || name.includes("injoon") || name.includes("sora")) {
    score += 80;
  }
  // Neural indicators
  if (name.includes("neural")) {
    score += 75;
  }

  return score;
}

export function useTTS(): UseTTSResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [rate, setRate] = useState(0.95); // Natural, calm coaching speed
  const [pitch, setPitch] = useState(1.02); // Warm, friendly human tone
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAiVoice, setIsAiVoice] = useState(false); // Default to our ultra-optimized local neural engine for zero lag
  const [isLoadingAiAudio, setIsLoadingAiAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Queue management
  const queueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef(false);
  const currentlyPlayingTextRef = useRef<string | null>(null);

  // Chrome keep-alive timer reference
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize SpeechSynthesis & best voice finder
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const updateVoices = () => {
        try {
          const availableVoices = window.speechSynthesis.getVoices();
          const koVoices = availableVoices
            .filter((v) => v.lang.toLowerCase().startsWith("ko") || v.name.includes("Korean") || v.name.includes("한국"))
            .sort((a, b) => scoreVoice(b) - scoreVoice(a));

          setVoices(koVoices.length > 0 ? koVoices : availableVoices);

          // Select highest scoring voice
          if (koVoices.length > 0) {
            setSelectedVoice((prev) => {
              // Keep previous if still valid, otherwise pick best
              if (prev && koVoices.some((v) => v.name === prev.name)) return prev;
              return koVoices[0];
            });
          }
        } catch (e) {
          console.warn("Error enumerating voices:", e);
        }
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      // Chrome SpeechSynthesis keep-alive ticker (prevents 15-second cutoff bug)
      keepAliveIntervalRef.current = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 4000);

      return () => {
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
        }
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  // Stop currently playing audio and reset state safely
  const stop = useCallback(() => {
    queueRef.current = [];
    isProcessingQueueRef.current = false;
    currentlyPlayingTextRef.current = null;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
      if ((window as any).__ophthal_active_utterances) {
        (window as any).__ophthal_active_utterances.clear();
      }
    }

    setIsPlaying(false);
    setIsLoadingAiAudio(false);
    setActiveSubtitle("");
    if (subtitleTimeoutRef.current) {
      clearTimeout(subtitleTimeoutRef.current);
      subtitleTimeoutRef.current = null;
    }
  }, []);

  // Bulletproof SpeechSynthesis Promise that NEVER gets cut off or hangs
  const playWebSpeechPromise = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!synthRef.current) {
          resolve();
          return;
        }

        try {
          const enhancedText = enhanceKoreanProsody(text);
          const utterance = new SpeechSynthesisUtterance(enhancedText);

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
          utterance.rate = rate;
          utterance.pitch = pitch;
          utterance.volume = 1.0;

          // Prevent GC collection
          const activeSet = (window as any).__ophthal_active_utterances as Set<SpeechSynthesisUtterance>;
          if (activeSet) {
            activeSet.add(utterance);
          }

          let hasResolved = false;
          const finish = () => {
            if (!hasResolved) {
              hasResolved = true;
              if (activeSet) activeSet.delete(utterance);
              resolve();
            }
          };

          utterance.onend = finish;
          utterance.onerror = (e) => {
            // Ignore benign interruptions
            finish();
          };

          // Maximum safety timeout (e.g. 250ms per character + 3s buffer)
          const safetyMs = Math.max(3500, enhancedText.length * 250 + 2500);
          const timer = setTimeout(finish, safetyMs);

          const originalOnEnd = utterance.onend;
          utterance.onend = (e) => {
            clearTimeout(timer);
            if (originalOnEnd) originalOnEnd.call(utterance, e);
          };

          synthRef.current.speak(utterance);
        } catch (err) {
          console.warn("Web Speech execution error:", err);
          resolve();
        }
      });
    },
    [selectedVoice, rate, pitch]
  );

  // Play a single audio item to completion
  const playSingleAudioItem = useCallback(
    async (text: string): Promise<void> => {
      currentlyPlayingTextRef.current = text;
      setActiveSubtitle(text);
      setIsPlaying(true);

      // Play soothing organic acoustic chime to elevate presence
      playMeditationChime("phase");

      // Optional Server AI TTS if enabled & quota is available
      if (isAiVoice && !isAiVoiceQuotaExceeded) {
        let base64 = audioClipCache.get(text);

        if (!base64) {
          try {
            setIsLoadingAiAudio(true);
            const res = await fetch("/api/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text, voiceName: "Kore" }),
            });

            if (res.status === 429) {
              isAiVoiceQuotaExceeded = true;
            } else if (res.ok) {
              const data = await res.json();
              if (data?.audioBase64) {
                base64 = data.audioBase64;
                audioClipCache.set(text, base64!);
              }
            }
          } catch (err) {
            // Network fallback
          } finally {
            setIsLoadingAiAudio(false);
          }
        }

        if (base64) {
          return new Promise<void>((resolve) => {
            try {
              const audio = new Audio(`data:audio/wav;base64,${base64}`);
              audio.playbackRate = rate;
              currentAudioRef.current = audio;

              audio.onended = () => {
                currentAudioRef.current = null;
                resolve();
              };
              audio.onerror = () => {
                currentAudioRef.current = null;
                resolve();
              };

              audio.play().catch(() => {
                currentAudioRef.current = null;
                playWebSpeechPromise(text).then(resolve);
              });
            } catch {
              playWebSpeechPromise(text).then(resolve);
            }
          });
        }
      }

      // Default high-performance, warm local neural voice
      return playWebSpeechPromise(text);
    },
    [isAiVoice, rate, playWebSpeechPromise]
  );

  // Queue runner: processes one item after another cleanly without cutting off
  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    while (queueRef.current.length > 0) {
      if (isMuted) {
        queueRef.current = [];
        break;
      }

      const nextText = queueRef.current.shift();
      if (nextText) {
        await playSingleAudioItem(nextText);
      }
    }

    isProcessingQueueRef.current = false;
    currentlyPlayingTextRef.current = null;
    setIsPlaying(false);

    // Keep subtitle visible for 1.8 seconds after speech concludes
    if (subtitleTimeoutRef.current) {
      clearTimeout(subtitleTimeoutRef.current);
    }
    subtitleTimeoutRef.current = setTimeout(() => {
      setActiveSubtitle("");
    }, 1800);
  }, [isMuted, playSingleAudioItem]);

  // Main public speak function
  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      const cleanText = text.trim();
      if (!cleanText) return;

      if (isMuted) {
        setActiveSubtitle(cleanText);
        if (subtitleTimeoutRef.current) clearTimeout(subtitleTimeoutRef.current);
        subtitleTimeoutRef.current = setTimeout(() => setActiveSubtitle(""), 3500);
        return;
      }

      // If user explicitly demanded interruption
      if (options?.interrupt) {
        stop();
      }

      // Discard duplicate if already playing or queued
      if (
        currentlyPlayingTextRef.current === cleanText ||
        queueRef.current[queueRef.current.length - 1] === cleanText
      ) {
        return;
      }

      queueRef.current.push(cleanText);

      if (!isProcessingQueueRef.current) {
        processQueue();
      }
    },
    [isMuted, stop, processQueue]
  );

  // Test voice preview
  const testVoice = useCallback(() => {
    playMeditationChime("ready");
    speak("안녕하세요. 과학적 5단계 눈 운동 음성 가이드입니다. 눈의 피로를 편안하게 풀어드립니다.");
  }, [speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isMuted,
    setIsMuted,
    speak,
    stop,
    activeSubtitle,
    rate,
    setRate,
    pitch,
    setPitch,
    voices,
    selectedVoice,
    setSelectedVoice,
    isAiVoice,
    setIsAiVoice,
    isLoadingAiAudio,
    isPlaying,
    testVoice,
  };
}
