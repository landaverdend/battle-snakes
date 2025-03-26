import { useEffect, useRef } from 'react';
import './canvas.css';
import { GameClient } from '../../game/GameClient';
import { ActionFeed } from '../actionFeed/ActionFeed';

interface CanvasProps {
  width: number; // Grid width
  height: number; // Grid height
}

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameClient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameRef.current = new GameClient(ctx);
    gameRef.current.start();

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();

      // Update canvas dimensions to match container
      canvas.width = width;
      canvas.height = height;

      gameRef.current?.resize(width, height);
    };

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    // Initial resize and start
    resizeCanvas();

    // Cleanup
    return () => {};
  }, [width, height]);

  return (
    <div ref={containerRef} className="canvas-container">
      <canvas ref={canvasRef} />
      <ActionFeed />
    </div>
  );
};

export default Canvas;
