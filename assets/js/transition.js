// 页面切换链接处理 - 简化版，无转场动画
function initPageTransitions() {
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"]):not([href^="http"]):not([href^="mailto"]):not([href^="tel"]):not([data-no-transition])');
    
    links.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            
            if (!href || 
                href.startsWith("http") || 
                href.startsWith("#") || 
                href.startsWith("mailto") || 
                href.startsWith("tel") ||
                this.hasAttribute('data-no-transition')) {
                return;
            }
            
            // 直接跳转，无动画
            window.location.href = href;
        });
    });
}

// 初始化
document.addEventListener("DOMContentLoaded", function() {
    initPageTransitions();
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        initPageTransitions();
    }
});

// 保留这个函数以防其他地方调用
function triggerPageTransition(href) {
    if (!href) return;
    window.location.href = href;
}
