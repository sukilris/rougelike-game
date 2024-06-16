"use client";
import { Game } from "@/game";
import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const game = useRef<Game | null>(null);

  useEffect(() => {
    if (!game.current) {
      game.current = new Game(canvasRef.current!);
    }
  }, []);
  return <canvas className="h-screen w-screen" ref={canvasRef} />;
}
