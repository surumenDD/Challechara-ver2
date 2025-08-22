'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ReactNode, useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

interface PanelsProps {
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function Panels({ leftPanel, centerPanel, rightPanel }: PanelsProps) {
  const { ui, setRightPanelOpen } = useStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // モバイル表示
  if (isMobile) {
    return (
      <div className="h-full mobile-accordion">
        <MobileAccordion
          panels={[
            { id: 'center', title: 'エディタ', content: centerPanel },
            { id: 'left', title: 'ソース', content: leftPanel },
            { id: 'right', title: '辞書・資料', content: rightPanel },
          ]}
        />
      </div>
    );
  }

  // タブレット表示
  if (isTablet) {
    return (
      <div className="h-full flex">
        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={40} minSize={35}>
            <div className="h-full border-r border-gray-200">
              {leftPanel}
            </div>
          </Panel>
          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
          <Panel defaultSize={60} minSize={45}>
            <div className="h-full">
              {centerPanel}
            </div>
          </Panel>
        </PanelGroup>
        
        {/* 右パネルオーバーレイ */}
        {ui.rightPanelOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setRightPanelOpen(false)}
          />
        )}
        <div className={`tablet-overlay ${ui.rightPanelOpen ? 'open' : ''}`}>
          <div className="h-full">
            {rightPanel}
          </div>
        </div>
      </div>
    );
  }

  // デスクトップ表示（3ペイン）
  return (
    <PanelGroup direction="horizontal" className="h-full">
      <Panel defaultSize={22} minSize={19} maxSize={28}>
        <div className="h-full border-r border-gray-200">
          {leftPanel}
        </div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
      <Panel defaultSize={53} minSize={44}>
        <div className="h-full border-r border-gray-200">
          {centerPanel}
        </div>
      </Panel>
      <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-gray-300 transition-colors" />
      <Panel defaultSize={25} minSize={20} maxSize={31}>
        <div className="h-full">
          {rightPanel}
        </div>
      </Panel>
    </PanelGroup>
  );
}

interface MobileAccordionProps {
  panels: Array<{
    id: string;
    title: string;
    content: ReactNode;
  }>;
}

function MobileAccordion({ panels }: MobileAccordionProps) {
  const [openPanel, setOpenPanel] = useState<string>('center');

  return (
    <div className="h-full overflow-y-auto">
      {panels.map((panel) => (
        <div key={panel.id} className="border-b border-gray-200">
          <div 
            className="accordion-header"
            onClick={() => setOpenPanel(openPanel === panel.id ? '' : panel.id)}
          >
            <span>{panel.title}</span>
            <span className={`transform transition-transform ${
              openPanel === panel.id ? 'rotate-180' : ''
            }`}>
              ▼
            </span>
          </div>
          <div className={`accordion-content ${openPanel === panel.id ? 'open' : ''}`}>
            {panel.content}
          </div>
        </div>
      ))}
    </div>
  );
}