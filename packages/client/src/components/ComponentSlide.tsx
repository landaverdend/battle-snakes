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

  return (
    <div className={`absolute top-1/5 ${position}-0 z-40`}>
      {/* Panel */}
      <div className={`flex flex-row ${position === 'right' ? 'flex-row-reverse' : ''} items-center`}>
        {children}
        <Button type="button" onClick={() => setIsOpen((v) => !v)}>
          {isOpen ? Labels[position][0] : Labels[position][1]}
        </Button>
      </div>
    </div>
  );
};
