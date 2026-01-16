/**
 * src/core/puzzle.js
 * 对应引擎: Chaos (Orderly Chaos / 拼图)
 */
export const ChaosCore = {
    render: function(ctx, img, w, h, colors) {
        // 适配颜色对象结构 {r,g,b} -> rgb string
        const cColor = (c) => `rgb(${c.r},${c.g},${c.b})`;

        ctx.fillStyle = cColor(colors[2]);
        ctx.fillRect(0, 0, w, h);
        
        const cols = 3; 
        const rows = 5;
        const cw = w/cols; 
        const ch = h/rows;
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const dx = c*cw; 
                const dy = r*ch;
                
                let sx, sy;
                if(Math.random() > 0.7) {
                    sx = Math.random() * img.naturalWidth;
                    sy = Math.random() * img.naturalHeight;
                } else {
                    const scaleX = img.naturalWidth / w;
                    const scaleY = img.naturalHeight / h;
                    sx = dx * scaleX;
                    sy = dy * scaleY;
                }
                
                const sW = img.naturalWidth / cols;
                const sH = img.naturalHeight / rows;

                ctx.save();
                ctx.translate(dx+2, dy+2);
                ctx.drawImage(img, sx, sy, sW, sH, 0, 0, cw-4, ch-4);
                
                if(Math.random() > 0.8) {
                    ctx.fillStyle = cColor(colors[0]);
                    ctx.globalCompositeOperation = 'color';
                    ctx.fillRect(0, 0, cw-4, ch-4);
                }
                ctx.restore();
            }
        }
    }
};