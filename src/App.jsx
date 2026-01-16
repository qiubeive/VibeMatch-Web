import React from 'react';
import Sidebar from './components/layout/Sidebar';
import CanvasPreview from './components/preview/CanvasPreview';
import Overlays from './components/preview/Overlays'; // 1. 引入组件
import { useAppStore } from './store/useAppStore';

function App() {
  const { baseColors } = useAppStore();
  
  const bgStyle = baseColors.length > 0 
    ? { background: `radial-gradient(circle at 50% 50%, rgba(${baseColors[0].r},${baseColors[0].g},${baseColors[0].b}, 0.4) 0%, rgba(0,0,0,1) 80%)` }
    : { background: '#000' };

  return (
    <div className="flex h-screen w-screen relative overflow-hidden bg-black text-white selection:bg-white selection:text-black font-sans">
      
      {/* Background & Noise Layers (不变) */}
      <div className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none" style={bgStyle} />
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        
        {/* iPhone Frame */}
        <div className="relative w-[360px] h-[720px] rounded-[50px] bg-black shadow-2xl border-[6px] border-[#1a1a1a] ring-2 ring-[#333] overflow-hidden select-none">
            {/* Dynamic Island */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-50 pointer-events-none" />
            
            {/* Layers */}
            <CanvasPreview />
            
            {/* 2. 插入 UI 蒙版层 (z-index 自动在 Canvas 之上) */}
            <Overlays />
            
        </div>
      </main>

      <Sidebar />
    </div>
  );
}

export default App;