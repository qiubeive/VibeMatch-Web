import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ChevronLeft, Camera, MoreHorizontal, Battery, Wifi, Signal, Mic, Smile, Plus } from 'lucide-react';

export default function Overlays() {
  const { uiMode, loadedImage } = useAppStore();

  // 通用状态栏 (Status Bar)
  const StatusBar = () => (
    <div className="absolute top-0 w-full px-6 py-3 flex justify-between items-end text-white/90 z-50 text-[10px] font-medium tracking-wide shadow-sm">
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
        <div className="absolute inset-0 flex flex-col items-center pt-20 text-white pointer-events-none transition-opacity duration-300">
          <div className="text-7xl font-thin tracking-tighter opacity-90 drop-shadow-lg font-sans">09:41</div>
          <div className="text-lg font-medium opacity-80 mt-2">Wednesday, Jan 18</div>
          
          <div className="mt-auto mb-10 w-full flex justify-between px-12 opacity-60">
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
               <div className="w-6 h-6 bg-white rounded-full opacity-80"></div> 
             </div>
             <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
               <Camera size={20} />
             </div>
          </div>
        </div>
      )}

      {/* 2. 微信模式 (WeChat) */}
      {uiMode === 'wechat' && (
        <div className="absolute inset-0 flex flex-col pointer-events-none transition-opacity duration-300">
          {/* 模拟微信顶栏 */}
          <div className="pt-14 px-4 flex items-center text-white/90 drop-shadow-md bg-gradient-to-b from-black/60 to-transparent pb-8">
            <ChevronLeft size={24} />
            <span className="ml-1 text-lg font-medium tracking-wide">朋友圈</span>
            <Camera className="ml-auto opacity-80" size={20} />
          </div>
          
          {/* 模拟右下角悬浮头像 */}
          <div className="absolute top-[520px] right-6 flex flex-col items-end gap-3 drop-shadow-2xl">
             <div className="text-white font-bold text-lg drop-shadow-md tracking-tight">VibeMatch</div>
             <div className="p-0.5 bg-white/20 rounded-[12px] backdrop-blur-sm border border-white/10 shadow-xl">
                {loadedImage ? (
                  <img src={loadedImage.src} className="w-16 h-16 rounded-[10px] bg-gray-800 object-cover" alt="avatar" />
                ) : (
                  <div className="w-16 h-16 rounded-[10px] bg-gray-800" />
                )}
             </div>
          </div>
        </div>
      )}

      {/* 3. 小红书模式 (RedNote) */}
      {uiMode === 'rednote' && (
        <div className="absolute inset-0 flex flex-col pointer-events-none transition-opacity duration-300">
          <div className="flex justify-center pt-14 gap-6 text-white/70 text-sm font-bold drop-shadow-md bg-gradient-to-b from-black/50 to-transparent pb-4">
              <span>关注</span>
              <span className="text-white border-b-2 border-white pb-1">发现</span>
              <span>杭州</span>
          </div>
          
          {/* 模拟底部文案区 */}
          <div className="mt-auto px-4 pb-8 flex flex-col gap-3">
             <div className="p-3 rounded-2xl flex gap-3 items-center bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-white">V</span>
                 </div>
                 <div className="text-xs text-white min-w-0">
                    <div className="font-bold truncate">Vibe Generated</div>
                    <div className="opacity-70 scale-90 origin-left truncate">自动匹配你的视觉磁场</div>
                 </div>
                 <button className="ml-auto bg-[#ff2442] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-red-500/30 shrink-0">
                    关注
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* 4. 通用聊天模式 (Chat / QQ) - 新增 Phase 5 功能 */}
      {uiMode === 'chat' && (
        <div className="absolute inset-0 flex flex-col pointer-events-none font-sans transition-opacity duration-300">
          {/* 顶栏 */}
          <div className="pt-14 px-4 pb-3 flex items-center justify-between bg-white/10 backdrop-blur-md border-b border-white/5 z-10">
            <ChevronLeft size={24} className="text-white" />
            <div className="flex flex-col items-center">
                <span className="text-base font-medium text-white">VibeMatch 交流群(30W)</span>
                <span className="text-[10px] text-white/60">328 人在线</span>
            </div>
            <MoreHorizontal size={24} className="text-white" />
          </div>
          
          {/* 模拟聊天气泡 */}
          <div className="flex-1 p-4 flex flex-col gap-6 overflow-hidden justify-end pb-4">
             {/* 时间戳 */}
             <div className="flex justify-center">
                <span className="text-[10px] bg-black/20 text-white/60 px-2 py-1 rounded backdrop-blur-sm">昨天 23:42</span>
             </div>

             {/* 对方的气泡 (AI) */}
             <div className="flex gap-2 items-start">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/20">AI</div>
                <div className="flex flex-col gap-1 max-w-[70%]">
                    <span className="text-[10px] text-white/60 ml-1">Vibe Bot</span>
                    <div className="bg-white/10 backdrop-blur-xl px-4 py-2.5 rounded-2xl rounded-tl-none text-sm text-white/90 shadow-lg border border-white/5">
                        这张背景图的氛围感怎么样？🎵
                    </div>
                </div>
             </div>

             {/* 自己的气泡 (Me) */}
             <div className="flex gap-2 items-end justify-end mt-2">
                <div className="bg-[#0099ff]/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl rounded-tr-none text-sm text-white max-w-[70%] shadow-lg shadow-blue-500/20 border border-white/10">
                   太强了！连文字都能看清楚，这就是我要的“秩序感混乱”！✨
                </div>
                {loadedImage ? (
                  <img src={loadedImage.src} className="w-9 h-9 rounded-full bg-gray-800 object-cover border border-white/20 shrink-0" alt="me" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-800 border border-white/20 shrink-0" />
                )}
             </div>
          </div>

          {/* 底部输入框模拟 */}
          <div className="pt-2 pb-8 bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center px-4 gap-3">
             <Mic size={24} className="text-white/80" />
             <div className="flex-1 h-9 bg-white/10 rounded-lg flex items-center px-3">
                <span className="text-xs text-white/40">发消息...</span>
             </div>
             <Smile size={24} className="text-white/80" />
             <Plus size={24} className="text-white/80" />
          </div>
        </div>
      )}
    </>
  );
}