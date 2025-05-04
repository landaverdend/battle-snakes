import { useEffect, useRef } from 'react';
import './canvas.css';
import { GameClient, GameConfigOptions } from '../../game/GameClient';
import { Window, WindowContent } from 'react95';
import { CanvasOverlay } from '../canvasOverlay/CanvasOverlay';

interface CanvasProps {
  gameConfig: GameConfigOptions;
}

const Canvas = ({ gameConfig }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameClient | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameRef.current = new GameClient(ctx, gameConfig);
    gameRef.current.start();

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();

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
  }, []);

  return (
    <Window className="canvas-window">
      <WindowContent className="canvas-content">
        <CanvasOverlay />
        <div ref={containerRef} className="canvas-container">
          <canvas ref={canvasRef} />
        </div>
      </WindowContent>
    </Window>
  );
};

export default Canvas;
