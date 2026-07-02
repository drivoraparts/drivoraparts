"use client";

import { useEffect } from "react";

type HomeParallaxHeroProps = {
  heroSrc: string;
  heroAlt: string;
};

export default function HomeParallaxHero({ heroSrc, heroAlt }: HomeParallaxHeroProps) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduceMotion || isMobile) return;

    const handleScroll = () => {
      const hero = document.getElementById("parallaxHero");
      if (!hero) return;

      const offset = window.scrollY;
      hero.style.transform = `translate3d(0, ${Math.min(offset * 0.12, 120)}px, 0)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="parallaxHero" className="absolute inset-0 z-0 overflow-hidden">
      <img
        src={heroSrc}
        alt={heroAlt}
        width={1280}
        height={720}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        sizes="100vw"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
