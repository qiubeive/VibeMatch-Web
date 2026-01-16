import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ColorCore } from '../../core/colorExtract';
import { RenderPipeline } from '../../core/renderPipeline'; // 导入管线

export default function CanvasPreview() {
  const canvasRef = useRef(null);
  
  // 从 Store 获取所有需要的状态
  const { 
    imageUrl, activeEngine, params, 
    baseColors, setBaseColors, 
    setLoadedImage, originalImage, uiMode 
  } = useAppStore();

  // 1. 图片加载与色彩分析 (只在图片 URL 变动时执行)
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous"; // 允许跨域加载
    img.src = imageUrl;
    
    img.onload = () => {
      setLoadedImage(img); // 存入 Store 供 Pipeline 使用
      
      // 分析颜色 (使用新版加权算法)
      const colors = ColorCore.analyze(img);
      setBaseColors(colors);
    };
  }, [imageUrl, setLoadedImage, setBaseColors]);

  // 2. 核心渲染循环 (监听所有参数变化)
  useEffect(() => {
    const canvas = canvasRef.current;
    
    // 如果没有 Canvas、没有原图、或者颜色还没算好，就不画
    if (!canvas || !originalImage || baseColors.length === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas.getBoundingClientRect();
    
    // Retina 高清屏适配 (物理像素 = CSS像素 * DPR)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // --- 调用统一渲染管线 ---
    // 这里的精髓是：我们把"画什么"全交给了 Pipeline
    // 这里传入的是当前屏幕的尺寸 (width, height)，仅仅用于预览
    // 导出时，Sidebar 会传入 4K 尺寸，逻辑是一模一样的
    RenderPipeline.render(ctx, {
      image: originalImage,
      width: width,   // CSS 宽度
      height: height, // CSS 高度
      engine: activeEngine,
      colors: baseColors,
      params: params,
      uiMode: uiMode  // 现在 Canvas 也负责画 UI 了
    });

  }, [activeEngine, params, baseColors, originalImage, uiMode]);

  return (
    <canvas 
      ref={canvasRef} 
      id="preview-capture" 
      className="w-full h-full object-cover md:rounded-[40px] shadow-2xl" 
    />
  );
}