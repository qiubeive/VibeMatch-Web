import { GlitchCore } from './pixelSort';
import { ChaosCore } from './puzzle';
import { TextCore } from './textGen';
import { ColorCore } from './colorExtract';
import { initWasm, processImageWasm } from './wasmDriver'; // 导入 C 语言驱动器

// 初始化 Wasm 模块 (异步加载，静默失败)
initWasm().catch(err => console.log("Wasm init pending/failed, utilizing JS fallback."));

/**
 * RenderPipeline - 核心渲染管线 (V4 最终混合架构版)
 * 包含：Wasm/JS 混合调度、所有高级引擎实现、UI 绘制
 */
export const RenderPipeline = {
  render: (ctx, { image, width, height, engine, colors, params, uiMode }) => {
    // 0. 基础清理
    ctx.clearRect(0, 0, width, height);
    if (!image) return;

    // 1. 颜色计算 (Color Science)
    const baseColor = (colors && colors.length > 0) ? colors[0] : {r:128,g:128,b:128};
    // 生成完整调色盘
    const palette = ColorCore.generateHarmony ? 
                    ColorCore.generateHarmony(baseColor, params.colorMode || 'natural') : 
                    [baseColor, baseColor, baseColor];

    // --- Layer 1: 背景引擎渲染 (核心层) ---
    ctx.save();
    try {
      switch (engine) {
        case 'glitch':
          // === 混合模式核心逻辑 ===
          // 优先尝试运行 C 语言内核 (Wasm)
          const wasmSuccess = runWasmGlitch(ctx, image, width, height, params.noise);
          if (!wasmSuccess) {
              // 降级策略：如果 C 内核没准备好，使用 JS 版本
              // console.log("Fallback to JS Glitch Core");
              GlitchCore.render(ctx, image, width, height, palette);
          }
          break;
          
        case 'chaos':
          ChaosCore.render(ctx, image, width, height, palette);
          break;
          
        case 'pixel':
          renderPixelEngine(ctx, image, width, height, palette);
          break;
          
        case 'fluid':
        default:
          renderFluidEngine(ctx, width, height, palette, params);
          break;
      }
    } catch (e) {
      console.error("Engine Render Failed:", e);
      // 最后的兜底：只画个背景色防止白屏
      ctx.fillStyle = '#111';
      ctx.fillRect(0,0,width,height);
    }
    ctx.restore();

    // --- Layer 2: 全局滤镜 (Post-Processing) ---
    ctx.save();
    // 2.1 智能压暗
    if (params.darken > 0) {
      ctx.fillStyle = `rgba(0,0,0, ${params.darken / 100})`;
      ctx.fillRect(0, 0, width, height);
    }
    // 2.2 胶片噪点
    if (params.noise > 0) {
      renderNoise(ctx, width, height, params.noise);
    }
    ctx.restore();

    // --- Layer 3: 文案层 ---
    if (params.text) {
      // 智能反色：背景亮则字黑，背景暗则字白
      const isLight = (palette[0].r*0.299 + palette[0].g*0.587 + palette[0].b*0.114) > 186;
      const accentColor = isLight ? {r:0,g:0,b:0} : {r:255,g:255,b:255};
      TextCore.render(ctx, width, height, params.text, accentColor);
    }

    // --- Layer 4: UI 覆盖层 ---
    if (uiMode !== 'clean') {
        renderUIOverlay(ctx, width, height, uiMode);
    } else {
        renderStatusBar(ctx, width);
        renderLockScreenTime(ctx, width, height);
    }
  }
};

// --- 辅助函数：Wasm 调用封装 ---

