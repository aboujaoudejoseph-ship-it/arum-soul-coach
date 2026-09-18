"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ParticleHero from "@/components/ParticleHero";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blush-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-lavender-200/50 blur-3xl" />

      <ParticleHero />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center"
      >
        <motion.p variants={item} className="mb-4 text-sm uppercase tracking-[0.3em] text-navy-500/60">
          Arum-Soul Coach
        </motion.p>
        <motion.h1 variants={item} className="font-display text-5xl leading-tight text-navy-600 sm:text-7xl">
          A gentle space
          <br />
          to grow &amp; return to yourself
        </motion.h1>
        <motion.p variants={item} className="mt-6 max-w-md text-navy-500/70">
          Guided exercises, warm reflection, and a coach walking beside you —
          one small step a day.
        </motion.p>
        <motion.div variants={item}>
          <Link
            href="/login"
            className="mt-10 inline-block rounded-full bg-navy-600 px-8 py-3 font-medium text-cream-50 shadow-glow transition hover:scale-105 hover:bg-navy-500"
          >
            Begin your journey
          </Link>
        </motion.div>
      </motion.div>

      <p className="relative z-10 mt-16 text-xs text-navy-500/40">
        ✦ move your cursor — the particles follow you ✦
      </p>
    </main>
  );
}
