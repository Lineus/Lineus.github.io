const themeToggle = document.getElementById('themeToggle');

function syncThemeButton() {
    const light = document.documentElement.dataset.theme === 'light';
    const label = light ? '切换深色模式' : '切换浅色模式';
    themeToggle.textContent = light ? '☀️' : '🌙';
    themeToggle.title = label;
    themeToggle.setAttribute('aria-label', label);
}

syncThemeButton();

const articleDialog = document.getElementById('article-modal');
if (typeof articleDialog.showModal === 'function') {
    const title = document.getElementById('article-title');
    const content = articleDialog.querySelector('.modal-body');
    const status = articleDialog.querySelector('[role="status"]');
    const retry = articleDialog.querySelector('.modal-retry');
    const close = articleDialog.querySelector('.modal-close');

    let opener;
    let request;
    let startedOnBackdrop;

    async function loadArticle() {
        request?.abort();
        request = new AbortController();
        const { signal } = request;
        content.replaceChildren();
        status.textContent = '正在加载文章…';
        retry.hidden = true;

        try {
            const [response, { marked }, { default: DOMPurify }] = await Promise.all([
                fetch(opener.href, { signal }),
                import('./vendor/marked-18.1.3.js'),
                import('./vendor/dompurify-3.4.17.js')
            ]);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const markdown = await response.text();
            if (signal.aborted) return;
            const article = DOMPurify.sanitize(marked.parse(markdown), {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ['style'],
                FORBID_ATTR: ['style'],
                RETURN_DOM_FRAGMENT: true
            });
            content.replaceChildren(article);
            status.textContent = '';
        } catch {
            if (signal.aborted) return;
            status.textContent = '文章加载失败，请重试。';
            retry.hidden = false;
        }
    }

    document.querySelectorAll('[data-article]').forEach(link => {
        link.addEventListener('click', event => {
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();

            opener = link;
            title.textContent = link.querySelector('.btn-text').textContent;
            articleDialog.showModal();
            articleDialog.scrollTop = 0;
            document.documentElement.classList.add('reading');
            loadArticle();
        });
    });

    retry.addEventListener('click', () => {
        close.focus();
        loadArticle();
    });

    articleDialog.addEventListener('pointerdown', event => {
        startedOnBackdrop = event.target === articleDialog;
    });

    articleDialog.addEventListener('click', event => {
        if (startedOnBackdrop && event.target === articleDialog) articleDialog.close();
    });

    articleDialog.addEventListener('close', () => {
        if (articleDialog.open) return;
        request?.abort();
        content.replaceChildren();
        document.documentElement.classList.remove('reading');
        opener?.focus({ preventScroll: true });
    });

    // 保留原有的文章正文复制限制，主页和阅读器控件仍可正常操作。
    for (const event of ['contextmenu', 'copy', 'cut']) {
        content.addEventListener(event, event => event.preventDefault());
    }
}
