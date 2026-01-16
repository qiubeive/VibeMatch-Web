/**
 * src/core/colorExtract.js
 * 核心色彩分析与配色生成模块
 */
export const ColorCore = {
    // 1. 提取主色调 (保持原逻辑，但在最后补充了 HSL 数据)
    analyze: function(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 128; canvas.height = 128;
        ctx.drawImage(img, 0, 0, 128, 128);
        
        const imageData = ctx.getImageData(0, 0, 128, 128).data;
        const colorMap = {};
        
        for(let i=0; i<imageData.length; i+=16) { 
            const r = imageData[i], g = imageData[i+1], b = imageData[i+2];
            const hsl = this.rgbToHsl(r, g, b);
            
            // 过滤过暗/过亮/过灰
            if (hsl.l < 0.1 || hsl.l > 0.95) continue;
            if (hsl.s < 0.1) continue;

            const key = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
            const weight = 1 + hsl.s; // 饱和度越高权重越大
            colorMap[key] = (colorMap[key] || 0) + weight;
        }

        const sorted = Object.entries(colorMap).sort((a,b) => b[1]-a[1]);
        
        // 兜底策略
        let palette = sorted.slice(0, 3).map(entry => {
            const [r,g,b] = entry[0].split(',').map(Number);
            return {r, g, b, ...this.rgbToHsl(r,g,b)};
        });

        while(palette.length < 3) palette.push({r:50, g:50, b:50, h:0, s:0, l:0.2});
        
        return palette;
    },

    // 2. 生成配色方案 (需求4: 互补色/邻近色)
    generateHarmony: function(baseColor, mode = 'natural') {
        const { h, s, l } = baseColor;
        let colors = [];

        // 辅助：HSL转RGB
        const toRgb = (h,s,l) => this.hslToRgb(h, s, l);

        if (mode === 'contrast') {
            // 互补色 (Contrast): 对面 180度的颜色，制造强烈视觉冲击
            colors = [
                toRgb(h, s, l), // 主色
                toRgb((h + 0.5) % 1, s, Math.max(0.2, l - 0.2)), // 互补色(压暗)
                toRgb((h + 0.55) % 1, s * 0.8, Math.min(0.9, l + 0.3)) // 互补高光
            ];
        } else if (mode === 'analogous') {
            // 邻近色 (Harmony): 左右 30度 (0.08) 的颜色，制造和谐感
            colors = [
                toRgb((h - 0.08 + 1) % 1, s, l), 
                toRgb(h, s, l), 
                toRgb((h + 0.08) % 1, s, l)
            ];
        } else {
            // 自然模式 (Natural): 保持原图提取的颜色
            return null; 
        }
        return colors;
    },

    // 工具函数
    rgbToHsl: function(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) h = s = 0; 
        else {
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
    },

    hslToRgb: function(h, s, l) {
        var r, g, b;
        if (s == 0) r = g = b = l; 
        else {
            var hue2rgb = function(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    }
};