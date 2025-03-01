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
        var sakanaCharacter = new SakanaWidget({ character: 'chisato' }).mount('#sakana-widget');

        sakanaCharacter.triggerAutoMode();
    }
    document.body.appendChild(script);

    // 动态加载本地 CSS
    const link_local = document.createElement('link');
    link_local.rel = 'stylesheet';
    link_local.href = '/css/kanban-girl.css';
    document.body.appendChild(link_local);
});
