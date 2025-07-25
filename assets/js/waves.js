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
    e.preventDefault();
    const touch = e.touches[0];
    this.updateMousePosition(touch.clientX, touch.clientY);
  }

  /**
   * 更新鼠标位置
   */
  updateMousePosition(x, y) {
    const { mouse } = this;

    mouse.x = x - this.bounding.left;
    mouse.y = y - this.bounding.top + window.scrollY;

    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }
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