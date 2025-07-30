// Perlin Noise 实现（简化版）
class Noise {
  constructor(seed) {
    this.seed = seed || Math.random();
    this.p = [];
    this.permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
      247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
      57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
      74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
      60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
      65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
      200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
      52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
      207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
      119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
      129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
      218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i % 256];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  perlin2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const a = this.p[X] + Y;
    const aa = this.p[a];
    const ab = this.p[a + 1];
    const b = this.p[X + 1] + Y;
    const ba = this.p[b];
    const bb = this.p[b + 1];
    
    return this.lerp(
      this.lerp(this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y), u),
      this.lerp(this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1), u),
      v
    );
  }
}

// 波浪交互组件
class AWaves extends HTMLElement {
  /**
   * 初始化
   */
  connectedCallback() {
    // 元素
    this.svg = this.querySelector('.js-svg');

    // 属性
    this.mouse = {
      x: -10,
      y: 0,
      lx: 0,
      ly: 0,
      sx: 0,
      sy: 0,
      v: 0,
      vs: 0,
      a: 0,
      set: false,
    };

    this.lines = [];
    this.paths = [];
    this.noise = new Noise(Math.random());
    this.animationId = null;

    // 初始化
    this.setSize();
    this.setLines();
    this.bindEvents();
    
    // 启动动画循环
    this.start();
  }

