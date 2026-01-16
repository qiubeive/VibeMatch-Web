import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RenderPipeline } from '../../core/renderPipeline'; // 引入核心渲染管线
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
    originalImage, baseColors, // 核心数据：原图和颜色
    uiMode, setUiMode 
  } = useAppStore();
  
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
  };

  // --- 商业级 4K 导出逻辑 ---
  const handleDownload = async () => {
    // 如果没有原图或颜色还没提取好，不能导出
    if (!originalImage || baseColors.length === 0) {
        alert("请先上传图片并等待加载完成");
        return;
    }
    
    setIsExporting(true);

    try {
        // 1. 创建高清离屏 Canvas (模拟 iPhone 14 Pro Max 分辨率)
        // 商业标准：不管屏幕多小，导出的永远是 4K 高清图
        const exportWidth = 1290;
        const exportHeight = 2796;
        
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');
        
        // 2. 调用核心管线进行绘制
        // 这会复用所有的渲染逻辑，包括引擎、滤镜、以及画上去的 UI
        // 这是一个"纯绘制"过程，不依赖浏览器截图，所以非常稳定且高清
        RenderPipeline.render(ctx, {
            image: originalImage,
            width: exportWidth,
            height: exportHeight,
            engine: activeEngine,
            colors: baseColors,
            params: params,
            uiMode: uiMode
        });
        
        // 3. 导出 Blob 并下载
        canvas.toBlob((blob) => {
            if (!blob) {
                alert("生成失败，请重试");
                setIsExporting(false);
                return;
            }
            const link = document.createElement('a');
            link.download = `VibeMatch_${activeEngine}_${Date.now()}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            
            // 清理内存
            URL.revokeObjectURL(link.href);
            setIsExporting(false);
        }, 'image/png', 0.95); // 0.95 高质量 JPG/PNG
        
    } catch (err) {
        console.error("Export failed", err);
        alert("导出出错，请检查控制台");
        setIsExporting(false);
    }
  };

  return (
    <aside className="
        z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] bg-glass-bg backdrop-blur-2xl border-t md:border-t-0 md:border-l border-glass-border flex flex-col
        fixed bottom-0 left-0 w-full h-[45vh]
        md:relative md:h-full md:w-[400px]
    ">
      
      {/* 顶部 Header */}
      <div className="p-4 md:p-6 border-b border-glass-border flex justify-between items-center shrink-0">
        <h1 className="text-lg md:text-xl font-bold tracking-tight">VibeMatch<span className="text-[#ff2442] text-xs align-top ml-1">PRO</span></h1>
        <label className="cursor-pointer text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2">
          <ImageIcon size={14} /> 
          <span className="hidden md:inline">更换头像</span>
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {/* 中间滚动区 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        
        {/* UI 模式选择 */}
        <section>
             <div className="flex bg-white/5 p-1 rounded-xl">
                {['clean', 'wechat', 'rednote', 'chat'].map(mode => (
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

        {/* 参数控制区 */}
        <section className="space-y-4">
          
          {/* 色彩策略控制 */}
          <div>
            <div className="text-[10px] text-white/60 mb-2 font-bold uppercase tracking-widest">Color Vibe</div>
            <div className="flex bg-white/5 p-1 rounded-lg">
                {[
                    { id: 'natural', label: '原色' },
                    { id: 'contrast', label: '撞色' },
                    { id: 'analogous', label: '氛围' }
                ].map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => updateParams('colorMode', mode.id)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all
                            ${params.colorMode === mode.id 
                                ? 'bg-white/20 text-white shadow-sm' 
                                : 'text-white/40 hover:text-white/70'}`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
          </div>

          {/* 压暗滑块 */}
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/60 w-12 font-bold uppercase">Darken</span>
             <input type="range" min="0" max="80" value={params.darken} onChange={(e) => updateParams('darken', Number(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30" />
          </div>
          
          {/* 噪点滑块 */}
          <div className="flex items-center gap-3">
             <span className="text-[10px] text-white/60 w-12 font-bold uppercase">Noise</span>
             <input type="range" min="0" max="50" value={params.noise} onChange={(e) => updateParams('noise', Number(e.target.value))} className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hover:bg-white/30" />
          </div>
        </section>

        {/* 文案输入 */}
        <section>
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Quote</div>
          <input 
            type="text"
            placeholder="输入文案 (自动排版)..." 
            value={params.text}
            onChange={(e) => updateParams('text', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30 transition-all"
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
            <span>{isExporting ? '正在渲染 4K 壁纸...' : '下载高清原图'}</span>
        </button>
      </div>
    </aside>
  );
}