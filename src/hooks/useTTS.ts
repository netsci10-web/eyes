import { useState, useEffect, useCallback, useRef } from "react";

export interface UseTTSResult {
  isSupported: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  speak: (text: string) => void;
  stop: () => void;
  activeSubtitle: string;
  rate: number;
  setRate: (rate: number) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
  isAiVoice: boolean;
  setIsAiVoice: (useAi: boolean) => void;
  isLoadingAiAudio: boolean;
}

// Client-side cache for instantaneous playback of synthesized voice
const audioClipCache = new Map<string, string>();

export function useTTS(): UseTTSResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isAiVoice, setIsAiVoice] = useState(true); // Default to ultra-realistic AI voice
  const [isLoadingAiAudio, setIsLoadingAiAudio] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const speakAbortControllerRef = useRef<AbortController | null>(null);

  // Initialize browser voices as robust fallback
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Find the best quality Korean voice (prioritize Natural / Google / Neural / Online)
        const koreanVoices = availableVoices.filter(
          (v) => v.lang === "ko-KR" || v.lang.startsWith("ko")
        );

        const premiumKoVoice =
          koreanVoices.find(
            (v) =>
              v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Online") ||
              v.name.includes("Neural") ||
              v.name.includes("Yuna") ||
              v.name.includes("SunHi")
          ) ||
          koreanVoices[0] ||
          availableVoices[0];

        if (premiumKoVoice) {
          setSelectedVoice(premiumKoVoice);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      // Audio element supported even without SpeechSynthesis
      setIsSupported(true);
    }
  }, []);

  // Preload essential coaching lines for instant zero-latency playback
  useEffect(() => {
    const commonPhrases = [
      "가볍게 눈을 감으세요",
      "눈꺼풀을 꽉 쥐어짜듯 감으세요",
      "눈을 크게 뜨세요",
      "가운데 글씨에 초점을 또렷이 맞추세요",
      "화면 너머 먼 벽이나 창 밖을 보며 눈에 힘을 빼세요",
      "머리를 고정하고 눈동자만 빠르게 움직이세요",
      "정답입니다",
      "방향이 다릅니다",
      "천천히 숨을 깊이 들이마시세요",
      "가볍게 숨을 멈추고 먼 곳에 초점을 푸세요",
      "몸에 남아있는 모든 피로와 이산화탄소를 내뱉으세요",
    ];

    commonPhrases.forEach((phrase) => {
      if (!audioClipCache.has(phrase)) {
        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: phrase, voiceName: "Kore" }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.audioBase64) {
              audioClipCache.set(phrase, data.audioBase64);
            }
          })
          .catch(() => {
            // Background pre-cache is non-blocking
          });
      }
    });
  }, []);

  const stop = useCallback(() => {
    // Stop HTML Audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    // Cancel in-flight fetch
    if (speakAbortControllerRef.current) {
      speakAbortControllerRef.current.abort();
      speakAbortControllerRef.current = null;
    }
    // Stop Web Speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsLoadingAiAudio(false);
  }, []);

  const playFallbackWebSpeech = useCallback(
    (text: string) => {
      if (!synthRef.current) return;
      try {
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = rate * 0.95; // Slightly slower pacing for natural warmth
        utterance.pitch = 1.05; // Slightly higher, friendly pitch
        utterance.volume = 1.0;
        synthRef.current.speak(utterance);
      } catch (err) {
        console.warn("Web Speech failed:", err);
      }
    },
    [selectedVoice, rate]
  );

  const speak = useCallback(
    async (text: string) => {
      // Update subtitles immediately
      setActiveSubtitle(text);

      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
      const delay = Math.max(3500, text.length * 130);
      subtitleTimeoutRef.current = setTimeout(() => {
        setActiveSubtitle("");
      }, delay);

      if (isMuted) return;

      stop();

      // If AI Voice enabled, try high-fidelity Gemini realistic speech
      if (isAiVoice) {
        const cachedBase64 = audioClipCache.get(text);
        if (cachedBase64) {
          try {
            const audio = new Audio(`data:audio/wav;base64,${cachedBase64}`);
            audio.playbackRate = rate;
            currentAudioRef.current = audio;
            await audio.play();
            return;
          } catch (err) {
            console.warn("Cached audio play error, falling back:", err);
          }
        }

        setIsLoadingAiAudio(true);
        const controller = new AbortController();
        speakAbortControllerRef.current = controller;

        try {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voiceName: "Kore" }),
            signal: controller.signal,
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.audioBase64) {
              audioClipCache.set(text, data.audioBase64);
              setIsLoadingAiAudio(false);

              const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
              audio.playbackRate = rate;
              currentAudioRef.current = audio;
              await audio.play();
              return;
            }
          }
        } catch (fetchErr: any) {
          if (fetchErr.name !== "AbortError") {
            console.warn("AI TTS request failed, using natural browser fallback:", fetchErr);
          }
        } finally {
          setIsLoadingAiAudio(false);
        }
      }

      // Fallback: Web Speech API with selected highest-quality natural voice
      playFallbackWebSpeech(text);
    },
    [isMuted, isAiVoice, rate, stop, playFallbackWebSpeech]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stop();
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
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
    voices,
    selectedVoice,
    setSelectedVoice,
    isAiVoice,
    setIsAiVoice,
    isLoadingAiAudio,
  };
}
