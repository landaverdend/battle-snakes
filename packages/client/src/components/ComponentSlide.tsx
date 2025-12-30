import { useWindowSize } from '@/hooks/useWindowSize';
import { createContext, useContext, useState, ReactNode } from 'react';
import { Button, Frame, Tabs, Tab, TabBody } from 'react95';

type PanelId = 'players' | 'messages' | null;

type MobileDrawerContextType = {
  activePanel: PanelId;
  setActivePanel: (panel: PanelId) => void;
  registerPanel: (id: 'players' | 'messages', content: ReactNode) => void;
  panels: Record<string, ReactNode>;
};

const MobileDrawerContext = createContext<MobileDrawerContextType | null>(null);

export const MobileDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [panels, setPanels] = useState<Record<string, ReactNode>>({});

  const registerPanel = (id: 'players' | 'messages', content: ReactNode) => {
    setPanels((prev) => ({ ...prev, [id]: content }));
  };

  return (
    <MobileDrawerContext.Provider value={{ activePanel, setActivePanel, registerPanel, panels }}>
      {children}
    </MobileDrawerContext.Provider>
  );
};

export const useMobileDrawer = () => {
  const ctx = useContext(MobileDrawerContext);
  if (!ctx) throw new Error('useMobileDrawer must be used within MobileDrawerProvider');
  return ctx;
};

type ComponentSlideProps = {
  children: React.ReactNode;
  position: 'left' | 'right';
};

export const ComponentSlide = ({ children, position }: ComponentSlideProps) => {
  const windowSize = useWindowSize();
  const isMobile = windowSize.width < 1000;

  // On desktop, render inline
  if (!isMobile) return <>{children}</>;

  // On mobile, don't render here - MobileDrawer handles it
  return null;
};

type MobileDrawerProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
};

export const MobileDrawer = ({ leftPanel, rightPanel }: MobileDrawerProps) => {
  const windowSize = useWindowSize();
  const [activeTab, setActiveTab] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const isMobile = windowSize.width < 1000;
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Drawer content */}
      {isOpen && (
        <Frame className="mx-2 mb-1 max-h-[50vh] overflow-y-auto">
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
            <Tab value={0}>Players</Tab>
            <Tab value={1}>Messages</Tab>
          </Tabs>
          <TabBody className="!p-2">
            {activeTab === 0 && leftPanel}
            {activeTab === 1 && rightPanel}
          </TabBody>
        </Frame>
      )}

      {/* Toggle bar */}
      <Frame className="flex justify-center p-1">
        <Button onClick={() => setIsOpen((v) => !v)} className="!w-full !max-w-[200px]">
          {isOpen ? '▼ Hide' : '▲ Players / Messages'}
        </Button>
      </Frame>
    </div>
  );
};
