import { motion } from "framer-motion";
import { Circle, Home, RotateCcw, Sparkles, Square, Star, Triangle, Umbrella } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatedButton } from "../components/AnimatedButton";
import { useAppChrome } from "../context/ChromeContext";
import { useEffect, useState } from "react";
import { playEndScreenTrack, stopEndScreenTrack } from "../utils/endScreenAudio";

const completionAudioVolume = 0.14;
const congratulationsAudioVolume = 0.42;
const congratulationsMs = 2400;

const shapes = [
  { kind: "shape", label: "triangle", Icon: Triangle, className: "text-trauma", band: "top", left: "8%", top: "18%", rotate: -8, delay: 0 },
  { kind: "cookie", label: "cookie-top-left", band: "top", left: "26%", top: "58%", rotate: 10, delay: 0.1 },
  { kind: "shape", label: "star", Icon: Star, className: "text-amber", band: "top", left: "61%", top: "14%", rotate: 7, delay: 0.12 },
  { kind: "cookie", label: "cookie-top-right", band: "top", left: "84%", top: "52%", rotate: -12, delay: 0.22 },
  { kind: "cookie", label: "cookie-bottom-left", band: "bottom", left: "9%", top: "18%", rotate: -7, delay: 0.08 },
  { kind: "shape", label: "umbrella", Icon: Umbrella, className: "text-white", band: "bottom", left: "28%", top: "50%", rotate: 9, delay: 0.18 },
  { kind: "shape", label: "square", Icon: Square, className: "text-monitor", band: "bottom", left: "52%", top: "22%", rotate: -5, delay: 0.28 },
  { kind: "shape", label: "circle", Icon: Circle, className: "text-scrub", band: "bottom", left: "74%", top: "56%", rotate: 6, delay: 0.36 },
  { kind: "cookie", label: "cookie-bottom-right", band: "bottom", left: "90%", top: "18%", rotate: 12, delay: 0.44 }
];

function Cookie({ delay = 0, compact = false }: { delay?: number; compact?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: [0, 1.08, 1], rotate: [18, -6, 0] }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
      className={`relative rounded-full border border-[#d49a57] bg-[#b87836] shadow-[inset_-10px_-12px_0_rgba(64,33,13,0.25),0_0_28px_rgba(255,176,32,0.22)] ${compact ? "h-12 w-12 sm:h-16 sm:w-16" : "h-20 w-20"}`}
    >
      {[18, 34, 50, 62, 42, 25].map((left, index) => (
        <span
          key={index}
          className="absolute h-2.5 w-2.5 rounded-full bg-[#3a1f12]"
          style={{ left: `${left}%`, top: `${[24, 48, 30, 58, 70, 66][index]}%` }}
        />
      ))}
    </motion.div>
  );
}

function ScatterBand({ band }: { band: "top" | "bottom" }) {
  return (
    <div className="pointer-events-none relative min-h-24 w-full overflow-hidden sm:min-h-28 md:min-h-32">
      {shapes.filter((item) => item.band === band).map((item, index) => (
        <motion.div
          key={item.label}
          className="absolute grid h-16 w-16 place-items-center rounded-md border border-white/10 bg-black/25 sm:h-20 sm:w-20"
          style={{
            left: item.left,
            top: item.top,
            rotate: `${item.rotate}deg`
          }}
          initial={{ opacity: 0, scale: 0.74, rotate: -8 }}
          animate={{ opacity: 0.88, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, delay: item.delay + index * 0.02, ease: "easeOut" }}
        >
          {item.kind === "shape" && item.Icon ? (
            <item.Icon className={`h-10 w-10 sm:h-14 sm:w-14 ${item.className} opacity-85`} strokeWidth={1.7} />
          ) : (
            <Cookie delay={0.45 + item.delay} compact />
          )}
        </motion.div>
      ))}
    </div>
  );
}

