// 简化版 DrawSVG 插件实现
// 注意：这是一个基础实现，用于演示。生产环境建议使用官方 GSAP DrawSVG 插件

(function() {
    "use strict";

    // 简单的 DrawSVG 功能实现
    function drawSVGEffect(element, progress, startPercent = 0, endPercent = 100) {
        if (!element) return;
        
        const pathLength = element.getTotalLength ? element.getTotalLength() : 
                          (element.r ? 2 * Math.PI * element.r.baseVal.value : 0);
        
        if (pathLength === 0) return;
        
        const start = (startPercent / 100) * pathLength;
        const end = (endPercent / 100) * pathLength;
        const currentLength = start + (end - start) * progress;
        
        element.style.strokeDasharray = pathLength;
        element.style.strokeDashoffset = pathLength - currentLength;
    }

    // 解析 drawSVG 值
    function parseDrawSVG(value) {
        if (typeof value === 'string') {
            if (value.includes('%')) {
                const parts = value.split(' ');
                if (parts.length === 2) {
                    return {
                        start: parseFloat(parts[0]),
                        end: parseFloat(parts[1])
                    };
                } else {
                    const val = parseFloat(value);
                    return { start: 0, end: val };
                }
            }
        }
        return { start: 0, end: 100 };
    }

    // 注册到 GSAP（如果可用）
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin({
            name: "drawSVG",
            init(target, value) {
                if (!target.getTotalLength && !target.r) return false;
                
                this.target = target;
                this.pathLength = target.getTotalLength ? target.getTotalLength() : 
                                 (target.r ? 2 * Math.PI * target.r.baseVal.value : 0);
                
                const parsed = parseDrawSVG(value);
                this.startPercent = parsed.start;
                this.endPercent = parsed.end;
                
                // 初始化样式
                target.style.strokeDasharray = this.pathLength;
                target.style.strokeDashoffset = this.pathLength;
                
                return true;
            },
            render(progress, data) {
                const start = (data.startPercent / 100) * data.pathLength;
                const end = (data.endPercent / 100) * data.pathLength;
                const currentLength = start + (end - start) * progress;
                
                data.target.style.strokeDashoffset = data.pathLength - currentLength;
            }
        });
    }

    // 备用方案：如果 GSAP 不可用，提供独立的动画函数
    window.animateDrawSVG = function(element, from, to, duration = 1000, callback) {
        const startTime = performance.now();
        const fromParsed = parseDrawSVG(from);
        const toParsed = parseDrawSVG(to);
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 简单的 easeInOut
            const eased = progress < 0.5 ? 
                         2 * progress * progress : 
                         1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            const currentStart = fromParsed.start + (toParsed.start - fromParsed.start) * eased;
            const currentEnd = fromParsed.end + (toParsed.end - fromParsed.end) * eased;
            
            drawSVGEffect(element, 1, currentStart, currentEnd);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        }
        
        requestAnimationFrame(animate);
    };

    // 设置初始状态的辅助函数
    window.setDrawSVG = function(element, value) {
        const parsed = parseDrawSVG(value);
        drawSVGEffect(element, 1, parsed.start, parsed.end);
    };

})();