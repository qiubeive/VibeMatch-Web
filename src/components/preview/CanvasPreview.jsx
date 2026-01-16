import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

// 引入我们在 Step 2 移植好的算法核心
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
         // Pixel 引擎逻辑简单，直接内联在这里，或者你以后单独拆分
         renderPixelEngine(ctx, img, width, height);
      } else {
        // 默认 Fluid (流体) 效果 - 这里简单模拟一个高斯模糊背景
        renderFluidEngine(ctx, width, height, baseColors);
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
      className="w-full h-full object-cover rounded-[40px] shadow-2xl" 
    />
  );
}

// --- 内部微型引擎实现 ---

function renderFluidEngine(ctx, w, h, colors) {
    // 简单模拟流体：用渐变色填充
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    const c1 = colors[0];
    const c2 = colors[2] || colors[0];
    grd.addColorStop(0, `rgb(${c1.r},${c1.g},${c1.b})`);
    grd.addColorStop(1, `rgb(${c2.r},${c2.g},${c2.b})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
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