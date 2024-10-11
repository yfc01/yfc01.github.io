document.addEventListener('DOMContentLoaded', function() {
    // 动态加载 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.css';
    document.head.appendChild(link);

    // 动态加载 JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/sakana-widget@2.7.0/lib/sakana.min.js';
    script.async = true;
    script.onload = function() {
        new SakanaWidget().mount('#sakana-widget');
    }
    document.body.appendChild(script);
});
