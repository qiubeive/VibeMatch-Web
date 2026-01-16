/**
 * Text Core - "Editorial Layout"
 * 商业级功能：杂志感排版、自动日期
 */
export const TextCore = {
  render: (ctx, width, height, text, accentColor) => {
    if (!text) return;

    const padding = width * 0.08; 
    const bottomArea = height * 0.85; 
    
    ctx.save();
    
    const mainColor = `rgba(255, 255, 255, 0.95)`;
    const subColor = `rgba(255, 255, 255, 0.6)`;
    
    // 装饰线
    ctx.fillStyle = `rgb(${accentColor.r},${accentColor.g},${accentColor.b})`;
    ctx.fillRect(padding, bottomArea - 40, 40, 4); 

    // 自动日期
    const date = new Date();
    const dateStr = `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2,'0')}.${date.getDate().toString().padStart(2,'0')}`;
    
    ctx.font = `bold ${width * 0.04}px 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = subColor;
    ctx.textAlign = 'left';
    ctx.fillText(dateStr.toUpperCase(), padding, bottomArea - 60);

    // 主文案
    const fontSize = width * 0.06;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = mainColor;
    
    // 自动换行
    const maxTextWidth = width - (padding * 2);
    const words = text.split(""); 
    let currentLine = words[0];
    let offsetY = 0;

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let w = ctx.measureText(currentLine + word).width;
        if (w < maxTextWidth) {
            currentLine += word;
        } else {
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(currentLine, padding, bottomArea + offsetY);
            currentLine = word;
            offsetY += fontSize * 1.5;
        }
    }
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText(currentLine, padding, bottomArea + offsetY);

    // 品牌水印
    ctx.font = `italic ${width * 0.03}px serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'right';
    ctx.fillText("VibeMatch Profile", width - padding, height - padding);

    ctx.restore();
  }
};