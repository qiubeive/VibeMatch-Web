/**
 * Text Core - 杂志级排版引擎
 * 职责：将简单的文字转化为设计感极强的视觉元素
 */
export const TextCore = {
    render: (ctx, w, h, text, color) => {
        if (!text) return;

        ctx.save();
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 简单分析文本长度，自动选择排版模式
        if (text.length < 10) {
            // 模式 A: 巨大标题风格 (Poster)
            renderPosterStyle(ctx, w, h, text, color);
        } else if (text.length > 30) {
            // 模式 B: 长文引用风格 (Quote)
            renderQuoteStyle(ctx, w, h, text, color);
        } else {
            // 模式 C: 极简杂志风格 (Magazine)
            renderMagazineStyle(ctx, w, h, text, color);
        }

        ctx.restore();
    }
};

// --- 排版微引擎 ---

function renderPosterStyle(ctx, w, h, text, color) {
    const fontSize = w * 0.15;
    ctx.font = `800 ${fontSize}px sans-serif`;
    
    // 阴影增加立体感
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    // 打散字符，增加间距
    const chars = text.split('');
    const spacing = fontSize * 0.8;
    const startX = w/2 - ((chars.length - 1) * spacing) / 2;
    
    chars.forEach((char, i) => {
        // 让每个字有轻微的高低错落，显得不呆板
        const offset = Math.sin(i * 1.5) * (h * 0.02); 
        ctx.fillText(char, startX + i * spacing, h * 0.4 + offset);
    });

    // 底部装饰线
    ctx.shadowColor = 'transparent';
    ctx.fillRect(w * 0.4, h * 0.55, w * 0.2, 4);
    
    ctx.font = `400 ${w*0.03}px sans-serif`;
    ctx.fillText("VIBE MATCH · DAILY", w/2, h * 0.6);
}

function renderMagazineStyle(ctx, w, h, text, color) {
    // 竖线装饰
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
    ctx.beginPath();
    ctx.moveTo(w/2, h * 0.35);
    ctx.lineTo(w/2, h * 0.42);
    ctx.stroke();

    const fontSize = w * 0.06;
    ctx.font = `600 ${fontSize}px serif`; // 衬线体更显高级
    
    // 自动换行
    const maxWidth = w * 0.8;
    const words = text.split(''); // 中文按字切分
    let line = '';
    let y = h * 0.5;
    const lineHeight = fontSize * 1.5;

    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, w/2, y);
            line = words[n];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, w/2, y);
    
    // 边角装饰
    const cornerSize = w * 0.04;
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.strokeRect(w*0.1, h*0.1, cornerSize, cornerSize); // 左上
    ctx.strokeRect(w*0.9 - cornerSize, h*0.9 - cornerSize, cornerSize, cornerSize); // 右下
}

function renderQuoteStyle(ctx, w, h, text, color) {
    // 双引号背景
    ctx.font = `900 ${w*0.4}px serif`;
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.05)`;
    ctx.fillText("”", w/2, h*0.45);

    // 正文
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
    const fontSize = w * 0.045;
    ctx.font = `400 ${fontSize}px sans-serif`;
    
    const maxWidth = w * 0.7;
    let words = text.split('');
    let line = '';
    let y = h * 0.45;
    const lineHeight = fontSize * 1.6;

    // 简单的换行逻辑
    let lines = [];
    for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n];
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    // 垂直居中绘制
    const blockHeight = lines.length * lineHeight;
    let startY = h/2 - blockHeight/2;
    
    lines.forEach((l, i) => {
        ctx.fillText(l, w/2, startY + i*lineHeight);
    });
    
    // 署名
    ctx.font = `italic ${w*0.03}px sans-serif`;
    ctx.fillText("— From your vibe", w/2, startY + lines.length*lineHeight + 20);
}