/**
 * Color Core V2
 * 商业级功能：保留了饱和度加权算法
 */
export const ColorCore = {
  analyze: (img) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 100; 
    const h = 100 * (img.height/img.width);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    
    const data = ctx.getImageData(0,0,w,h).data;
    const colorMap = {};
    
    for(let i=0; i<data.length; i+=16) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        const l = (max+min)/2;
        if(l < 20 || l > 245) continue; 
        
        const key = `${Math.round(r/20)*20},${Math.round(g/20)*20},${Math.round(b/20)*20}`;
        const d = max - min;
        const s = l > 127 ? d / (510 - max - min) : d / (max + min);
        // 饱和度越高，权重越大
        const weight = 1 + (s * 3); 
        
        if(!colorMap[key]) colorMap[key] = {r,g,b, score:0};
        colorMap[key].score += weight;
    }
    
    let sorted = Object.values(colorMap).sort((a,b)=>b.score - a.score);
    if(sorted.length === 0) sorted = [{r:50,g:50,b:50}, {r:200,g:200,b:200}, {r:0,g:0,b:0}];
    while(sorted.length < 3) sorted.push(sorted[0]);
    
    return sorted.slice(0,3);
  },
  
  // 生成配色方案 (为了防止报错，即使简单也必须存在)
  generateHarmony: (base, mode) => {
    if(!base) return [{r:0,g:0,b:0}];
    // 这里如果以后想做复杂的色彩理论计算，可以在这里扩展
    // 目前保持简单返回，确保不崩
    return [base, base, base]; 
  }
};