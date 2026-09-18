const COLORS = ["#d9628f", "#8a6fd3", "#f0a7c4", "#c0b0ec", "#e783aa"];

/** Bursts a handful of CSS-animated confetti pieces from a screen point. */
export function confettiBurst(x: number, y: number) {
  for (let i = 0; i < 24; i++) {
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = "8px";
    p.style.height = "14px";
    p.style.borderRadius = "2px";
    p.style.zIndex = "300";
    p.style.pointerEvents = "none";
    p.style.background = COLORS[i % COLORS.length];
    p.style.animation = "confetti-fall 1.1s cubic-bezier(.2,.7,.3,1) forwards";

    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 140;
    p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--dy", `${Math.sin(angle) * dist + 200}px`);
    p.style.setProperty("--rot", `${Math.random() * 600 - 300}deg`);

    p.addEventListener("animationend", () => p.remove());
    document.body.appendChild(p);
  }
}

/** Confetti from the center of a DOM element (e.g. the button just clicked). */
export function confettiFromElement(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  confettiBurst(r.left + r.width / 2, r.top + r.height / 2);
}
