/**
 * Color Science Module
 * 商业级配色引擎：负责 RGB/HSL 转换与色彩和声计算
 */

// 辅助：RGB 转 HSL
export const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; 
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s, l };
};

// 辅助：HSL 转 RGB
export const hslToRgb = (h, s, l) => {
    let r, g, b;
    if (s === 0) {
        r = g = b = l; 
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        h /= 360;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { 
        r: Math.round(r * 255), 
        g: Math.round(g * 255), 
        b: Math.round(b * 255) 
    };
};

/**
 * 核心：生成配色方案
 */
export const generatePalette = (baseColor, mode) => {
    const { h, s, l } = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
    
    // 商业级调整：自动修正过高饱和度和亮度，确保背景不刺眼
    const safeS = Math.min(s, 0.85); 
    const safeL = Math.max(0.15, Math.min(l, 0.75));

    let palette = [];

    switch (mode) {
        case 'contrast': // 撞色
            palette = [
                { h: h, s: safeS, l: safeL },
                { h: (h + 180) % 360, s: safeS, l: safeL }, 
                { h: (h + 180) % 360, s: Math.max(0, safeS - 0.2), l: safeL + 0.1 } 
            ];
            break;
        case 'analogous': // 邻近色
            palette = [
                { h: h, s: safeS, l: safeL },
                { h: (h + 30) % 360, s: safeS, l: safeL },
                { h: (h - 30 + 360) % 360, s: safeS, l: safeL }
            ];
            break;
        case 'cyber': // 赛博风 (高亮)
            palette = [
                { h: h, s: 0.9, l: 0.6 },
                { h: (h + 180) % 360, s: 1.0, l: 0.6 },
                { h: 300, s: 1.0, l: 0.5 } 
            ];
            break;
        case 'natural':
        default: // 同色系
            palette = [
                { h: h, s: safeS, l: safeL },
                { h: h, s: Math.max(0, safeS - 0.3), l: Math.min(1, safeL + 0.2) },
                { h: (h + 15) % 360, s: safeS, l: Math.max(0, safeL - 0.15) }
            ];
            break;
    }
    return palette.map(c => hslToRgb(c.h, c.s, c.l));
};