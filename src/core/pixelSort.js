/**
 * src/core/pixelSort.js
 * 对应引擎: Cyber-Rot (Glitch Art)
 */
export const GlitchCore = {
    render: function(ctx, img, w, h, colors) {
        this.drawImageCover(ctx, img, w, h);
        
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;
        const offset = 8; 
        
        const copy = new Uint8ClampedArray(data);
        
        for(let i=0; i<data.length; i+=4) {
            const rIdx = i - offset*4;
            const bIdx = i + offset*4;
            if(rIdx >= 0) data[i] = copy[rIdx]; 
            if(bIdx < data.length) data[i+2] = copy[bIdx+2]; 
        }
        ctx.putImageData(imageData, 0, 0);

        const sliceCount = 12;
        for(let i=0; i<sliceCount; i++) {
            const y = Math.random() * h;
            const H = Math.random() * 30 + 5;
            const xOffset = (Math.random() - 0.5) * 40;
            ctx.drawImage(ctx.canvas, 0, y, w, H, xOffset, y, w, H);
        }
        
        ctx.save();
        ctx.fillStyle = `rgb(${colors[0].r},${colors[0].g},${colors[0].b})`; // 注意：这里适配了新的颜色对象结构
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    },

    drawImageCover: function(ctx, img, w, h) {
        const scale = Math.max(w/img.naturalWidth, h/img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (w-dw)/2, (h-dh)/2, dw, dh);
    }
};