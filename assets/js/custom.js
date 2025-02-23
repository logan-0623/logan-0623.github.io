// 鼠标拖尾效果
const trails = [];
const numTrails = 10;

for (let i = 0; i < numTrails; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);
    trails.push({
        element: trail,
        x: 0,
        y: 0,
        alpha: 1 - (i / numTrails)
    });
}

document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setTimeout(() => {
        trails.forEach((trail, index) => {
            trail.x = mouseX;
            trail.y = mouseY;
            trail.element.style.left = trail.x + 'px';
            trail.element.style.top = trail.y + 'px';
            trail.element.style.opacity = trail.alpha;
        });
    }, index * 30);
});

// 点击碎屑效果
document.addEventListener('click', function(e) {
    const numParticles = 10;
    
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机生成运动方向和旋转角度
        const angle = (Math.PI * 2 * i) / numParticles;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        const rot = Math.random() * 360;
        
        particle.style.left = e.pageX + 'px';
        particle.style.top = e.pageY + 'px';
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        particle.style.setProperty('--rot', `${rot}deg`);
        
        document.body.appendChild(particle);
        
        // 动画结束后移除粒子
        setTimeout(() => {
            particle.remove();
        }, 600);
    }
});

// 主题切换功能
function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// 页面加载时检查主题
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// 添加背景动画
function createBackgroundAnimation() {
    const container = document.createElement('div');
    container.className = 'background-animation';
    document.body.appendChild(container);

    // 沙漠风沙效果
    function createSandParticles() {
        container.innerHTML = '';
        const particleCount = 100;
        
        // 创建沙粒
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'sand-particle';
            resetSandParticle(particle);
            container.appendChild(particle);
            animateSandParticle(particle);
        }

        // 创建风滚草
        const tumbleweeds = 3;
        for (let i = 0; i < tumbleweeds; i++) {
            const tumbleweed = document.createElement('div');
            tumbleweed.className = 'tumbleweed';
            resetTumbleweed(tumbleweed);
            container.appendChild(tumbleweed);
            animateTumbleweed(tumbleweed);
        }
    }

    function resetSandParticle(particle) {
        particle.style.left = `-10px`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.transform = 'scale(1)';
        particle.style.opacity = 0.6 + Math.random() * 0.4;
    }

    function animateSandParticle(particle) {
        const duration = 3000 + Math.random() * 2000;
        // 使用像素单位的移动
        const verticalMovement = Math.floor((Math.random() - 0.5) * 100) * 4;
        
        particle.style.transition = `transform ${duration}ms steps(20)`;
        particle.style.transform = `translate(${window.innerWidth}px, ${verticalMovement}px)`;

        setTimeout(() => {
            resetSandParticle(particle);
            requestAnimationFrame(() => animateSandParticle(particle));
        }, duration);
    }

    function resetTumbleweed(tumbleweed) {
        tumbleweed.style.left = `-50px`;
        tumbleweed.style.top = `${Math.random() * 70 + 20}vh`;
        tumbleweed.style.opacity = '0.6';
    }

    function animateTumbleweed(tumbleweed) {
        const duration = 8000 + Math.random() * 4000;
        const bounceHeight = Math.random() * 100 + 50;
        const bounceCount = 3;

        tumbleweed.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        let keyframes = '';
        for (let i = 0; i <= bounceCount; i++) {
            const progress = (i / bounceCount) * 100;
            const y = Math.sin(i * Math.PI) * bounceHeight;
            keyframes += `${progress}% { transform: translate(${(window.innerWidth + 100) * (i / bounceCount)}px, ${-y}px) rotate(${360 * i}deg); }`;
        }

        tumbleweed.style.animation = `tumble ${duration}ms linear`;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes tumble {
                ${keyframes}
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            resetTumbleweed(tumbleweed);
            setTimeout(() => {
                style.remove();
                requestAnimationFrame(() => animateTumbleweed(tumbleweed));
            }, 100);
        }, duration);
    }

    // 星空效果
    function createStars() {
        container.innerHTML = '';
        const starCount = window.innerWidth <= 800 ? 30 : 50; // 移动端减少星星数量
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // 随机大小
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // 随机位置
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            
            // 随机动画延迟
            star.style.animationDelay = `${Math.random() * 3}s`;
            
            container.appendChild(star);
        }
    }

    // 主题切换时更新背景
    function updateBackground() {
        if (document.body.classList.contains('dark-theme')) {
            createStars();
        } else {
            createSandParticles();
        }
    }

    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                updateBackground();
            }
        });
    });

    observer.observe(document.body, {
        attributes: true
    });

    // 初始化背景
    updateBackground();
}

// 在页面加载完成后初始化背景
document.addEventListener('DOMContentLoaded', () => {
    createBackgroundAnimation();
    // ... 其他现有的DOMContentLoaded代码 ...
});

// 添加窗口大小变化监听
window.addEventListener('resize', () => {
    if (document.body.classList.contains('dark-theme')) {
        createStars();
    }
}); 