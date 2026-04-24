// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 滚动动画
    initScrollAnimation();
    
    // 平滑滚动
    initSmoothScroll();
    
    // 按钮点击效果
    initButtonClickEffect();
});

// 滚动动画 - 元素进入视口时淡入
function initScrollAnimation() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    document.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 按钮点击波纹效果
function initButtonClickEffect() {
    const buttons = document.querySelectorAll('.article-btn, .game-btn, .email-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建波纹元素
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(37, 99, 235, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            // 动画结束后移除
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// 添加波纹动画关键帧
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 标签悬停音效（可选，需要音频文件）
function addTagHoverSound() {
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            // 这里可以添加音效
            // const audio = new Audio('/assets/sounds/hover.mp3');
            // audio.play().catch(e => console.log('Audio play failed'));
        });
    });
}

// 打字机效果（可选）
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 访客统计优化 - 添加加载状态
function optimizeVisitorStats() {
    const visitorImg = document.querySelector('.visitor-count img');
    if (visitorImg) {
        // 添加加载占位符
        visitorImg.style.opacity = '0';
        visitorImg.style.transition = 'opacity 0.3s ease';
        
        visitorImg.onload = function() {
            this.style.opacity = '1';
        };
        
        // 如果加载失败，显示备用文本
        visitorImg.onerror = function() {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'visitor-fallback';
            fallback.innerHTML = '<small>👥 欢迎访问</small>';
            this.parentElement.appendChild(fallback);
        };
    }
}

// 页面加载完成后执行
window.addEventListener('load', function() {
    optimizeVisitorStats();
});

// 性能优化：使用 requestAnimationFrame
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 缓动函数
        const ease = function(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// 导出函数供外部使用
window.smoothScrollTo = smoothScrollTo;
window.typeWriter = typeWriter;
