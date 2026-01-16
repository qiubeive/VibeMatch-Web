/**
 * src/core/textGen.js
 * 负责文案渲染
 */
export const TextCore = {
    render: function(ctx, w, h, text, accentColorObj) {
        ctx.save();
        ctx.translate(w/2, h/2);
        
        ctx.font = '700 24px "Noto Serif SC", serif';
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 15;
        
        const lines = text.length > 12 ? 
            [text.slice(0, Math.ceil(text.length/2)), text.slice(Math.ceil(text.length/2))] 
            : [text];
        
        lines.forEach((line, i) => {
            const yOffset = (i - (lines.length-1)/2) * 35;
            ctx.fillText(line, 0, yOffset);
        });
        
        const totalH = lines.length * 35;
        // 适配传入的颜色对象
        ctx.fillStyle = `rgb(${accentColorObj.r},${accentColorObj.g},${accentColorObj.b})`;
        ctx.fillRect(-20, totalH/2 + 20, 40, 3);
        
        ctx.restore();
    }
};