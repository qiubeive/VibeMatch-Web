import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Image as ImageIcon, Zap, Grid, Layers, Droplets, Download, Smartphone, Check } from 'lucide-react';

const engines = [
  { id: 'fluid', name: 'Fluid', desc: '高斯流体/柔和', icon: Droplets, color: 'text-blue-400' },
  { id: 'glitch', name: 'Cyber-Rot', desc: '故障艺术/信号', icon: Zap, color: 'text-yellow-400' },
  { id: 'pixel', name: 'Pixel-Zen', desc: '低像素/复古', icon: Grid, color: 'text-purple-400' },
  { id: 'chaos', name: 'Chaos', desc: '秩序重构/拼图', icon: Layers, color: 'text-green-400' },
];

export default function Sidebar() {
  const { 
    activeEngine, setEngine, 
    params, updateParams, 
    uploadImage, 
    uiMode, setUiMode // 获取新的 UI 状态
  } = useAppStore();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
  };

  // --- 真实的导出逻辑 ---
  const handleDownload = () => {
    setIsExporting(true);
    // 稍微延迟一下以显示 Loading 状态
    setTimeout(() => {
        const canvas = document.querySelector('canvas'); // 获取画布
        if (canvas) {
            const link = document.createElement('a');
            link.download = `VibeMatch_${activeEngine}_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0); // 导出最高质量
            link.click();
        }
        setIsExporting(false);
    }, 800);
  };

  return (
    <aside className="w-[400px] h-full flex flex-col z-20 shadow-2xl bg-glass-bg backdrop-blur-2xl border-l border-glass-border">
      
      {/* Header */}
      <div className="p-6 border-b border-glass-border flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold tracking-tight">VibeMatch<span className="text-[#ff2442] text-xs align-top ml-1">PRO</span></h1>
        <label className="cursor-pointer text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2">
          <ImageIcon size={14} /> 更换头像
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* --- 新增：UI 预览切换 --- */}
        <section>
             <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Preview Skin</div>
             <div className="flex bg-white/5 p-1 rounded-xl">
                {['clean', 'wechat', 'rednote'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setUiMode(mode)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
                            ${uiMode === mode ? 'bg-white text-black shadow-lg' : 'text-white/50 hover:bg-white/10'}`}
                    >
                        {mode}
                    </button>
                ))}
             </div>
        </section>

        {/* Engine Selector (保持不变) */}
        <section>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Render Engine</div>
          <div className="grid grid-cols-2 gap-3">
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <div 
                  key={engine.id}
                  onClick={() => setEngine(engine.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 group
                    ${activeEngine === engine.id 
                      ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <Icon className={`${engine.color} mb-2 group-hover:scale-110 transition-transform`} size={20} />
                  <div className="text-sm font-bold">{engine.name}</div>
                  <div className="text-[10px] text-white/40">{engine.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Parameters (保持不变) */}
        <section>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Parameters</div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2 text-white/70"><span>Darken</span><span>{params.darken}%</span></div>
              <input type="range" min="0" max="80" value={params.darken} onChange={(e) => updateParams('darken', Number(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2 text-white/70"><span>Noise</span><span>{params.noise}%</span></div>
              <input type="range" min="0" max="50" value={params.noise} onChange={(e) => updateParams('noise', Number(e.target.value))} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        </section>

        {/* Quote Input (保持不变) */}
        <section>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Daily Quote</div>
          <textarea 
            placeholder="在此输入文案..." 
            value={params.text}
            onChange={(e) => updateParams('text', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30 resize-none h-20"
          />
        </section>
      </div>

      {/* Footer Export Button */}
      <div className="p-6 border-t border-glass-border bg-black/20 shrink-0">
        <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:scale-100"
        >
            {isExporting ? <span className="animate-spin">⏳</span> : <Download size={16} />}
            <span>{isExporting ? 'Generating...' : 'Export HD Wallpaper'}</span>
        </button>
      </div>
    </aside>
  );
}