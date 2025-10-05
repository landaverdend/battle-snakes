import { useWindowSize } from '@/hooks/useWindowSize';
import { useEffect, useState } from 'react';

type ComponentSlideProps = {
  children: React.ReactNode;
  position: 'left' | 'right';
};
export const ComponentSlide = ({ children, position }: ComponentSlideProps) => {
  const windowSize = useWindowSize();

  const [isOpen, setIsOpen] = useState(false);
  const [shouldDisplay, setShouldDisplay] = useState(false);

  const positionClass = position === 'left' ? 'left-0' : 'right-0';

  useEffect(() => {
    if (windowSize.width < 1000) {
      setShouldDisplay(true);
    } else {
      setShouldDisplay(false);
    }
  }, [windowSize]);

  if (!shouldDisplay) return <>{children}</>;

  return <div className={`${positionClass} absolute top-1/5`}>{children}</div>;
};
