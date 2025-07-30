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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
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
    const follower = document.querySelector('#main-cursor-follower');
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
