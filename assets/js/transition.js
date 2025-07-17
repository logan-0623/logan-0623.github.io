document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("fade-in");
    const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"])');
    const transitionBar = document.getElementById("transition-bar");
  
    // GSAP timeline 控制
    let barTimeline = gsap.timeline({
      paused: true,
      defaults: { duration: 0.7, ease: "power1.inOut" },
    });
    barTimeline.to("#transition-bar", { width: "100%" });
  
    // 最小动画时间
    const MIN_ANIMATION_TIME = 100; // ms
  
    // 显示并启动条，返回 Promise 在动画/最小时间结束后再跳转
    function openTransitionBar() {
      return new Promise((resolve) => {
        transitionBar.style.opacity = "1";
        transitionBar.style.width = "0%";
        barTimeline.restart();
  
        // 计时 & 动画都结束才 resolve
        let t1 = setTimeout(() => resolve(), MIN_ANIMATION_TIME);
        barTimeline.eventCallback("onComplete", () => {
          clearTimeout(t1);
          resolve();
        });
      });
    }
  
    // 隐藏进度条
    function closeTransitionBar() {
      gsap.to(transitionBar, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          transitionBar.style.width = "0%";
          transitionBar.style.opacity = "";
        }
      });
    }
  
    // 页面加载完成后关闭条（进入新页面）
    window.addEventListener("load", () => {
      closeTransitionBar();
    });
  
    links.forEach(link => {
      link.addEventListener("click", async function (e) {
        const href = this.getAttribute("href");
        if (!href || href.startsWith("http")) return;
        e.preventDefault();
        playLoadingBar(); // 不等刷子动画，直接开条
        // 刷子动画和进度条动画一起开始
        const p1 = new Promise(resolve => playBrushTransition(resolve));
        
    
        // 跳转在刷子动画结束后（可自定义是否要等进度条动画）
        p1.then(() => {
          setTimeout(() => {
            window.location.href = href;
          }, 1000); // 等 loading bar 动画也差不多完事
        });
      });
    });
    
  });

// 刷子动画（配合 loading 调用）
function playBrushTransition(onComplete) {
    const brush = document.getElementById('page-brush');
    brush.style.opacity = "1";
    brush.style.display = "block";
    gsap.set(brush, {x:0, y:0});
    gsap.fromTo(
        brush,
        {x: 0, y: 0},
        {
            x: "-120vw",
            y: "120vh",
            duration: 1.15,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(brush, {opacity: 0, duration: 0.22, onComplete: () => {
                    brush.style.display = "none";
                    if (onComplete) onComplete();
                }});
            }
        }
    );
}

// loading 条动画（和你现有的 loading 逻辑一样）
function playLoadingBar() {
    const bar = document.getElementById("transition-bar");
    bar.style.opacity = "1";
    bar.style.width = "0%";
    gsap.to(bar, { width: "100%", duration: 1, ease: "power1.inOut" });
}

// 联动用法：刷子扫完 -> loading 条出现
function startFullLoadingSequence(callback) {
    const loader = document.getElementById('page-loader');
    loader.classList.remove('hidden');
    playBrushTransition(() => {
        playLoadingBar();
        // 你可以在 loading 条动画结束后关闭 loader，或继续 fetch/渲染
        setTimeout(() => {
            loader.classList.add('hidden');
            if (callback) callback();
        }, 1000); // 此处假设 loading 条动画1秒，按需调整
    });
}

// 页面切换/跳转时调用
// 比如在页面 ready、pjax 跳转、单页切换时
startFullLoadingSequence();

