import { generatePalette } from './colorScience';

/**
 * Color Core V2 - 商业级色彩提取
 */
export const ColorCore = {
  // 1. 提取主色 (Feature Extraction)
  analyze: (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 150; 
    const h = 150 * (img.height/img.width);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    const data = ctx.getImageData(0,0,w,h).data;
    const colorMap = {};
    
    for(let i=0; i<data.length; i+=16) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        const l = (max+min)/2;
        const s = max === min ? 0 : (max-min)/(1-Math.abs(2*l/255 - 1));

        // 过滤掉纯黑白灰，只保留有情绪的颜色
        if(l < 20 || l > 240) continue; 
        if(s < 0.1) continue; 
        
        const step = 20;
        const key = `${Math.round(r/step)*step},${Math.round(g/step)*step},${Math.round(b/step)*step}`;
        
        if(!colorMap[key]) colorMap[key] = {r,g,b, count:0};
        colorMap[key].count++;
    }
    
    let sorted = Object.values(colorMap).sort((a,b)=>b.count - a.count);
    
    // 兜底：如果全是黑白，给一个深灰色
    if(sorted.length === 0) sorted = [{r:70,g:75,b:80}];
    
    return [sorted[0]]; 
  },
  
  // 2. 生成和谐色系
  generateHarmony: (baseColor, mode) => {
      // 修复：补全 g 和 b 的键名
      if(!baseColor) return [{r:0,g:0,b:0}, {r:50,g:50,b:50}, {r:100,g:100,b:100}];
      return generatePalette(baseColor, mode);
  }
};