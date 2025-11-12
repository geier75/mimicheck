import { useEffect, useState, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function useTextScramble(text: string, trigger: boolean = false) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef(0);
  const queueRef = useRef<Array<{ from: string; to: string; start: number; end: number; char: string }>>([]);

  useEffect(() => {
    if (!trigger) return;

    const queue = queueRef.current;
    const oldText = displayText;
    const length = Math.max(oldText.length, text.length);

    // Build queue with smoother timing
    queue.length = 0;
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = text[i] || '';
      const start = Math.floor(i * 3); // Sequential start
      const end = start + 40 + Math.floor(Math.random() * 40); // Medium duration (40-80 frames)
      const char = to; // Pre-assign target char
      queue.push({ from, to, start, end, char });
    }

    // Animate with smoother transitions
    let frame = 0;
    const update = () => {
      let output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        const { from, to, start, end, char } = queue[i];

        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          // Only 15% chance of random char (was 50%)
          if (!to) {
            output += '';
          } else if (Math.random() < 0.15) {
            output += CHARS[Math.floor(Math.random() * CHARS.length)];
          } else {
            output += char;
          }
        } else {
          output += from;
        }
      }

      setDisplayText(output);

      if (complete === queue.length) {
        cancelAnimationFrame(frameRef.current);
      } else {
        frame++;
        frameRef.current = requestAnimationFrame(update);
      }
    };

    frameRef.current = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, trigger]);

  return displayText;
}
