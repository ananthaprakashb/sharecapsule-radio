"use client";

import { useEffect, useRef, useState } from "react";

type RadioPlayerProps = {
  audioUrl: string;
  duration: string;
  narration: string;
  title: string;
};

export function RadioPlayer({ audioUrl, duration, narration, title }: RadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const finish = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", finish);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", finish);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const togglePlayback = async () => {
    if (audioUrl && audioRef.current) {
      if (playing) audioRef.current.pause();
      else await audioRef.current.play();
      setPlaying(!playing);
      return;
    }

    if (!("speechSynthesis" in window)) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setProgress(0);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(narration);
    utterance.volume = volume;
    utterance.rate = 0.96;
    utterance.onend = () => {
      setPlaying(false);
      setProgress(0);
    };
    utterance.onerror = () => setPlaying(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
    setProgress(8);
  };

  return (
    <div className={`radio-console ${playing ? "is-playing" : ""}`}>
      <div className="console-topline">
        <span><i aria-hidden="true" /> MORNING TRANSMISSION</span>
        <span>{duration}</span>
      </div>
      <div className="now-playing">
        <button
          className="play-button"
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? "Stop briefing" : "Play briefing"}
        >
          <span aria-hidden="true">{playing ? "■" : "▶"}</span>
        </button>
        <div>
          <small>NOW PLAYING</small>
          <strong>{title}</strong>
          <span>{audioUrl ? "Full episode" : "Browser narration preview"}</span>
        </div>
      </div>
      <div className="waveform" aria-hidden="true">
        {Array.from({ length: 46 }).map((_, index) => (
          <i key={index} style={{ height: `${18 + ((index * 17) % 55)}%` }} />
        ))}
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="console-controls">
        <span>LIVE BRIEF</span>
        <label>
          <span aria-hidden="true">VOL</span>
          <span className="sr-only">Volume</span>
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}
    </div>
  );
}
