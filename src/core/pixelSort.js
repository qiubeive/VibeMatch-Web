/**
 * Glitch Core (Optimized)
 * 商业级功能：保留了降采样性能优化和阈值像素排序
 */
export const GlitchCore = {
  render: (ctx, img, w, h, colors) => {
    if(!w || !h) return;
    
    // 1. 绘制底图
    ctx.drawImage(img, 0, 0, w, h);

    // 2. 降采样 Buffer (提升性能的关键，不删减)
    const scale = 0.25; 
    const sw = Math.floor(w * scale);
    const sh = Math.floor(h * scale);
    
    const buffer = document.createElement('canvas');
    buffer.width = sw; buffer.height = sh;
    const bCtx = buffer.getContext('2d');
    bCtx.drawImage(img, 0, 0, sw, sh);
    
    const imageData = bCtx.getImageData(0, 0, sw, sh);
    const data = imageData.data;
    
    // 3. 像素排序 (Threshold Sorting)
    for (let x = 0; x < sw; x++) {
        if (Math.random() > 0.6) continue;

        let startY = 0;
        while (startY < sh) {
            let endY = startY;
            let brightness = 0;
            while(endY < sh) {
                const i = (endY * sw + x) * 4;
                brightness = (data[i] + data[i+1] + data[i+2]) / 3;
                if (brightness < 60 || brightness > 240) break; 
                endY++;
            }
            if (endY - startY > 5) {
                const segmentHeight = endY - startY;
                const topPixelIndex = (startY * sw + x) * 4;
                const r = data[topPixelIndex];
                const g = data[topPixelIndex+1];
                const b = data[topPixelIndex+2];
                
                for(let k=0; k<segmentHeight; k++) {
                     const targetIndex = ((startY + k) * sw + x) * 4;
                     // 渐变拖尾效果
                     data[targetIndex] = r;
                     data[targetIndex+1] = g;
                     data[targetIndex+2] = b;
                }
            }
            startY = endY + 1;
        }
    }
    bCtx.putImageData(imageData, 0, 0);

    // 4. 叠加回去
    ctx.save();
    ctx.globalCompositeOperation = 'lighten';
    ctx.globalAlpha = 0.8;
    ctx.imageSmoothingEnabled = false; // 保持赛博像素感
    ctx.drawImage(buffer, 0, 0, w, h);
    ctx.restore();
    
    // 5. 扫描线
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for(let i=0; i<h; i+=4) {
        ctx.fillRect(0, i, w, 1);
    }
  }
};