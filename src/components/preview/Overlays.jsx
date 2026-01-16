import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ChevronLeft, Camera, MoreHorizontal, Battery, Wifi, Signal } from 'lucide-react';

export default function Overlays() {
  const { uiMode, loadedImage } = useAppStore();

  // 通用状态栏 (Status Bar)
  const StatusBar = () => (
    <div className="absolute top-0 w-full px-6 py-3 flex justify-between items-end text-white/90 z-50 text-[10px] font-medium tracking-wide">
      <div className="pl-2">09:41</div>
      <div className="flex gap-1.5 items-center pr-2">
        <Signal size={12} strokeWidth={2.5} />
        <Wifi size={12} strokeWidth={2.5} />
        <Battery size={14} strokeWidth={2.5} />
      </div>
    </div>
  );

  return (
    <>
      <StatusBar />
      
      {/* 1. 锁屏模式 (Clean) */}
      {uiMode === 'clean' && (
        <div className="absolute inset-0 flex flex-col items-center pt-20 text-white pointer-events-none">
          <div className="text-7xl font-thin tracking-tighter opacity-90 drop-shadow-lg font-sans">09:41</div>
          <div className="text-lg font-medium opacity-80 mt-2">Wednesday, Jan 18</div>
          
          <div className="mt-auto mb-10 w-full flex justify-between px-12 opacity-60">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
               <div className="w-6 h-6 bg-white rounded-full opacity-80"></div> 
             </div>
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
               <Camera size={20} />
             </div>
          </div>
        </div>
      )}

      {/* 2. 微信模式 (WeChat) */}
      {uiMode === 'wechat' && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          {/* 模拟微信顶栏 */}
          <div className="pt-14 px-4 flex items-center text-white/90 drop-shadow-md bg-gradient-to-b from-black/50 to-transparent pb-6">
            <ChevronLeft size={24} />
            <span className="ml-1 text-lg font-medium tracking-wide">朋友圈</span>
            <Camera className="ml-auto opacity-80" size={20} />
          </div>
          
          {/* 模拟右下角悬浮头像 */}
          <div className="absolute top-[520px] right-6 flex flex-col items-end gap-3 drop-shadow-2xl">
             <div className="text-white font-bold text-lg drop-shadow-md tracking-tight">VibeMatch</div>
             <div className="p-0.5 bg-white/20 rounded-[10px] backdrop-blur-sm">
                {loadedImage ? (
                  <img src={loadedImage.src} className="w-16 h-16 roundedlg bg-gray-800 object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-800" />
                )}
             </div>
          </div>
        </div>
      )}

      {/* 3. 小红书模式 (RedNote) */}
      {uiMode === 'rednote' && (
        <div className="absolute inset-0 flex flex-col pointer-events-none">
          <div className="flex justify-center pt-14 gap-6 text-white/70 text-sm font-bold drop-shadow-md bg-gradient-to-b from-black/40 to-transparent pb-4">
              <span>关注</span>
              <span className="text-white border-b-2 border-white pb-1">发现</span>
              <span>杭州</span>
          </div>
          
          {/* 模拟底部文案区 */}
          <div className="mt-auto px-4 pb-8 flex flex-col gap-3">
             <div className="glass-panel p-3 rounded-2xl flex gap-3 items-center bg-black/30 backdrop-blur-md border border-white/10">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500 flex items-center justify-center">
                    <span className="text-[10px] font-bold">V</span>
                 </div>
                 <div className="text-xs text-white">
                    <div className="font-bold">Vibe Generated</div>
                    <div className="opacity-60 scale-90 origin-left">自动匹配你的视觉磁场</div>
                 </div>
                 <button className="ml-auto bg-[#ff2442] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/30">
                    关注
                 </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}