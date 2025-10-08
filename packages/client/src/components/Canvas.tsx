import { useEffect, useRef } from 'react';
import { Window, WindowContent } from 'react95';
import { CanvasOverlay } from './CanvasOverlay';
import Draggable from 'react-draggable';
import { NetworkGameRunner } from '@/game/network/NetworkGameRunner';
import { LocalGameRunner } from '@/game/local/LocalGameRunner';
import { useGameContext } from '@/state/GameContext';

interface CanvasProps {
  className?: string;
}
const Canvas = ({ className }: CanvasProps) => {
  const { gameConfig, setGameRunner } = useGameContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize which type of game runner to use.
    const gameRunner = gameConfig.isLocalGame ? new LocalGameRunner(ctx, gameConfig) : new NetworkGameRunner(ctx, gameConfig);
    setGameRunner(gameRunner);
    gameRunner.start();

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();

      // Update canvas dimensions to match container
      canvas.width = width;
      canvas.height = height;
      gameRunner.resize(width, height);
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
      <Window className={`pb-1 h-fit cursor-grab handle ${className}`}>
        <WindowContent className="relative">
          <CanvasOverlay />
          <div ref={containerRef} className="flex justify-center items-center ">
            <canvas
              ref={canvasRef}
              className="border-5 border-black aspect-square bg-white w-[80vw] h-[40vh] p-1.5 xs:h-[50vh] xs:w-[80vw] sm:h-[60vh] sm:w-[75vw]  md:h-[400px] md:w-[400px] xl:h-[600px] xl:w-[600px]"
            />
          </div>
        </WindowContent>
      </Window>
    </Draggable>
  );
};

export default Canvas;
