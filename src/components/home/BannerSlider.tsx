"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { banners } from "@/lib/banners";

const AUTOPLAY_MS = 5000;

/**
 * Sliding banner gallery. Scrolls on its own every few seconds, and the visitor can swipe / drag-scroll,
 * use the arrows or tap a dot. Autoplay pauses while the visitor is interacting with it, when the tab is hidden
 * or the slider is off-screen, and is off entirely for people who prefer reduced motion.
 */
export default function BannerSlider() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const count = banners.length;

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const next = ((i % count) + count) % count;
      el.scrollTo({ left: next * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [count, reduced]
  );

  // follow the visitor's own scrolling
  const onScroll = () => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible || count < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      go(index + 1);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [reduced, paused, visible, index, go, count]);

  // keep the current slide in place when the window is resized
  useEffect(() => {
    const onResize = () => {
      const el = track.current;
      if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "auto" });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index]);

  return (
    <div
      className="bn-slider"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured banners"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => window.setTimeout(() => setPaused(false), 4000)}
    >
      <div className="bn-track" ref={track} onScroll={onScroll} tabIndex={0} aria-live={paused ? "polite" : "off"}>
        {banners.map((b, i) => {
          const img = (
            <img
              src={b.src}
              alt={b.alt}
              width={1600}
              height={900}
              draggable={false}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              {...(i === 0 ? { fetchPriority: "high" as const } : {})}
            />
          );
          return (
            <div className="bn-slide" key={b.src} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${count}`}>
              {b.href ? <Link href={b.href}>{img}</Link> : img}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button type="button" className="bn-arrow prev" aria-label="Previous banner" onClick={() => go(index - 1)}>
            <Icon name="chevron-left" />
          </button>
          <button type="button" className="bn-arrow next" aria-label="Next banner" onClick={() => go(index + 1)}>
            <Icon name="chevron-right" />
          </button>
          <div className="bn-dots">
            {banners.map((b, i) => (
              <button
                type="button"
                key={b.src}
                className={i === index ? "bn-dot active" : "bn-dot"}
                aria-label={`Show banner ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
