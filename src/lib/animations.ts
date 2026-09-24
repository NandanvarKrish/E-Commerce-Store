/**
 * Anime.js subtle animation helpers.
 * Prepared for clean, startup-quality micro-interactions.
 */

export async function animateEntrance(selector: string | HTMLElement, delay = 0) {
  if (typeof window === "undefined") return;

  try {
    const { animate } = await import("animejs");
    animate(selector, {
      opacity: [0, 1],
      translateY: [16, 0],
      ease: "outCubic",
      duration: 650,
      delay,
    });
  } catch (_e) {
    // Graceful fallback
  }
}

export async function animateStagger(selector: string, staggerDelay = 80) {
  if (typeof window === "undefined") return;

  try {
    const { animate, stagger } = await import("animejs");
    animate(selector, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(staggerDelay),
      ease: "outCubic",
      duration: 600,
    });
  } catch (_e) {
    // Graceful fallback
  }
}

export async function animatePulse(element: HTMLElement) {
  if (typeof window === "undefined" || !element) return;

  try {
    const { animate } = await import("animejs");
    animate(element, {
      scale: [1, 1.08, 1],
      ease: "inOutQuad",
      duration: 400,
    });
  } catch (_e) {
    // Graceful fallback
  }
}
