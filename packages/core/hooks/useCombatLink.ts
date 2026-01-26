'use client';
// sanity-fix
"use client";
import { useEffect } from "react";

export function useCombatLink() {
  // fire API calls to combat system
  async function attack() {
    try {
      await fetch("/api/arena/fight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attack" }),
      });
    } catch (e) {
      console.error("⚔️ combat attack failed", e);
    }
  }

  async function skip() {
    try {
      await fetch("/api/arena/fight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      });
    } catch (e) {
      console.error("💢 combat skip failed", e);
    }
  }

  async function start() {
    await fetch("/api/arena/fight?action=start");
  }

  useEffect(() => { start(); }, []);

  // optional listeners for global events
  useEffect(() => {
    const onAttack = () => attack();
    const onSkip = () => skip();
    document.addEventListener("fight-attack", onAttack);
    document.addEventListener("fight-skip", onSkip);
    return () => {
      document.removeEventListener("fight-attack", onAttack);
      document.removeEventListener("fight-skip", onSkip);
    };
  }, []);

  return { attack, skip };
}

