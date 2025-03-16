import { useEffect, useRef } from 'react';

interface CanvasProps {
  width: number; // Grid width
  height: number; // Grid height
}

const Canvas = ({ width, height }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      // Get the container's dimensions
      const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

      // Make the canvas square using the smaller dimension
      const size = Math.min(containerWidth, containerHeight);

      // Set canvas size
      canvas.width = size;
      canvas.height = size;

      // Render after resize
      render();
    };

    const render = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      const cellWidth = canvas.width / width;
      const cellHeight = canvas.height / height;

      // Draw vertical lines
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, canvas.height);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(canvas.width, y * cellHeight);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
      }
    };

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    // Initial resize
    resizeCanvas();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [width, height]);


  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #000',
          backgroundColor: '#fff',
        }}
      />
    </div>
  );
};

export default Canvas;
