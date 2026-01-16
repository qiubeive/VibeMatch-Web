/**
 * Chaos Core V2 - "Quantum Grid"
 * 商业级功能：保留了基于网格的错位、RGB分离和秩序线
 */
export const ChaosCore = {
  render: (ctx, img, width, height, colors) => {
    // 1. 绘制底图 (防止漏光)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    
    if(!width || !height) return;

    // 2. 建立量子网格系统
    const cols = 6;
    const rows = 10;
    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dx = c * cellW;
        const dy = r * cellH;
        const randomSeed = Math.random();

        // 策略 A: 错位重构 (30% 概率)
        if (randomSeed > 0.65) {
          const offsetX = (Math.random() - 0.5) * cellW * 0.5;
          const offsetY = (Math.random() - 0.5) * cellH * 0.5;
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(dx, dy, cellW - 2, cellH - 2);
          ctx.clip();
          // 放大 1.2 倍以制造拼贴感
          ctx.drawImage(img, dx + offsetX, dy + offsetY, cellW, cellH, dx, dy, cellW*1.2, cellH*1.2);
          
          // 随机颜色遮罩
          if(randomSeed > 0.85) {
              const color = colors[Math.floor(Math.random() * Math.min(3, colors.length))];
              ctx.fillStyle = `rgba(${color.r},${color.g},${color.b}, 0.3)`;
              ctx.fillRect(dx, dy, cellW, cellH);
          }
          ctx.restore();
        } 
        // 策略 B: RGB 故障 (10% 概率)
        else if (randomSeed < 0.1) {
            drawRGBShift(ctx, img, dx, dy, cellW, cellH);
        }
        // 策略 C: 秩序线 (50% 概率)
        else {
            if (Math.random() > 0.5) {
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.lineWidth = 1;
                ctx.strokeRect(dx, dy, cellW, cellH);
            }
        }
      }
    }
    
    // 3. 装饰性数据横条
    const artifactCount = 5;
    for(let i=0; i<artifactCount; i++) {
        const y = Math.random() * height;
        const h = Math.random() * 5 + 1;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(0, y, width, h);
    }
  }
};

function drawRGBShift(ctx, img, x, y, w, h) {
    const offset = 5;
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(img, x - offset, y, w, h, x, y, w, h);
    ctx.fillStyle = 'rgba(255,0,0,0.5)';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(x,y,w,h);
    
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(img, x + offset, y, w, h, x, y, w, h);
    ctx.fillStyle = 'rgba(0,0,255,0.5)';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(x,y,w,h);
    
    ctx.restore();
}