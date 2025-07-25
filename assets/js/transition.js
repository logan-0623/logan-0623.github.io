// 页面过渡刷子动画
function playBrushTransition(onComplete) {
    const brush = document.getElementById('page-brush');
    if (!brush) {
        console.error('找不到#page-brush元素');
        if (onComplete) onComplete();
        return;
    }
    
    // 显示刷子
    brush.style.opacity = "1";
    brush.style.display = "block";
    
    // 使用GSAP动画（如果可用）
    if (typeof gsap !== 'undefined') {
        gsap.set(brush, { x: 0, y: 0 });
        gsap.fromTo(brush, 
            { x: 0, y: 0 },
            {
                x: "-120vw",
                y: "120vh",
                duration: 1.1,
                ease: "power2.inOut",
                onComplete: () => {
                    // 动画完成后淡出
                    gsap.to(brush, {
                        opacity: 0,
                        duration: 0.1,
                        onComplete: () => {
                            brush.style.display = "block";
                            if (onComplete) onComplete();
                        }
                    });
                }
            }
        );
    } else {
        // GSAP不可用时的CSS动画后备方案
        console.warn('GSAP不可用，使用CSS动画作为后备');
        brush.style.transition = 'transform 1.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s';
        brush.style.transform = 'rotate(45deg) translate(-120vw, 120vh)';
        
        setTimeout(() => {
            brush.style.opacity = "0";
            setTimeout(() => {
                // 重置变换以便下次使用
                brush.style.transform = 'rotate(45deg)';
                brush.style.transition = '';
                if (onComplete) onComplete();
            }, 100);
        }, 1100);
    }
}

// 页面切换链接处理
function initPageTransitions() {
    // 选择需要应用过渡效果的链接
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([data-no-transition])');
    
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            
            // 跳过不需要过渡的链接
            if (!href || 
                href.startsWith("http") || 
                href.startsWith("#") || 
                href.startsWith("mailto") || 
                href.startsWith("tel") ||
                this.hasAttribute('data-no-transition')) {
                return; // 让这些链接正常工作
            }
            
            // 阻止默认跳转
            e.preventDefault();
            
            // 播放过渡动画
            playBrushTransition(() => {
                // 短暂延迟后跳转
                setTimeout(() => {
                    window.location.href = href;
                }, 50);
            });
        });
    });
}

// 页面加载完成后初始化过渡效果
document.addEventListener("DOMContentLoaded", function() {
    initPageTransitions();
});

// 浏览器前进/后退时的处理
window.addEventListener('pageshow', function(event) {
    // 如果是从缓存加载的页面，重新初始化
    if (event.persisted) {
        initPageTransitions();
    }
});

// 为特定元素添加过渡效果的辅助函数
function addTransitionToElement(element, href) {
    if (!element || !href) return;
    
    element.addEventListener('click', function(e) {
        e.preventDefault();
        playBrushTransition(() => {
            setTimeout(() => {
                window.location.href = href;
            }, 50);
        });
    });
}

// 手动触发页面过渡的函数（供外部调用）
function triggerPageTransition(href) {
    if (!href) return;
    
    playBrushTransition(() => {
        setTimeout(() => {
            window.location.href = href;
        }, 50);
    });
}