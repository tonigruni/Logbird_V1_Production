import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";
import "./landing.css";
import { CinematicHero } from "./CinematicHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// MAGNETIC BUTTON
// -------------------------------------------------------------------------
type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(element, {
            x: x * 0.4, y: y * 0.4,
            rotationX: -y * 0.15, rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out", duration: 0.4,
          });
        };
        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
            ease: "elastic.out(1, 0.3)", duration: 1.2,
          });
        };
        element.addEventListener("mousemove", handleMouseMove as EventListener);
        element.addEventListener("mouseleave", handleMouseLeave);
        return () => {
          element.removeEventListener("mousemove", handleMouseMove as EventListener);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef)
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// MARQUEE CONTENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Daily Journaling</span>
    <span style={{ color: "var(--color-primary)", opacity: 0.5 }}>✦</span>
    <span>Goal Tracking</span>
    <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>✦</span>
    <span>Wheel of Life</span>
    <span style={{ color: "var(--color-primary)", opacity: 0.5 }}>✦</span>
    <span>AI Insights</span>
    <span style={{ color: "var(--color-text-muted)", opacity: 0.5 }}>✦</span>
    <span>Focus Timeboxing</span>
    <span style={{ color: "var(--color-primary)", opacity: 0.5 }}>✦</span>
  </div>
);

// -------------------------------------------------------------------------
// LANDING PAGE
// -------------------------------------------------------------------------
export default function LandingPage() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const giantTextRef  = useRef<HTMLDivElement>(null);
  const headingRef    = useRef<HTMLHeadingElement>(null);
  const linksRef      = useRef<HTMLDivElement>(null);

  const [showLoginCard, setShowLoginCard] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Background parallax on giant text
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh", scale: 1, opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered content reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
    <CinematicHero />
    <div
      ref={wrapperRef}
      className="relative h-screen w-full"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <footer
        className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden cinematic-footer-wrapper"
        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
      >
        {/* Ambient aurora glow */}
        <div className="footer-aurora absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px] pointer-events-none z-0" />

        {/* Grid background */}
        <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none" />

        {/* Giant background text */}
        <div
          ref={giantTextRef}
          className="footer-giant-bg-text absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none"
        >
          LOGBIRD
        </div>

        {/* Diagonal marquee */}
        <div
          className="absolute top-12 left-0 w-full overflow-hidden py-4 z-10 -rotate-2 scale-110 shadow-2xl"
          style={{
            borderTop: "1px solid rgba(12,22,41,0.08)",
            borderBottom: "1px solid rgba(12,22,41,0.08)",
            backgroundColor: "rgba(254,254,254,0.6)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            <MarqueeItem />
            <MarqueeItem />
          </div>
        </div>

        {/* Main CTA */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 w-full max-w-5xl mx-auto -mt-16">
          <h2
            ref={headingRef}
            className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 pb-6 text-center"
          >
            Ready to begin?
          </h2>

          <div ref={linksRef} className="flex flex-col items-center gap-4 w-full max-w-xl mb-12">

            {/* Buttons row */}
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {/* Login button with inline popover card above */}
              <div className="relative">
                {showLoginCard && (
                  <div
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 rounded-2xl p-5 shadow-2xl z-20"
                    style={{ backgroundColor: "var(--color-bg)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "var(--color-text-muted)" }}>Early access only</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (password === "early_user") {
                          window.location.href = "https://app.logbird.me";
                        } else {
                          setError(true);
                          setPassword("");
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        placeholder="Access code"
                        autoFocus
                        className="flex-1 rounded-xl px-3 py-2 text-sm font-medium outline-none"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.06)",
                          border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                          color: "var(--color-text)",
                        }}
                      />
                      <button type="submit" className="btn-modern-dark px-4 py-2 rounded-xl text-sm font-bold">Go</button>
                    </form>
                    {error && <p className="text-xs text-red-400 mt-2">Incorrect code.</p>}
                  </div>
                )}
                <button
                  onClick={() => { setShowLoginCard(!showLoginCard); setPassword(""); setError(false); }}
                  className="btn-modern-dark flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group focus:outline-none cursor-pointer"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:scale-105" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-[-2px]">Already a member</div>
                    <div className="text-xl font-bold leading-none tracking-tight">Login</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Waitlist card */}
            <div
              className="w-full rounded-2xl px-6 py-5"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: "var(--color-text-muted)" }}>Early access — join the waitlist</p>
              {waitlistDone ? (
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>You're on the list. We'll be in touch.</p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (waitlistName && waitlistEmail) setWaitlistDone(true);
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-text)" }}
                  />
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Email address"
                    required
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--color-text)" }}
                  />
                  <button type="submit" className="btn-modern-light px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap">
                    Join the waitlist
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex items-center justify-between">
          <span
            className="text-[10px] md:text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--color-text-muted)" }}
          >
            © 2026 Logbird. All rights reserved.
          </span>

          <MagneticButton
            as="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-12 h-12 rounded-full footer-glass-pill flex items-center justify-center group"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-y-1.5 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </MagneticButton>
        </div>
      </footer>
    </div>

</>
  );
}
