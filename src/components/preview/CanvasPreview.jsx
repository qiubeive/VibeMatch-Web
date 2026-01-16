import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

// 引入核心算法模块
import { ColorCore } from '../../core/colorExtract';
import { GlitchCore } from '../../core/pixelSort';
import { ChaosCore } from '../../core/puzzle';
import { TextCore } from '../../core/textGen';

export default function CanvasPreview() {
  const canvasRef = useRef(null);
  // 从 Store 获取所有需要的状态
  const { 
    imageUrl, activeEngine, params, 
    baseColors, setBaseColors, 
    setLoadedImage, originalImage 
  } = useAppStore();

  // 1. 图片加载与色彩分析 (只在图片变动时执行)
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; // 允许跨域加载 Unsplash 图片
    img.src = imageUrl;
    
    img.onload = () => {
      setLoadedImage(img); // 存入 Store 供后续渲染使用
      
      // 分析颜色 (算法层)
      const colors = ColorCore.analyze(img);
      setBaseColors(colors);
    };
  }, [imageUrl, setLoadedImage, setBaseColors]);

  // 2. 核心渲染循环 (监听 参数/引擎/颜色/图片 变化)
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = originalImage;
    
    // 如果没有图片或颜色还没算好，就不画
    if (!canvas || !img || baseColors.length === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    
    // Retina 高清屏适配 (物理像素 = CSS像素 * DPR)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // --- A. 引擎分发 (Strategy Pattern) ---
    // 根据 activeEngine 决定调用哪个算法
    try {
      if (activeEngine === 'glitch') {
        GlitchCore.render(ctx, img, width, height, baseColors);
      } else if (activeEngine === 'chaos') {
        ChaosCore.render(ctx, img, width, height, baseColors);
      } else if (activeEngine === 'pixel') {
         // Pixel 引擎逻辑简单，直接内联
         renderPixelEngine(ctx, img, width, height);
      } else {
        // Fluid (流体) 效果 - 传入 params 以支持配色模式
        renderFluidEngine(ctx, width, height, baseColors, params);
      }
    } catch (e) {
      console.error("渲染引擎报错:", e);
    }

    // --- B. 后处理 (Post-Processing) ---
    // 1. 压暗处理
    if (params.darken > 0) {
      ctx.fillStyle = `rgba(0,0,0, ${params.darken / 100})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. 噪点叠加 (模拟胶片感)
    if (params.noise > 0) {
        renderNoise(ctx, width, height, params.noise);
    }

    // 3. 文案绘制
    if (params.text) {
       // 取第二主色作为装饰色
       TextCore.render(ctx, width, height, params.text, baseColors[1] || {r:255,g:255,b:255});
    }

  }, [activeEngine, params, baseColors, originalImage]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full object-cover md:rounded-[40px] shadow-2xl" 
    />
  );
}

// --- 内部微型引擎实现 ---

// 升级版 Fluid 引擎：支持 Music App 风格的弥散光感 + 配色策略
function renderFluidEngine(ctx, w, h, colors, params) {
    // 1. 获取配色方案 (应用色彩策略)
    let palette = colors;
    
    // 确保 ColorCore.generateHarmony 存在 (防止未更新 core 文件导致报错)
    if (params.colorMode !== 'natural' && ColorCore.generateHarmony) {
        const newColors = ColorCore.generateHarmony(colors[0], params.colorMode);
        if (newColors) palette = newColors;
    }

    // 确保有足够的颜色
    const c1 = palette[0];
    const c2 = palette[1] || c1;
    const c3 = palette[2] || c2;

    // 2. 绘制深色底色 (Music App 风格通常底色很深，我们用主色压暗做底)
    ctx.fillStyle = `rgb(${c1.r * 0.2}, ${c1.g * 0.2}, ${c1.b * 0.2})`;
    ctx.fillRect(0, 0, w, h);

    // 3. 绘制多个弥散光斑 (模拟流体)
    // 技巧：使用 screen 混合模式让光斑叠加更通透
    ctx.globalCompositeOperation = 'screen';
    
    const drawOrb = (x, y, r, color, opacity) => {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, `rgba(${color.r},${color.g},${color.b}, ${opacity})`);
        grd.addColorStop(1, `rgba(${color.r},${color.g},${color.b}, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    };

    // 主光斑 (左上，大范围)
    drawOrb(0, 0, w * 0.9, c1, 0.6);
    // 副光斑 (右下，中范围)
    drawOrb(w, h, w * 0.8, c2, 0.5);
    // 强调光斑 (中间游离，增加层次)
    drawOrb(w * 0.3, h * 0.4, w * 0.6, c3, 0.4);

    // 4. 重置混合模式，以免影响后续绘制
    ctx.globalCompositeOperation = 'source-over';
}

function renderPixelEngine(ctx, img, w, h) {
    // 简单的像素化算法
    const size = 20;
    const cols = Math.ceil(w/size);
    const rows = Math.ceil(h/size);
    
    // 1. 绘制微缩图
    const tempC = document.createElement('canvas');
    tempC.width = cols; tempC.height = rows;
    const tempCtx = tempC.getContext('2d');
    tempCtx.drawImage(img, 0, 0, cols, rows);
    
    // 2. 放大绘制 (关闭平滑)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempC, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
}

function renderNoise(ctx, w, h, amount) {
    ctx.save();
    ctx.globalAlpha = amount / 200; // 调整透明度
    for(let i=0; i<w*h/10; i++) { // 随机绘制噪点
        ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillRect(x, y, 1.5, 1.5);
    }
    ctx.restore();
}