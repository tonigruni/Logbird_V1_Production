import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";
import GradientBarsBackground from "../../components/ui/GradientBarsBackground";
// CSS is imported once from LandingPage

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  metricValue?: number;
}

export function CinematicHero({ metricValue = 21, className, ...props }: CinematicHeroProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mainCardRef   = useRef<HTMLDivElement>(null);
  const mockupRef     = useRef<HTMLDivElement>(null);
  const requestRef    = useRef<number>(0);

  // Wheel-based section snap (hero → features → footer)
  useEffect(() => {
    // Scroll positions for each section within the 7000px pin
    const SNAPS = [0, Math.round(7000 * 0.46), 7100];
    let snapping = false;

    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const scrollTo = (target: number) => {
      const start = window.scrollY;
      const startTime = performance.now();
      const duration = 750;
      snapping = true;
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, start + (target - start) * easeInOut(t));
        if (t < 1) requestAnimationFrame(tick);
        else snapping = false;
      };
      requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      const y = window.scrollY;
      // Outside pin range — let footer scroll normally
      if (y > 7200) return;
      e.preventDefault();
      if (snapping) return;

      const dir = e.deltaY > 0 ? 1 : -1;
      // Find which snap section we're in
      let current = 0;
      for (let i = SNAPS.length - 1; i >= 0; i--) {
        if (y >= SNAPS[i] - 150) { current = i; break; }
      }
      const next = Math.max(0, Math.min(SNAPS.length - 1, current + dir));
      if (next !== current) scrollTo(SNAPS[next]);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Mouse parallax + card sheen
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return;
        const rect = mainCardRef.current.getBoundingClientRect();
        mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        const xVal = (e.clientX / window.innerWidth  - 0.5) * 2;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(mockupRef.current, { rotationY: xVal * 12, rotationX: -yVal * 12, ease: "power3.out", duration: 1.2 });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(requestRef.current); };
  }, []);

  // Cinematic scroll timeline
  useEffect(() => {
    if (!containerRef.current) return;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // Initial state
      gsap.set(".text-track",         { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days",          { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card",          { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set(".scroll-hint",        { autoAlpha: 0, y: 24, scale: 0.85, filter: "blur(8px)" });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });

      // Intro reveal (no scroll)
      gsap.timeline({ delay: 0.3 })
        .to(".text-track",  { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days",   { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0")
        .to(".scroll-hint", { duration: 1.2, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", ease: "expo.out" }, "-=0.4");

      // Scroll hint: hide on scroll start, reappear when back at top
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        onLeave:      () => gsap.to(".scroll-hint", { autoAlpha: 0, y: -10, duration: 0.35, ease: "power2.in", overwrite: true }),
        onEnterBack:  () => gsap.to(".scroll-hint", { autoAlpha: 1, y: 0,   duration: 0.6,  ease: "expo.out", overwrite: true }),
      });

      // Scroll-driven timeline
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      })
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0,   z: 0,    rotationX: 0,  rotationY: 0,   autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".phone-widget",  { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring",     { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val",       { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text",  { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x:  50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.8,
        })
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center antialiased font-sans", className)}
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)", perspective: "1500px" }}
      {...props}
    >
      <div className="film-grain" aria-hidden="true" />
      <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Hero taglines */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 will-change-transform transform-style-3d">
        <img
          src="/Logo complete dark semibold.png"
          alt="Logbird"
          className="text-track gsap-reveal mb-8 h-10 md:h-12 object-contain select-none"
          draggable={false}
        />
        <h1 className="text-track gsap-reveal text-3d-matte text-5xl md:text-7xl lg:text-[6rem] font-bold tracking-tight mb-2 pb-6">
          You're the metric,
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter pb-6">
          track the growth.
        </h1>
      </div>

      {/* Scroll-down indicator */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight + 7100, behavior: "smooth" })}
        className="scroll-hint gsap-reveal absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center group"
        style={{ color: "var(--color-text-muted)" }}
        aria-label="Scroll to next section"
      >
        <svg
          className="w-5 h-5 transform group-hover:translate-y-1.5 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 10l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* Dark card (foreground) */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          {/* Dashboard-style gradient bars background */}
          <GradientBarsBackground barCount={14} barColor="rgba(255,255,255,0.10)" animate />

          {/* Radial glow overlays matching dashboard card */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0" aria-hidden="true">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(107,99,245,0.4) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(255,255,255,0.2) 0%, transparent 45%)' }} />
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="card-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#card-grid)" />
            </svg>
          </div>

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Brand name — top on mobile, right on desktop */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-6xl md:text-[6rem] lg:text-[8rem] font-black uppercase tracking-tighter text-card-silver-matte">
                Logbird
              </h2>
            </div>

            {/* Laptop mockup — center */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[300px] lg:h-[500px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              <div className="relative flex items-center justify-center transform scale-[0.60] md:scale-[0.75] lg:scale-100">

                {/* Floating badges */}
                <div className="floating-badge absolute flex top-0 left-[-20px] lg:left-[-100px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-900/10 flex items-center justify-center border border-blue-400/30 shadow-inner">
                    <span className="text-base lg:text-xl drop-shadow-lg" aria-hidden="true">🔥</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">21-Day Streak</p>
                    <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">Keep it going!</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-8 right-[-20px] lg:right-[-100px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-green-500/20 to-green-900/10 flex items-center justify-center border border-green-400/30 shadow-inner">
                    <span className="text-base lg:text-lg drop-shadow-lg" aria-hidden="true">✅</span>
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">8 Tasks Done</p>
                    <p className="text-blue-200/50 text-[10px] lg:text-xs font-medium">Deep Focus · 2h 14m</p>
                  </div>
                </div>

                {/* MacBook-style laptop */}
                <div ref={mockupRef} className="laptop-outer will-change-transform transform-style-3d" style={{ width: "clamp(320px, 30vw, 520px)" }}>
                  {/* Screen frame */}
                  <div className="laptop-screen-frame">
                    <div className="laptop-camera-dot" aria-hidden="true" />
                    {/* Screen content */}
                    <div className="laptop-screen text-white" style={{ fontSize: "10px" }}>
                      <div className="flex h-full">
                        {/* Narrow sidebar */}
                        <div className="flex flex-col items-center py-3 gap-2 shrink-0" style={{ width: "40px", background: "rgba(0,0,0,0.3)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                          {["M","J","G","W","T"].map((label, i) => (
                            <div key={i} className="phone-widget flex items-center justify-center rounded-md text-[8px] font-bold" style={{ width: "24px", height: "24px", background: i === 0 ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)", color: i === 0 ? "white" : "rgba(255,255,255,0.35)" }}>
                              {label}
                            </div>
                          ))}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                          {/* Top bar */}
                          <div className="flex items-center justify-between px-4 shrink-0" style={{ height: "32px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Dashboard</span>
                            <div className="flex items-center gap-2">
                              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontWeight: 700 }}>LB</div>
                            </div>
                          </div>

                          {/* Dashboard body */}
                          <div className="flex-1 p-3 overflow-hidden flex flex-col gap-2">
                            {/* Hero banner with gradient bars — matches actual dashboard */}
                            <div className="phone-widget relative overflow-hidden rounded-lg shrink-0" style={{ height: "68px", background: "rgba(255,255,255,0.07)", padding: "10px 12px" }}>
                              <GradientBarsBackground barCount={14} barColor="rgba(255,255,255,0.18)" animate />
                              <div style={{ position: "relative", zIndex: 10 }}>
                                <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "3px" }}>Journal Streak</div>
                                <div style={{ fontSize: "18px", fontWeight: 900, lineHeight: 1, color: "white" }}>
                                  <span className="counter-val">0</span>
                                  <span style={{ fontSize: "8px", fontWeight: 600, marginLeft: "4px", opacity: 0.6 }}>days</span>
                                </div>
                              </div>
                            </div>

                            {/* Three stat cards */}
                            <div className="grid grid-cols-3 gap-2 shrink-0">
                              {[
                                { label: "Tasks", value: "8/12", pct: "67%", color: "#22c55e" },
                                { label: "Goals", value: "7/10", pct: "70%", color: "#a78bfa" },
                                { label: "Focus", value: "2h 14m", pct: "75%", color: "#f59e0b" },
                              ].map((card) => (
                                <div key={card.label} className="phone-widget rounded-md p-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                                  <div style={{ fontSize: "6px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>{card.label}</div>
                                  <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginBottom: "4px" }}>
                                    <div style={{ width: card.pct, height: "100%", background: card.color, borderRadius: "2px" }} />
                                  </div>
                                  <div style={{ fontSize: "9px", fontWeight: 700, color: "white" }}>{card.value}</div>
                                </div>
                              ))}
                            </div>

                            {/* Task items */}
                            {[
                              { done: true,  w1: "58%", w2: "72%" },
                              { done: true,  w1: "42%", w2: "55%" },
                              { done: false, w1: "65%", w2: "80%" },
                            ].map((task, i) => (
                              <div key={i} className="phone-widget flex items-center gap-2 rounded-md p-2 shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", flexShrink: 0, background: task.done ? "#22c55e" : "rgba(255,255,255,0.08)", border: task.done ? "none" : "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {task.done && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "white" }} />}
                                </div>
                                <div style={{ flex: 1, opacity: task.done ? 0.45 : 1 }}>
                                  <div style={{ height: "4px", background: "rgba(255,255,255,0.15)", borderRadius: "2px", marginBottom: "3px", width: task.w1 }} />
                                  <div style={{ height: "3px", background: "rgba(255,255,255,0.07)", borderRadius: "2px", width: task.w2 }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="absolute inset-0 screen-glare pointer-events-none z-40" aria-hidden="true" />
                    </div>
                  </div>
                  {/* Hinge */}
                  <div className="laptop-hinge" />
                  {/* Keyboard base */}
                  <div className="laptop-keyboard-base">
                    <div className="laptop-trackpad" />
                  </div>
                </div>

              </div>
            </div>

            {/* Description text — bottom on mobile, left on desktop */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight">
                Do more. Grow faster.
              </h3>
              <p className="hidden md:block text-blue-100/70 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                <span className="text-white font-semibold">Logbird</span> is your personal OS — manage tasks, track goals, journal daily, and use AI-powered focus sessions to build momentum that compounds.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
