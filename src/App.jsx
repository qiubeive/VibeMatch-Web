import React from 'react';
import Sidebar from './components/layout/Sidebar';
import CanvasPreview from './components/preview/CanvasPreview';
import Overlays from './components/preview/Overlays';
import { useAppStore } from './store/useAppStore';

function App() {
  const { baseColors } = useAppStore();
  
  // 背景光效
  const bgStyle = baseColors.length > 0 
    ? { background: `radial-gradient(circle at 50% 50%, rgba(${baseColors[0].r},${baseColors[0].g},${baseColors[0].b}, 0.4) 0%, rgba(0,0,0,1) 80%)` }
    : { background: '#000' };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen relative overflow-hidden bg-black text-white selection:bg-white selection:text-black font-sans">
      
      {/* 1. 背景层 (Background Layers) */}
      <div className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none" style={bgStyle} />
      <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay" 
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}} 
      />

      {/* 2. 主预览区 (Main Preview Area) */}
      {/* 手机端: flex-1 撑满剩余空间 / 电脑端: 居中布局 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-0 md:p-8 overflow-hidden">
        
        {/* 核心容器：
            - 手机端: w-full h-full (全屏无边框), rounded-none
            - 电脑端: w-[360px] h-[720px] (模拟器), rounded-[50px]
        */}
        <div 
            id="preview-capture" 
            className="relative w-full h-full md:w-[360px] md:h-[720px] md:rounded-[50px] bg-black shadow-2xl md:border-[6px] md:border-[#1a1a1a] md:ring-2 md:ring-[#333] overflow-hidden select-none transition-all duration-500"
        >
            {/* 灵动岛 (只在电脑端 md:block 显示，手机端 hidden) */}
            <div className="hidden md:block absolute top-5 left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-50 pointer-events-none" />
            
            <CanvasPreview />
            <Overlays />
            
        </div>
      </main>

      {/* 3. 侧边栏 (Sidebar) */}
      {/* 这里的布局逻辑在 Sidebar 组件内部处理，它会自动变为底部面板 */}
      <Sidebar />
    </div>
  );
}

export default App;