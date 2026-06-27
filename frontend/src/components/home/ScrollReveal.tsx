"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Reveal if visible, OR if already scrolled past (top above viewport)
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]); // re-run on every route change so new [data-reveal] elements are observed

  return null;
}
