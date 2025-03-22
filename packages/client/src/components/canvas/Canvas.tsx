import { useEffect, useRef } from 'react';
import { GameEngine } from '../../game/GameEngine';
import './canvas.css';

interface CanvasProps {
  width: number; // Grid width
  height: number; // Grid height
}

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameEngineRef.current = new GameEngine(ctx, ctx.canvas.width, ctx.canvas.height);

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();

      // Let the game engine handle the resize
      gameEngineRef.current?.resize(width, height);
    };

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    // Initial resize and start
    resizeCanvas();
    gameEngineRef.current.start();

    // Cleanup
    return () => {
      gameEngineRef.current?.stop;
    };
  }, [width, height]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Canvas;
