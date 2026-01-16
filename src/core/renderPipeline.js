import { GlitchCore } from './pixelSort';
import { ChaosCore } from './puzzle';
import { TextCore } from './textGen';
import { ColorCore } from './colorExtract';

/**
 * RenderPipeline - 核心渲染管线 (修复版)
 * 职责：统一管理“屏幕预览”和“4K导出”的绘制逻辑
 */
export const RenderPipeline = {
  render: (ctx, { image, width, height, engine, colors, params, uiMode }) => {
    // 0. 基础清理
    ctx.clearRect(0, 0, width, height);
    if (!image) return;

    // 1. 容错颜色 (这里修正了之前的 Kp 拼写错误)
    const safeColors = colors && colors.length > 0 ? colors : [{r:0,g:0,b:0}, {r:255,g:255,b:255}];

    // --- Layer 1: 背景引擎渲染 ---
    ctx.save();
    try {
      switch (engine) {
        case 'glitch':
          GlitchCore.render(ctx, image, width, height, safeColors);
          break;
        case 'chaos':
          ChaosCore.render(ctx, image, width, height, safeColors);
          break;
        case 'pixel':
          renderPixelEngine(ctx, image, width, height);
          break;
        case 'fluid':
        default:
          renderFluidEngine(ctx, width, height, safeColors, params);
          break;
      }
    } catch (e) {
      console.error("Engine Render Failed:", e);
      ctx.drawImage(image, 0, 0, width, height); // 失败兜底
    }
    ctx.restore();

    // --- Layer 2: 全局滤镜 (Post-Processing) ---
    ctx.save();
    
    // 2.1 智能压暗
    if (params.darken > 0) {
      ctx.fillStyle = `rgba(0,0,0, ${params.darken / 100})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 2.2 胶片噪点 (性能优化版)
    if (params.noise > 0) {
      renderNoise(ctx, width, height, params.noise);
    }
    ctx.restore();

    // --- Layer 3: 文案层 ---
    if (params.text) {
      const accentColor = safeColors[1] || {r:255,g:255,b:255};
      TextCore.render(ctx, width, height, params.text, accentColor);
    }

    // --- Layer 4: UI 覆盖层 (商业级) ---
    if (uiMode !== 'clean') {
        renderUIOverlay(ctx, width, height, uiMode, safeColors);
    } else {
        renderStatusBar(ctx, width);
        renderLockScreenTime(ctx, width, height);
    }
  }
};

// --- 内部：微型引擎实现 ---

function renderFluidEngine(ctx, w, h, colors, params) {
  let palette = colors;
  // 支持色彩策略
  if (params.colorMode !== 'natural' && ColorCore.generateHarmony) {
      const newColors = ColorCore.generateHarmony(colors[0], params.colorMode);
      if (newColors) palette = newColors;
  }
  const c1 = palette[0];
  const c2 = palette[1] || c1;
  const c3 = palette[2] || c2;

  // 深色底
  ctx.fillStyle = `rgb(${c1.r * 0.2}, ${c1.g * 0.2}, ${c1.b * 0.2})`;
  ctx.fillRect(0, 0, w, h);

  // 弥散光斑
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
  drawOrb(0, 0, w * 0.9, c1, 0.6);
  drawOrb(w, h, w * 0.8, c2, 0.5);
  drawOrb(w * 0.3, h * 0.4, w * 0.6, c3, 0.4);
  ctx.globalCompositeOperation = 'source-over';
}

function renderPixelEngine(ctx, img, w, h) {
  const ratio = w / 1000;
  const size = Math.max(16, Math.floor(20 * ratio));
  const cols = Math.ceil(w/size);
  const rows = Math.ceil(h/size);
  
  const tempC = document.createElement('canvas');
  tempC.width = cols; tempC.height = rows;
  const tempCtx = tempC.getContext('2d');
  tempCtx.drawImage(img, 0, 0, cols, rows);
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempC, 0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
}

function renderNoise(ctx, w, h, amount) {
    const patternSize = 256; 
    const pCv = document.createElement('canvas');
    pCv.width = patternSize; pCv.height = patternSize;
    const pRx = pCv.getContext('2d');
    const iD = pRx.createImageData(patternSize, patternSize);
    const d = iD.data;
    for(let i=0; i<d.length; i+=4){
        const v = Math.random() * 255;
        d[i]=v; d[i+1]=v; d[i+2]=v; d[i+3]=amount * 2.5; 
    }
    pRx.putImageData(iD,0,0);
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(pCv, 'repeat');
    ctx.fillRect(0,0,w,h);
    ctx.restore();
}

// --- 内部：UI 绘制 ---

function renderStatusBar(ctx, w) {
    const fontSize = w * 0.035;
    ctx.save();
    ctx.font = `600 ${fontSize}px "SF Pro Text", sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText("09:41", w * 0.08, w * 0.12); 
    
    const bx = w * 0.82;
    const qy = w * 0.09;
    const bw = w * 0.06;
    const bh = w * 0.025;
    
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, qy, bw, bh);
    ctx.fillRect(bx+2, qy+2, bw*0.6, bh-4);
    ctx.fillRect(bx+bw, qy+bh*0.3, 2, bh*0.4);
    ctx.restore();
}

function renderLockScreenTime(ctx, w, h) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `300 ${w*0.22}px sans-serif`;
    ctx.fillText("09:41", w/2, h*0.25);
    ctx.font = `500 ${w*0.05}px sans-serif`;
    ctx.fillText("Wednesday, January 18", w/2, h*0.29);
    
    const btnR = w * 0.12;
    const btnY = h - w*0.2;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(w*0.15 + btnR/2, btnY, btnR/2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(w*0.85 - btnR/2, btnY, btnR/2, 0, Math.PI*2); ctx.fill();
    ctx.restore();
}

function renderUIOverlay(ctx, w, h, mode, colors) {
    const headerH = w * 0.25;
    const grad = ctx.createLinearGradient(0,0,0,headerH);
    grad.addColorStop(0, 'rgba(0,0,0,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,headerH);
    
    renderStatusBar(ctx, w);
    
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = `600 ${w*0.05}px sans-serif`;
    
    if (mode === 'wechat') {
        ctx.fillText("朋友圈", w/2, headerH * 0.6);
        ctx.textAlign = 'right';
        ctx.font = `bold ${w*0.06}px sans-serif`;
        ctx.fillText("📷", w*0.92, headerH * 0.6);
    } else if (mode === 'rednote') {
        ctx.font = `600 ${w*0.045}px sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText("关注   发现   杭州", w/2, headerH * 0.6);
        ctx.fillStyle = '#fff';
        ctx.fillRect(w/2 - w*0.04, headerH*0.7, w*0.08, 2);
    }
    ctx.restore();
}