function runWasmGlitch(ctx, img, w, h, intensity) {
    // 1. 准备离屏数据
    const tempC = document.createElement('canvas');
    tempC.width = w; tempC.height = h;
    const tCtx = tempC.getContext('2d');
    tCtx.drawImage(img, 0, 0, w, h);
    
    try {
        const imageData = tCtx.getImageData(0, 0, w, h);
        
        // 2. 调用 C 语言内核 (mode 1 = Pixel Sort)
        // processImageWasm 会抛出错误如果 Wasm 没加载，正好被 catch 捕获从而触发降级
        const processedData = processImageWasm(imageData, 1, intensity);
        
        // 3. 绘回主画布
        // 注意：ImageData 不能直接 drawImage，需要 put 回去
        tCtx.putImageData(processedData, 0, 0);
        
        // 保持像素风格的锐利度
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempC, 0, 0);
        ctx.imageSmoothingEnabled = true;
        
        return true; // 成功
    } catch (e) {
        // 如果这里报错（比如 processImageWasm 抛出 "Wasm core not loaded"），
        // 返回 false 让主逻辑去调用 JS 版本
        return false; 
    }
}

// --- 引擎实现：Fluid (流体) ---
function renderFluidEngine(ctx, w, h, palette, params) {
  const c1 = palette[0];
  const c2 = palette[1] || c1;
  const c3 = palette[2] || c2;

  // 纯色打底
  ctx.fillStyle = `rgb(${c1.r}, ${c1.g}, ${c1.b})`;
  ctx.fillRect(0, 0, w, h);

  // 绘制光斑
  const drawOrb = (x, y, r, color) => {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(${color.r},${color.g},${color.b}, 1)`);
      grd.addColorStop(1, `rgba(${color.r},${color.g},${color.b}, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
  };

  ctx.globalCompositeOperation = 'hard-light'; 
  drawOrb(w * 0.2, h * 0.2, w * 0.8, c2);
  
  ctx.globalCompositeOperation = 'screen'; 
  drawOrb(w * 0.8, h * 0.8, w * 0.9, c3);
  
  ctx.globalCompositeOperation = 'overlay';
  drawOrb(w * 0.5, h * 0.5, w * 0.5, c1);
  
  ctx.globalCompositeOperation = 'source-over';
}

// --- 引擎实现：Pixel (LED 点阵) ---
function renderPixelEngine(ctx, img, w, h, palette) {
    const ratio = w / 1000;
    const size = Math.floor(16 * ratio); // 灯珠大小
    const gap = Math.max(1, Math.floor(2 * ratio)); // 间隙
    
    // 离屏降采样
    const cols = Math.ceil(w / (size + gap));
    const rows = Math.ceil(h / (size + gap));
    
    const tempC = document.createElement('canvas');
    tempC.width = cols; tempC.height = rows;
    const tempCtx = tempC.getContext('2d');
    tempCtx.drawImage(img, 0, 0, cols, rows);
    const data = tempCtx.getImageData(0,0,cols,rows).data;

    // 黑色底板
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w, h);

    // 绘制 RGB 灯珠
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const i = (r * cols + c) * 4;
            const x = c * (size + gap);
            const y = r * (size + gap);
            
            ctx.fillStyle = `rgb(${data[i]},${data[i+1]},${data[i+2]})`;
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    // 扫描线
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for(let i=0; i<h; i+=4) ctx.fillRect(0, i, w, 2);
}

// --- 通用滤镜：噪点 ---
function renderNoise(ctx, w, h, amount) {
    const patternSize = 256; 
    const pCv = document.createElement('canvas');
    pCv.width = patternSize; pCv.height = patternSize;
    const pRx = pCv.getContext('2d');
    const iD = pRx.createImageData(patternSize, patternSize);
    const d = iD.data;
    for(let i=0; i<d.length; i+=4){
        const v = Math.random() * 255;
        d[i]=v; d[i+1]=v; d[i+2]=v; d[i+3]=amount * 3; 
    }
    pRx.putImageData(iD,0,0);
    
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(pCv, 'repeat');
    ctx.fillRect(0,0,w,h);
    ctx.restore();
}

// --- UI 绘制组件 ---

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

function renderUIOverlay(ctx, w, h, mode) {
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
    
    if (mode === 'wechat') {
        ctx.font = `600 ${w*0.05}px sans-serif`;
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