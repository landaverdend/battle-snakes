import { useEffect, useRef } from 'react';
import './canvas.css';
import { Window, WindowContent } from 'react95';
import { CanvasOverlay } from '../canvasOverlay/CanvasOverlay';
import Draggable from 'react-draggable';
import { NetworkGameRunner } from '@/game/network/NetworkGameRunner';
import { GameConfigOptions, GameRunner } from '@/game/GameRunner';
import { LocalGameRunner } from '@/game/local/LocalGameRunner';

interface CanvasProps {
  gameConfig: GameConfigOptions;
}
const Canvas = ({ gameConfig }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRunnerRef = useRef<GameRunner | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize which type of game runner to use.
    gameRunnerRef.current = gameConfig.isLocalGame
      ? new LocalGameRunner(ctx, gameConfig)
      : new NetworkGameRunner(ctx, gameConfig);

    gameRunnerRef.current.start();

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();

      // Update canvas dimensions to match container
      canvas.width = width;
      canvas.height = height;

      // gameRef.current?.resize(width, height);
      gameRunnerRef.current?.resize(width, height);
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
    <Draggable handle=".handle" defaultPosition={{ x: 0, y: 0 }} scale={1}>
      <Window className="canvas-window handle">
        <WindowContent className="canvas-content">
          <CanvasOverlay />
          <div ref={containerRef} className="canvas-container">
            <canvas ref={canvasRef} />
          </div>
        </WindowContent>
      </Window>
    </Draggable>
  );
};

export default Canvas;
