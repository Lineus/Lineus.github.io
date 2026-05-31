// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 同步按钮图标（主题已由内联脚本在 <head> 中设置）
    syncThemeButton();
    
    // 滚动动画
    initScrollAnimation();
    
    // 平滑滚动
    initSmoothScroll();
    
    // 按钮点击效果
    initButtonClickEffect();
    
    // 拦截文章链接，实现 Markdown 渲染
    initArticleLinks();
    
    // 禁止复制内容
    initDisableCopy();
});

// ==================== 主题切换 ====================

// 同步按钮图标状态
function syncThemeButton() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'light') {
        btn.innerHTML = '☀️';
        btn.title = '切换深色模式';
    } else {
        btn.innerHTML = '🌙';
        btn.title = '切换浅色模式';
    }
}

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

// 拦截文章链接，使用 AJAX 加载并渲染 Markdown
function initArticleLinks() {
    const articleLinks = document.querySelectorAll('.article-btn');
    
    articleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const articleUrl = this.getAttribute('href');
            
            // 显示加载状态
            showLoadingOverlay();
            
            // 获取 Markdown 文件内容
            fetch(articleUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(markdown => {
                    // 渲染 Markdown 为 HTML
                    const htmlContent = marked.parse(markdown);
                    
                    // 显示文章内容
                    showArticleModal(htmlContent);
                    
                    // 隐藏加载状态
                    hideLoadingOverlay();
                })
                .catch(error => {
                    console.error('Error loading article:', error);
                    hideLoadingOverlay();
                    showErrorModal('文章加载失败，请稍后重试');
                });
        });
    });
}

// ==================== 禁止复制 ====================

function initDisableCopy() {
    // 禁止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁止复制
    document.addEventListener('copy', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁止剪切
    document.addEventListener('cut', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁止粘贴
    document.addEventListener('paste', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁止键盘快捷键复制 (Ctrl+C / Ctrl+U / Ctrl+S / F12)
    document.addEventListener('keydown', function(e) {
        if (
            e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S') ||
            e.key === 'F12'
        ) {
            e.preventDefault();
            return false;
        }
    });

    // 对于文章模态框内的内容，也禁止选择
    const style = document.createElement('style');
    style.textContent = `
        .article-modal .modal-body {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
    `;
    document.head.appendChild(style);
}

// 显示加载遮罩
function showLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

// 隐藏加载遮罩
function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// 显示文章模态框
function showArticleModal(content) {
    let modal = document.getElementById('article-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'article-modal';
        modal.className = 'article-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="关闭">×</button>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 绑定关闭按钮事件
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => closeModal(modal));
        
        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal(modal);
            }
        });
    }
    
    // 设置内容并显示
    modal.querySelector('.modal-body').innerHTML = content;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
}

// 显示错误提示
function showErrorModal(message) {
    alert(message);
}

// 关闭模态框
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // 恢复滚动
}

// 加载兴趣爱好文章（复用文章模态框）
function loadHobbyArticle(url) {
    showLoadingOverlay();
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(markdown => {
            const htmlContent = marked.parse(markdown);
            showArticleModal(htmlContent);
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error('Error loading hobby article:', error);
            hideLoadingOverlay();
            showErrorModal('内容加载失败，请稍后重试');
        });
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
