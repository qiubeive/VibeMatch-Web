/**
 * src/core/colorExtract.js
 * 核心色彩分析模块
 */
export const ColorCore = {
    // 提取图片主色调 (Vibrant 优先策略)
    analyze: function(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128; canvas.height = 128; // 采样分辨率
        ctx.drawImage(img, 0, 0, 128, 128);
        
        const imageData = ctx.getImageData(0, 0, 128, 128).data;
        const colorMap = {};
        
        // 采样遍历
        for(let i=0; i<imageData.length; i+=16) { 
            const r = imageData[i];
            const g = imageData[i+1];
            const b = imageData[i+2];

            // 1. 转换 HSL 进行过滤
            const hsl = this.rgbToHsl(r, g, b);
            
            // 剔除过黑/过白/过灰的颜色，保留“Vibe”
            if (hsl.l < 0.1 || hsl.l > 0.9) continue;
            if (hsl.s < 0.15) continue;

            // 量化色彩
            const q = 32;
            const rQ = Math.floor(r/q)*q;
            const gQ = Math.floor(g/q)*q;
            const bQ = Math.floor(b/q)*q;
            const key = `${rQ},${gQ},${bQ}`;
            
            const weight = 1 + hsl.s;
            colorMap[key] = (colorMap[key] || 0) + weight;
        }

        let sorted = Object.entries(colorMap).sort((a,b) => b[1]-a[1]);
        
        // Fallback
        if (sorted.length < 3) {
             const fallbackMap = {};
             for(let i=0; i<imageData.length; i+=32) {
                const r = Math.floor(imageData[i]/32)*32;
                const g = Math.floor(imageData[i+1]/32)*32;
                const b = Math.floor(imageData[i+2]/32)*32;
                const key = `${r},${g},${b}`;
                fallbackMap[key] = (fallbackMap[key] || 0) + 1;
             }
             sorted = Object.entries(fallbackMap).sort((a,b) => b[1]-a[1]);
        }

        const palette = sorted.slice(0, 5).map(entry => {
            const [r,g,b] = entry[0].split(',').map(Number);
            return {r, g, b};
        });

        while(palette.length < 3) palette.push({r:50, g:50, b:50});
        
        return palette;
    },

    rgbToHsl: function(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; 
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    }
};