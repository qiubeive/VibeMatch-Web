import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { useAppStore } from '../../store/useAppStore';
import { Image as ImageIcon, Zap, Grid, Layers, Droplets, Download } from 'lucide-react';

const engines = [
  { id: 'fluid', name: 'Fluid', desc: '柔和流体', icon: Droplets, color: 'text-blue-400' },
  { id: 'glitch', name: 'Cyber', desc: '故障信号', icon: Zap, color: 'text-yellow-400' },
  { id: 'pixel', name: 'Pixel', desc: '复古像素', icon: Grid, color: 'text-purple-400' },
  { id: 'chaos', name: 'Chaos', desc: '秩序重构', icon: Layers, color: 'text-green-400' },
];

export default function Sidebar() {
  const { 
    activeEngine, setEngine, 
    params, updateParams, 
    uploadImage, 
    uiMode, setUiMode 
  } = useAppStore();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
  };

  const handleDownload = async () => {
    setIsExporting(true);
    const element = document.getElementById('preview-capture');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `VibeMatch_${activeEngine}_${uiMode}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    // 响应式容器：
    // 手机端 (默认): h-[45vh] w-full fixed bottom-0 (底部抽屉)
    // 电脑端 (md:): h-full w-[400px] relative (右侧边栏)
    <aside className="
        z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] bg-glass-bg backdrop-blur-2xl border-t md:border-t-0 md:border-l border-glass-border flex flex-col
        fixed bottom-0 left-0 w-full h-[45vh]
        md:relative md:h-full md:w-[400px]
    ">
      
      {/* 顶部 Header (手机端隐藏更换头像文案，只留图标，省空间) */}
      <div className="p-4 md:p-6 border-b border-glass-border flex justify-between items-center shrink-0">
        <h1 className="text-lg md:text-xl font-bold tracking-tight">VibeMatch<span className="text-[#ff2442] text-xs align-top ml-1">PRO</span></h1>
        <label className="cursor-pointer text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2">
          <ImageIcon size={14} /> 
          <span className="hidden md:inline">更换头像</span>
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {/* 中间滚动区 (手机端紧凑布局) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        
        {/* UI 切换 */}
        <section>
             <div className="flex bg-white/5 p-1 rounded-xl">
                {['clean', 'wechat', 'rednote'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setUiMode(mode)}
                        className={`flex-1 py-1.5 md:py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
                            ${uiMode === mode ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:bg-white/10'}`}
                    >
                        {mode}
                    </button>
                ))}
             </div>
        </section>

        {/* 引擎选择 */}
        <section>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 md:mb-3">Engine</div>
          <div className="grid grid-cols-4 md:grid-cols-2 gap-2 md:gap-3">
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <div 
                  key={engine.id}
                  onClick={() => setEngine(engine.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all
                    ${activeEngine === engine.id 
                      ? 'bg-white/10 border-white/30' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <Icon className={`${engine.color} mb-1`} size={18} />
                  <div className="text-[10px] md:text-sm font-bold">{engine.name}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 参数滑块 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/60 w-12">Darken</span>
             <input type="range" min="0" max="80" value={params.darken} onChange={(e) => updateParams('darken', Number(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/60 w-12">Noise</span>
             <input type="range" min="0" max="50" value={params.noise} onChange={(e) => updateParams('noise', Number(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
          </div>
        </section>

        {/* 文案输入 (手机端只显示一行，省空间) */}
        <section>
          <input 
            type="text"
            placeholder="输入文案..." 
            value={params.text}
            onChange={(e) => updateParams('text', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30"
          />
        </section>
      </div>

      {/* 底部按钮 */}
      <div className="p-4 md:p-6 border-t border-glass-border bg-black/20 shrink-0">
        <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full bg-white text-black py-2.5 md:py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
        >
            {isExporting ? <span className="animate-spin">⏳</span> : <Download size={16} />}
            <span>{isExporting ? '生成中...' : '保存壁纸'}</span>
        </button>
      </div>
    </aside>
  );
}