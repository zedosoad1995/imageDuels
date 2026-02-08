import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  hasVoted: boolean;
  minWidth?: number; // desktop-ish cutoff
  storageKey?: string;
  autoHideMs?: number;
  fadeMs?: number; // fade out duration
};

type Phase = "hidden" | "shown" | "hiding";

export function DuelKeyboardHint({
  hasVoted,
  minWidth = 900,
  storageKey = "duels.keyboardHint.seen",
  autoHideMs = 4500,
  fadeMs = 380,
}: Props) {
  const [phase, setPhase] = useState<Phase>("hidden");

  // “interaction boost” for opacity:
  // - hover on wrapper
  // - focus within (if you ever add focusable elements later)
  const [isBoosted, setIsBoosted] = useState(false);

  const hideTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);

  const markSeen = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  };

  const clearTimers = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (unmountTimerRef.current) window.clearTimeout(unmountTimerRef.current);
    hideTimerRef.current = null;
    unmountTimerRef.current = null;
  };

  const beginHide = useCallback(() => {
    setPhase((currentPhase) => {
      if (currentPhase !== "shown") return currentPhase;
      clearTimers();
      markSeen();

      // after fade, unmount
      unmountTimerRef.current = window.setTimeout(() => {
        setPhase("hidden");
        clearTimers();
      }, fadeMs);

      return "hiding";
    });
  }, [fadeMs, storageKey]);

  useEffect(() => {
    const isTouch =
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      window.matchMedia?.("(pointer: coarse)")?.matches;

    const isWide = window.innerWidth >= minWidth;

    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {}

    if (!seen && !isTouch && isWide) {
      setPhase("shown");
      hideTimerRef.current = window.setTimeout(() => beginHide(), autoHideMs);
    }

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beginHide]);

  // Hide as soon as user votes
  useEffect(() => {
    if (phase === "shown" && hasVoted) beginHide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVoted, phase, beginHide]);

  // Hide on first keyboard interaction
  useEffect(() => {
    if (phase !== "shown") return;
    const onKeyDown = () => beginHide();
    window.addEventListener("keydown", onKeyDown, { once: true });
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, beginHide]);

  // Don’t render at all when hidden

  const opacity = useMemo(() => {
    // Base opacity when shown
    const base = 0.5;
    // Boost opacity on hover/touch/intent
    const boosted = 0.9;
    const shownOpacity = isBoosted ? boosted : base;

    // Fade out to 0 when hiding
    return phase === "hiding" ? 0 : shownOpacity;
  }, [phase, isBoosted]);

  if (phase === "hidden") return null;

  return (
    <div
      style={styles.wrapper}
      aria-hidden
      onMouseEnter={() => setIsBoosted(true)}
      onMouseLeave={() => setIsBoosted(false)}
      // Touch “wake up” — brief boost so it feels responsive
      onTouchStart={() => {
        setIsBoosted(true);
        window.setTimeout(() => setIsBoosted(false), 900);
      }}
    >
      <div
        style={{
          ...styles.box,
          opacity,
          transition: `opacity ${fadeMs}ms ease`,
        }}
      >
        <HintRow keys={["←"]} label="Choose left image" />
        <HintRow keys={["→"]} label="Choose right image" />
        <HintRow keys={["↓", "Space"]} label="Next duel" />
      </div>
    </div>
  );
}

function HintRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div style={styles.row}>
      <div style={styles.keys}>
        {keys.map((k) => (
          <span key={k} style={styles.keycap}>
            {k}
          </span>
        ))}
      </div>
      <span style={styles.text}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 50,
    cursor: "pointer",
  },
  box: {
    width: 420,
    maxWidth: "min(420px, calc(100vw - 40px))",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10, 10, 12, 0.62)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.30)",
    color: "rgba(255,255,255,0.92)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 0",
  },
  keycap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    height: 28,
    padding: "0 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.2px",
    color: "rgba(255,255,255,0.95)",
  },
  text: {
    fontSize: 14,
    color: "rgba(255,255,255,0.90)",
    whiteSpace: "nowrap",
  },
  keys: {
    display: "flex",
    gap: 6,
  },
};
