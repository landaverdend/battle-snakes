import { useWindowSize } from '@/hooks/useWindowSize';
import { useEffect, useState } from 'react';
import { Button } from 'react95';

// Open:Close labels
const Labels = {
  left: ['<', '>'],
  right: ['>', '<'],
};

type ComponentSlideProps = {
  children: React.ReactNode;
  position: 'left' | 'right';
};
export const ComponentSlide = ({ children, position }: ComponentSlideProps) => {
  const windowSize = useWindowSize();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldDisplay, setShouldDisplay] = useState(false);

  useEffect(() => {
    if (windowSize.width < 1000) {
      setShouldDisplay(true);
    } else {
      setShouldDisplay(false);
      setIsOpen(false);
    }
  }, [windowSize]);

  // Large screens: inline render
  if (!shouldDisplay) return <>{children}</>;

  const slideClasses = {
    left: {
      open: 'translate-x-0',
      closed: '-translate-x-[calc(100%-30px)]',
    },
    right: {
      open: 'translate-x-0',
      closed: 'translate-x-[calc(100%-25px)]',
    },
  };

  return (
    <div className={`absolute top-1/5 ${position}-0 w-fit overflow-hidden z-0 pointer-events-none`}>
      {/* Panel */}
      <div
        className={`flex flex-row ${position === 'right' ? 'flex-row-reverse' : ''} ${
          isOpen ? slideClasses[position].open : slideClasses[position].closed
        }`}>
        <div className={isOpen ? 'pointer-events-auto' : 'opacity-0 pointer-events-none'}>{children}</div>
        <Button
          type="button"
          onClick={() => {
            setIsOpen((v) => !v);
          }}
          className="!w-[40px] !z-40 pointer-events-auto">
          {isOpen ? Labels[position][0] : Labels[position][1]}
        </Button>
      </div>
    </div>
  );
};
