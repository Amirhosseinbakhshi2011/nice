// 3d-loader.js
(function(){
  function createLoader(){
    const root = document.getElementById('loading-root');
    if(!root) return;
    // container
    const box = document.createElement('div');
    box.className = 'loader-cube';
    // six faces
    for(let i=1;i<=6;i++){
      const f = document.createElement('div');
      f.className = 'face f'+i;
      f.textContent = ''; // می‌توان متن یا آیکون قرار داد
      box.appendChild(f);
    }
    root.innerHTML = '';
    root.appendChild(box);
  }
  // mount immediately
  document.addEventListener('DOMContentLoaded', createLoader);
})();
