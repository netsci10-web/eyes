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
}

export function useTTS(): UseTTSResult {
  const [isSupported, setIsSupported] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState("");
  const [rate, setRate] = useState(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const subtitleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Find standard Korean voice if available
        const koVoice = availableVoices.find((v) => v.lang === "ko-KR" || v.lang.startsWith("ko"));
        if (koVoice) {
          setSelectedVoice(koVoice);
        } else if (availableVoices.length > 0) {
          // Fallback to first voice
          setSelectedVoice(availableVoices[0]);
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Update subtitles immediately (regardless of mute state)
      setActiveSubtitle(text);

      // Auto clear subtitles after a proportional duration
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
      const delay = Math.max(3000, text.length * 120); // 120ms per character, min 3s
      subtitleTimeoutRef.current = setTimeout(() => {
        setActiveSubtitle("");
      }, delay);

      // Speak if supported and not muted
      if (!isSupported || isMuted || !synthRef.current) return;

      try {
        // Cancel ongoing speak before playing new one
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        utterance.rate = rate;
        utterance.volume = 0.95; // clean and clear volume

        synthRef.current.speak(utterance);
      } catch (error) {
        console.warn("TTS SpeechSynthesis failed to play:", error);
      }
    },
    [isSupported, isMuted, selectedVoice, rate]
  );

  // Cancel speech on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (subtitleTimeoutRef.current) {
        clearTimeout(subtitleTimeoutRef.current);
      }
    };
  }, []);

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
  };
}
