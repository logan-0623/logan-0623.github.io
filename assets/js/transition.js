function playBrushTransition(onComplete) {
  const brush = document.getElementById('page-brush');
  if (!brush) { console.error('找不到#page-brush'); return; }
  brush.style.opacity = "1";        // 动画前让它可见
  brush.style.display = "block";    // 保险起见，确保是 block
  gsap.set(brush, {x:0, y:0});
  gsap.fromTo(
      brush,
      {x: 0, y: 0},
      {
          x: "-120vw",
          y: "120vh",
          duration: 1.1,
          ease: "power2.inOut",
          onComplete: () => {
              // 动画完后刷子淡出再隐藏
              gsap.to(brush, {opacity: 0, duration: 0.10, onComplete: () => {
                  brush.style.display = "block";  // 其实不用动，继续 block，只是透明
                  if (onComplete) onComplete();
              }});
          }
      }
  );
}



document.addEventListener("DOMContentLoaded", function() {
  const links = document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="#"])');
  links.forEach(link => {
    link.addEventListener("click", function(e) {
      const href = this.getAttribute("href");
      if (!href || href.startsWith("http")) return; // 跳外链、锚点不动
      e.preventDefault();
      playBrushTransition(() => {
        setTimeout(() => {
          window.location.href = href;
        }, 0); // 动画完后再跳转
      });
    });
  });
});


