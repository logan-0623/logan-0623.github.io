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
    follower.id = 'main-cursor-follower';
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
        
        clearTimeout(moveTimeout);
        
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
        const speed = isMoving ? 0.15 : 0.08;
        
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

// 初始化返回顶端按钮
function initBackToTop() {
    // 创建返回顶端按钮
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.setAttribute('aria-label', '返回顶端');
    document.body.appendChild(backToTopBtn);
    
    let locomotiveScroll = null;
    
    // 滚动监听函数
    function toggleBackToTop() {
        let scrollY = 0;
        
        // 检查是否使用了 Locomotive Scroll
        if (locomotiveScroll && locomotiveScroll.scroll) {
            scrollY = locomotiveScroll.scroll.instance.scroll.y || 0;
        } else {
            scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        }
        
        if (scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    // 点击事件
    backToTopBtn.addEventListener('click', function() {
        if (locomotiveScroll && locomotiveScroll.scrollTo) {
            locomotiveScroll.scrollTo(0, {
                duration: 1000,
                easing: [0.25, 0.0, 0.35, 1.0]
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
    
    // 返回 locomotive scroll 实例的引用
    return {
        setLocomotiveScroll: function(scroll) {
            locomotiveScroll = scroll;
            
            // 监听 Locomotive Scroll 的滚动事件
            if (scroll && scroll.on) {
                scroll.on('scroll', toggleBackToTop);
            }
        },
        toggleBackToTop: toggleBackToTop
    };
}

// 初始化代码块复制功能
function initCodeCopy() {
    // 为所有代码块添加复制功能
    const codeBlocks = document.querySelectorAll('pre');

    codeBlocks.forEach((pre, index) => {
        // 确保pre元素有相对定位
        pre.style.position = 'relative';

        // 创建复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.setAttribute('aria-label', '复制代码');
        copyBtn.setAttribute('data-index', index);

        // 添加点击事件
        copyBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const codeElement = pre.querySelector('code');
            const text = codeElement ? codeElement.textContent : pre.textContent;

            try {
                await navigator.clipboard.writeText(text);

                // 显示复制成功反馈
                copyBtn.innerHTML = '✅';
                copyBtn.style.background = '#22c55e';
                copyBtn.style.color = 'white';

                setTimeout(() => {
                    copyBtn.innerHTML = '📋';
                    copyBtn.style.background = '';
                    copyBtn.style.color = '';
                }, 2000);

            } catch (err) {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // 显示复制成功反馈
                copyBtn.innerHTML = '✅';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋';
                }, 2000);
            }
        });

        // 将按钮直接添加到代码块
        pre.appendChild(copyBtn);

        // 悬停显示/隐藏
        pre.addEventListener('mouseenter', () => {
            copyBtn.style.opacity = '1';
        });

        pre.addEventListener('mouseleave', () => {
            copyBtn.style.opacity = '0';
        });
    });
}

// 修复锚点跳转时的动画渲染问题
function initAnchorScrollFix() {
    // 处理页面加载时的锚点
    if (window.location.hash) {
        // 先滚动到顶部
        window.scrollTo(0, 0);

        // 等待动画完成后再滚动到锚点
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 700); // 比 fadeInUp 动画（0.6s）稍长一点
    }

    // 处理点击锚点链接
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');

        // 检查是否是锚点链接
        if (link && link.hash && link.pathname === window.location.pathname) {
            const targetId = link.hash.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                e.preventDefault();

                // 如果是跨页面跳转（从 index.md 到 research.md#anchor）
                if (link.hostname === window.location.hostname && link.pathname !== window.location.pathname) {
                    // 导航到新页面，让上面的加载时处理逻辑处理
                    window.location.href = link.href;
                } else {
                    // 同页面锚点跳转，直接平滑滚动
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // 更新 URL
                    history.pushState(null, null, link.hash);
                }
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题
    initTheme();

    // 初始化鼠标跟随效果
    initCursorFollower();

    // 初始化平滑滚动
    const scroll = initSmoothScroll();

    // 初始化返回顶端按钮
    const backToTop = initBackToTop();

    // 将 locomotive scroll 实例传递给返回顶端按钮
    if (scroll) {
        backToTop.setLocomotiveScroll(scroll);
    } else {
        // 如果没有 locomotive scroll，使用普通的滚动监听
        window.addEventListener('scroll', backToTop.toggleBackToTop);
        backToTop.toggleBackToTop(); // 初始检查
    }

    // 初始化代码复制功能
    initCodeCopy();

    // 初始化锚点滚动修复（修复动画渲染问题）
    initAnchorScrollFix();

    // 隐藏加载器
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 500);
});

// 窗口大小改变时刷新视差效果
window.addEventListener('resize', function() {
    if (rellax) {
        rellax.refresh();
    }
});