const confettiPieces = Array.from({ length: 42 }, (_, index) => ({
  id: index,
  left: `${(index * 23) % 100}%`,
  delay: (index % 9) * 0.08,
  duration: 1.55 + (index % 6) * 0.12,
  rotate: (index % 2 === 0 ? 1 : -1) * (120 + index * 13),
  color: ["bg-trauma", "bg-scrub", "bg-monitor", "bg-amber", "bg-white"][index % 5]
}));

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.span
          key={piece.id}
          className={`absolute top-[-12%] h-4 w-2 rounded-sm ${piece.color}`}
          style={{ left: piece.left }}
          initial={{ y: "-10vh", opacity: 0, rotate: 0 }}
          animate={{ y: "118vh", opacity: [0, 1, 1, 0], rotate: piece.rotate }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function CongratulationsTransition() {
  return (
    <motion.section
      key="congratulations-transition"
      className="fixed inset-0 z-30 grid place-items-center overflow-hidden bg-[#050607] px-4 text-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,176,32,0.2),transparent_34%),radial-gradient(circle_at_50%_72%,rgba(36,245,199,0.11),transparent_40%)]" />
      <ConfettiBurst />
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 1.02 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative grid justify-items-center gap-5"
      >
        <div className="grid h-20 w-20 place-items-center rounded-full border border-amber/35 bg-amber/10 text-amber shadow-[0_0_44px_rgba(255,176,32,0.22)]">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="font-display text-[clamp(4rem,12vw,11rem)] font-black uppercase leading-none text-white">Congratulations!</h1>
      </motion.div>
    </motion.section>
  );
}

export function CompletionPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") === "host" ? "host" : "player";
  const audioEnabled = role === "host";
  const { setNavHidden } = useAppChrome();
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    setNavHidden(true);
    return () => setNavHidden(false);
  }, [setNavHidden]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowFinal(true), congratulationsMs);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (showFinal || !audioEnabled) return;

    const playAudio = () => {
      playEndScreenTrack("congratulations", { volume: congratulationsAudioVolume });
    };
    playAudio();
    window.addEventListener("pointerdown", playAudio);
    window.addEventListener("keydown", playAudio);
    return () => {
      window.removeEventListener("pointerdown", playAudio);
      window.removeEventListener("keydown", playAudio);
      stopEndScreenTrack("congratulations");
    };
  }, [audioEnabled, showFinal]);

  useEffect(() => {
    if (!showFinal || !audioEnabled) return;

    const playAudio = () => {
      playEndScreenTrack("theme", { loop: true, volume: completionAudioVolume });
    };
    playAudio();
    window.addEventListener("pointerdown", playAudio);
    window.addEventListener("keydown", playAudio);
    return () => {
      window.removeEventListener("pointerdown", playAudio);
      window.removeEventListener("keydown", playAudio);
      stopEndScreenTrack("theme");
    };
  }, [audioEnabled, showFinal]);

  function returnToPlayerScreen() {
    try {
      sessionStorage.removeItem("competency-player-room-emergency-backup");
      sessionStorage.removeItem("competency-player-group-id");
    } catch {
      // Session storage can be unavailable in locked-down browser modes.
    }
    navigate("/player", { replace: true });
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#070708] px-4 text-center text-white">
      {!showFinal && <CongratulationsTransition />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,48,77,0.16),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:auto,70px_70px,70px_70px]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-rows-[auto_auto_auto] content-center gap-4 py-4">
        <ScatterBand band="top" />
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative z-10 mx-auto grid w-full max-w-4xl place-items-center rounded-md border border-white/10 bg-black/72 px-6 py-10 shadow-[0_0_100px_rgba(255,48,77,0.16)] md:px-12 md:py-14"
        >
          <motion.img
            src="/images/new_favicon.png"
            alt="Competency Stations"
            className="h-52 w-52 object-contain md:h-72 md:w-72"
            initial={{ rotate: -8, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
          />
          <h1 className="mt-5 font-display text-5xl font-black uppercase leading-none md:text-7xl">
            Enjoy your Squid Game cookies!
          </h1>
          <motion.div
            className="mt-8"
            animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Cookie delay={0} />
          </motion.div>
          {role === "host" ? (
            <AnimatedButton variant="secondary" className="mt-9" onClick={() => navigate("/")}>
              <Home className="h-4 w-4" />
              Return to home
            </AnimatedButton>
          ) : null}
        </motion.div>
        <ScatterBand band="bottom" />
      </div>
      {role === "player" && (
        <button
          type="button"
          onClick={returnToPlayerScreen}
          className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 py-2 font-display text-[10px] font-black uppercase tracking-[0.16em] text-white/42 backdrop-blur transition hover:border-scrub/35 hover:bg-scrub/10 hover:text-scrub focus:outline-none focus:ring-2 focus:ring-scrub/35"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New player screen
        </button>
      )}
    </section>
  );
}
