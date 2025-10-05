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

  const sideClass = position === 'left' ? 'left-0' : 'right-0';
  const closedTranslate = position === 'left' ? '-translate-x-full' : 'translate-x-full';

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

  const wrapperTranslate = isOpen ? 'translate-x-0' : closedTranslate;
  const tabSide = position === 'left' ? 'right-0' : 'left-0';
  const tabCounterShift = isOpen ? 'translate-x-0' : position === 'left' ? 'translate-x-full' : '-translate-x-full';

  return (
    <div className={`absolute top-1/5 ${sideClass} z-40`}>
      {/* Sliding wrapper contains panel and attached tab */}
      <div className={`relative transition-transform duration-300 ease-out ${wrapperTranslate}`}>
        {/* Panel */}
        <div className="border border-black bg-windows-bg shadow-[inset_-1px_-1px_0px_#000]">{children}</div>

        {/* Attached tab (acts as open/close button) */}
        <Button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className={`
            !absolute ${tabSide} !top-4 
            ${tabCounterShift}
            !font-bold
`}>
          {isOpen ? Labels[position][0] : Labels[position][1]}
        </Button>
      </div>
    </div>
  );
};
