import { useWindowSize } from '@/hooks/useWindowSize';
import { useEffect, useState } from 'react';
import { Button } from 'react95';

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
  const pos = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`!fixed top-1/5 ${pos} `}>
      <div className={`flex flex-row ${position === 'right' ? '' : 'flex-row-reverse'} `}>
        <Button className="!w-[30px]" onClick={() => setIsOpen((v) => !v)}>
          {isOpen ? Labels[position][0] : Labels[position][1]}
        </Button>
        <div className={`${isOpen ? '' : 'hidden'}`}>{children}</div>
      </div>
    </div>
  );
};