  /**
   * 组件断开连接时清理
   */
  disconnectedCallback() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.removeEventListener('touchmove', this.onTouchMove);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    this.addEventListener('touchmove', this.onTouchMove);
  }

  /**
   * 窗口调整大小处理
   */
  onResize() {
    this.setSize();
    this.setLines();
  }

  /**
   * 鼠标移动处理
   */
  onMouseMove(e) {
    this.updateMousePosition(e.pageX, e.pageY);
  }

  /**
   * 触摸移动处理
   */
  onTouchMove(e) {
    if (e.touches.length > 0) {
      this.updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    }
  }

  /**
   * 更新鼠标位置
   */
  updateMousePosition(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
    this.mouse.set = true;
  }

  /**
   * 设置尺寸
   */
  setSize() {
    this.bounding = this.getBoundingClientRect();
    if (this.svg) {
      this.svg.style.width = `${this.bounding.width}px`;
      this.svg.style.height = `${this.bounding.height}px`;
    }
  }

  /**
   * 设置线条
   */
  setLines() {
    const { width, height } = this.bounding;
    
    this.lines = [];

    // 清除现有路径
    this.paths.forEach((path) => {
      path.remove();
    });
    this.paths = [];

    const xGap = 10;
    const yGap = 32;
    const oWidth = width + 200;
    const oHeight = height + 30;
    const totalLines = Math.ceil(oWidth / xGap);
    const totalPoints = Math.ceil(oHeight / yGap);
    const xStart = (width - xGap * totalLines) / 2;
    const yStart = (height - yGap * totalPoints) / 2;

    for (let i = 0; i <= totalLines; i++) {
      const points = [];

      for (let j = 0; j <= totalPoints; j++) {
        const point = {
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        };

        points.push(point);
      }

      // 创建路径
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('a__line', 'js-line');
      
      if (this.svg) {
        this.svg.appendChild(path);
        this.paths.push(path);
      }

      // 添加点
      this.lines.push(points);
    }
  }

  /**
   * 移动点
   */
  movePoints(time) {
    const { lines, mouse, noise } = this;

    lines.forEach((points) => {
      points.forEach((p) => {
        // 波浪运动
        const move = noise.perlin2(
          (p.x + time * 0.0125) * 0.002,
          (p.y + time * 0.005) * 0.0015
        ) * 12;
        
        p.wave.x = Math.cos(move) * 32;
        p.wave.y = Math.sin(move) * 16;

        // 鼠标效果
        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const l = Math.max(175, mouse.vs);

        if (d < l) {
          const s = 1 - d / l;
          const f = Math.cos(d * 0.001) * s;

          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00065;
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00065;
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.005; // 弦张力
        p.cursor.vy += (0 - p.cursor.y) * 0.005;

        p.cursor.vx *= 0.925; // 摩擦力/持续时间
        p.cursor.vy *= 0.925;

        p.cursor.x += p.cursor.vx * 2; // 强度
        p.cursor.y += p.cursor.vy * 2;

        p.cursor.x = Math.min(100, Math.max(-100, p.cursor.x)); // 限制移动
        p.cursor.y = Math.min(100, Math.max(-100, p.cursor.y));
      });
    });
  }

  /**
   * 获取带有移动的点坐标
   */
  moved(point, withCursorForce = true) {
    const coords = {
      x: point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0),
      y: point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0),
    };

    // 四舍五入到2位小数
    coords.x = Math.round(coords.x * 10) / 10;
    coords.y = Math.round(coords.y * 10) / 10;

    return coords;
  }

  /**
   * 绘制线条
   */
  drawLines() {
    const { lines, paths } = this;
    
    lines.forEach((points, lIndex) => {
      if (!paths[lIndex]) return;

      let p1 = this.moved(points[0], false);
      let d = `M ${p1.x} ${p1.y}`;

      points.forEach((p1, pIndex) => {
        const isLast = pIndex === points.length - 1;
        p1 = this.moved(p1, !isLast);
        d += `L ${p1.x} ${p1.y}`;
      });

      paths[lIndex].setAttribute('d', d);
    });
  }

  /**
   * 动画循环
   */
  tick(time) {
    const { mouse } = this;

    // 平滑鼠标移动
    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    // 鼠标速度
    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx, dy);

    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);

    // 鼠标上一位置
    mouse.lx = mouse.x;
    mouse.ly = mouse.y;

    // 鼠标角度
    mouse.a = Math.atan2(dy, dx);

    // 不再设置CSS变量，因为我们禁用了::before指示器
    // this.style.setProperty('--x', `${mouse.sx}px`);
    // this.style.setProperty('--y', `${mouse.sy}px`);

    this.movePoints(time);
    this.drawLines();
    
    this.animationId = requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * 开始动画
   */
  start() {
    if (!this.animationId) {
      this.animationId = requestAnimationFrame(this.tick.bind(this));
    }
  }

  /**
   * 停止动画
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// 注册自定义元素
if (!customElements.get('a-waves')) {
  customElements.define('a-waves', AWaves);
}

// 眼睛动画组件
class EyeAnimation {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.startTime = null;
    this.duration = 3000; // 3秒动画
    this.isComplete = false;
    
    // 眼睛参数
    this.eyeCenter = { x: 0, y: 0 };
    this.eyeWidth = 200;
    this.eyeHeight = 100;
    this.pupilRadius = 30;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupEye();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '99999';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.background = 'rgba(0, 0, 0, 0.9)';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    this.ctx.scale(dpr, dpr);
    
    // 更新眼睛中心位置
    this.eyeCenter.x = rect.width / 2;
    this.eyeCenter.y = rect.height / 2;
  }
  
  setupEye() {
    // 眼睛路径点
    this.eyePaths = {
      upperLid: this.generateEyeLidPath(true),
      lowerLid: this.generateEyeLidPath(false),
      iris: this.generateIrisPath(),
      pupil: this.generatePupilPath()
    };
  }
  
  generateEyeLidPath(isUpper) {
    const points = [];
    const segments = 50;
    const { x, y } = this.eyeCenter;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = Math.PI * t;
      
      const baseX = x + Math.cos(angle) * this.eyeWidth / 2;
      const baseY = y + (isUpper ? -1 : 1) * Math.sin(angle) * this.eyeHeight / 2;
      
      points.push({ x: baseX, y: baseY });
    }
    
    return points;
  }
  
  generateIrisPath() {
    const points = [];
    const segments = 30;
    const { x, y } = this.eyeCenter;
    const radius = this.pupilRadius * 1.8;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * 2 * i) / segments;
      points.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius
      });
    }
    
    return points;
  }
  
  generatePupilPath() {
    const points = [];
    const segments = 20;
    const { x, y } = this.eyeCenter;
    
    for (let i = 0; i <= segments; i++) {
      const angle = (Math.PI * 2 * i) / segments;
      points.push({
        x: x + Math.cos(angle) * this.pupilRadius,
        y: y + Math.sin(angle) * this.pupilRadius
      });
    }
    
    return points;
  }
  
  drawPath(points, progress, strokeStyle = '#78aaff', lineWidth = 2) {
    if (points.length < 2) return;
    
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    const visiblePoints = Math.floor(points.length * progress);
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < visiblePoints; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    // 添加发光效果
    this.ctx.shadowColor = strokeStyle;
    this.ctx.shadowBlur = 10;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }
  
  animate(timestamp) {
    if (!this.startTime) this.startTime = timestamp;
    
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景渐变
    const gradient = this.ctx.createRadialGradient(
      this.eyeCenter.x, this.eyeCenter.y, 0,
      this.eyeCenter.x, this.eyeCenter.y, 300
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 动画阶段
    if (progress < 0.3) {
      // 阶段1: 绘制下眼睑
      const lidProgress = progress / 0.3;
      this.drawPath(this.eyePaths.lowerLid, lidProgress, '#88CE02', 3);
      
    } else if (progress < 0.6) {
      // 阶段2: 绘制上眼睑（睁开效果）
      const lidProgress = (progress - 0.3) / 0.3;
      this.drawPath(this.eyePaths.lowerLid, 1, '#88CE02', 3);
      this.drawPath(this.eyePaths.upperLid, lidProgress, '#88CE02', 3);
      
    } else if (progress < 0.8) {
      // 阶段3: 绘制虹膜
      const irisProgress = (progress - 0.6) / 0.2;
      this.drawPath(this.eyePaths.lowerLid, 1, '#88CE02', 3);
      this.drawPath(this.eyePaths.upperLid, 1, '#88CE02', 3);
      this.drawPath(this.eyePaths.iris, irisProgress, '#78aaff', 2);
      
    } else {
      // 阶段4: 绘制瞳孔并完成
      const pupilProgress = (progress - 0.8) / 0.2;
      this.drawPath(this.eyePaths.lowerLid, 1, '#88CE02', 3);
      this.drawPath(this.eyePaths.upperLid, 1, '#88CE02', 3);
      this.drawPath(this.eyePaths.iris, 1, '#78aaff', 2);
      this.drawPath(this.eyePaths.pupil, pupilProgress, '#ffffff', 2);
      
      // 添加瞳孔填充
      if (pupilProgress > 0.5) {
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.eyeCenter.x, this.eyeCenter.y, this.pupilRadius * pupilProgress, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    if (progress < 1) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    } else {
      this.complete();
    }
  }
  
  complete() {
    this.isComplete = true;
    
    // 淡出动画
    let opacity = 1;
    const fadeOut = () => {
      opacity -= 0.05;
      this.canvas.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        this.destroy();
      }
    };
    
    setTimeout(fadeOut, 500);
  }
  
  start() {
    this.animationId = requestAnimationFrame((t) => this.animate(t));
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    window.removeEventListener('resize', () => this.resize());
  }
}
