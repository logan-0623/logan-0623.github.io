// LOGAN 开场动画控制（仅在首页显示）
function initEntranceAnimation() {
    // 只在首页显示开场动画
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' ||
                      window.location.href === 'http://127.0.0.1:4000/' ||
                      window.location.href === 'https://logan-0623.github.io/' ||
                      window.location.href.endsWith(':4000/') ||
                      window.location.href.endsWith('logan-0623.github.io/');
    
    if (!isHomePage) return;
    
    // 检查是否已经显示过开场动画（会话级别）
    if (sessionStorage.getItem('entranceShown')) return;
    
    // 创建开场动画覆盖层
    const overlay = document.createElement('div');
    overlay.className = 'entrance-overlay';
    overlay.id = 'entrance-overlay';
    
    overlay.innerHTML = `
        <div class="entrance-content">
            <svg class="logan-svg" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                <!-- L -->
                <path class="logan-letter" id="letter-l" d="M50 50 L50 150 L90 150" />
                
                <!-- O -->
                <circle class="logan-letter" id="letter-o1" cx="130" cy="100" r="40" />
                
                <!-- G -->
                <path class="logan-letter" id="letter-g" d="M200 140 A40 40 0 1 1 200 60 L240 60 L240 90 L220 90" />
                
                <!-- A -->
                <path class="logan-letter" id="letter-a" d="M280 150 L300 50 L320 150 M290 120 L310 120" />
                
                <!-- N -->
                <path class="logan-letter" id="letter-n" d="M360 150 L360 50 L400 150 L400 50" />
            </svg>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 等待GSAP加载完成
    function startAnimation() {
        if (typeof gsap !== 'undefined') {
            // GSAP 动画序列
            const shapes = "#letter-l, #letter-o1, #letter-g, #letter-a, #letter-n";
            const tl = gsap.timeline({
                onComplete: () => {
                    // 动画完成后隐藏覆盖层
                    setTimeout(() => {
                        overlay.classList.add('hidden');
                        setTimeout(() => {
                            if (overlay.parentNode) {
                                overlay.parentNode.removeChild(overlay);
                            }
                            sessionStorage.setItem('entranceShown', 'true');
                        }, 800);
                    }, 500);
                }
            });
            
            // 动画序列（基于你的示例）
            tl.fromTo(shapes, 
                {drawSVG: "100%"}, 
                {duration: 1, drawSVG: "50% 50%", stagger: 0.1}
            )
            .fromTo(shapes, 
                {drawSVG: "0%"}, 
                {duration: 0.1, drawSVG: "10%", immediateRender: false}, 
                "+=0.1"
            )
            .to(shapes, 
                {duration: 1, drawSVG: "90% 100%", stagger: 0.5}
            )
            .to(shapes, 
                {
                    duration: 1, 
                    rotation: 360, 
                    scale: 0.5, 
                    drawSVG: "100%", 
                    stroke: "white", 
                    strokeWidth: 6, 
                    transformOrigin: "50% 50%"
                }
            )
            .to(shapes, 
                {
                    duration: 0.5, 
                    stroke: "#78aaff", 
                    scale: 1.5, 
                    opacity: 0, 
                    stagger: 0.2
                }
            );
            
        } else {
            // 如果 GSAP 不可用，使用简单的 CSS 动画
            setTimeout(() => {
                overlay.classList.add('hidden');
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    sessionStorage.setItem('entranceShown', 'true');
                }, 800);
            }, 3000);
        }
    }
    
    // 延迟开始动画以确保页面加载完成
    setTimeout(startAnimation, 500);
}

// 初始化视差效果
let rellax;
if (typeof Rellax !== 'undefined') {
    rellax = new Rellax('.rellax', {
        speed: -7,
        center: false,
        wrapper: null,
        round: true,
        vertical: true,
        horizontal: false
    });
}

// 主题切换功能
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
    
    // 更新主题图标
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '🎴' : '🌙';
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldUseDark) {
        document.body.classList.add('dark-theme');
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
}

// 鼠标跟随效果（黑色小球）
function initCursorFollower() {
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);
    
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let isMoving = false;
    let moveTimeout;
    
    // 鼠标移动事件
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        follower.classList.add('active');
        isMoving = true;
        
        // 清除之前的超时
        clearTimeout(moveTimeout);
        
        // 设置新的超时，鼠标停止移动后继续跟随到鼠标位置
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
    });
    
    // 鼠标离开页面时隐藏
    document.addEventListener('mouseleave', function() {
        follower.classList.remove('active');
    });
    
    // 鼠标进入页面时显示
    document.addEventListener('mouseenter', function() {
        follower.classList.add('active');
    });
    
    // 平滑跟随动画
    function updateFollower() {
        // 计算跟随速度
        const speed = isMoving ? 0.15 : 0.08; // 停止移动时更慢地跟随到鼠标位置
        
        followerX += (mouseX - followerX) * speed;
        followerY += (mouseY - followerY) * speed;
        
        follower.style.transform = `translate3d(${followerX - 4}px, ${followerY - 4}px, 0)`;
        
        requestAnimationFrame(updateFollower);
    }
    
    updateFollower();
}

// 初始化平滑滚动
function initSmoothScroll() {
    if (typeof LocomotiveScroll !== 'undefined') {
        const scroll = new LocomotiveScroll({
            el: document.querySelector('[data-scroll-container]'),
            smooth: true,
            multiplier: 1,
            class: 'is-revealed'
        });

        // 更新视差效果当滚动时
        scroll.on('scroll', () => {
            if (rellax) rellax.refresh();
        });
        
        return scroll;
    }
    return null;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化开场动画
    initEntranceAnimation();
    
    // 初始化主题
    initTheme();
    
    // 初始化鼠标跟随效果
    initCursorFollower();
    
    // 初始化平滑滚动
    const scroll = initSmoothScroll();
    
    // 隐藏加载器
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 500);
});

// 性能优化：页面不可见时暂停动画
document.addEventListener('visibilitychange', function() {
    const follower = document.querySelector('.cursor-follower');
    if (document.hidden && follower) {
        follower.style.display = 'none';
    } else if (follower) {
        follower.style.display = 'block';
    }
});

// 窗口调整大小时刷新视差效果
window.addEventListener('resize', function() {
    if (rellax) {
        rellax.refresh();
    }
});