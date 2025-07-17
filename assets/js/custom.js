

// 页面加载时，恢复用户选择的主题
window.addEventListener('DOMContentLoaded', function() {
const theme = localStorage.getItem('theme');
if (theme === 'dark') {
    document.body.classList.add('dark-theme');
} else {
    document.body.classList.remove('dark-theme');
}
});
  
function toggleTheme() {
    // 切换 class
    document.body.classList.toggle('dark-theme');
    // 保存当前主题
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  }