// 创建礼花效果
function createConfetti(x, y) {
    const colors = ['#64ffda', '#ff69b4', '#ffd700', '#87ceeb', '#dda0dd', '#98fb98'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 1 + Math.random() * 1.5;
        confetti.style.setProperty('--angle', angle);
        confetti.style.setProperty('--velocity', velocity);
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

// 创建彩带效果
function createRibbon(x, y) {
    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon';
    ribbon.style.left = x + 'px';
    ribbon.style.top = y + 'px';
    ribbon.style.setProperty('--fall-duration', (3 + Math.random() * 2) + 's');
    document.body.appendChild(ribbon);
    
    setTimeout(() => {
        ribbon.remove();
    }, 5000);
}

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    const avatar = document.querySelector('.logo-avatar');
    
    // 只在头像悬停时触发效果
    avatar.addEventListener('mouseenter', () => {
        const rect = avatar.getBoundingClientRect();
        // 在头像周围创建礼花
        createConfetti(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2
        );
        
        // 创建定时器，在悬停期间持续产生彩带
        const ribbonInterval = setInterval(() => {
            if (Math.random() < 0.3) {
                createRibbon(
                    rect.left + Math.random() * rect.width,
                    rect.top + rect.height
                );
            }
        }, 100);
        
        // 鼠标离开时清除定时器
        avatar.addEventListener('mouseleave', () => {
            clearInterval(ribbonInterval);
        }, { once: true });
    });
});