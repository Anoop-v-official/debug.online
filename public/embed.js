// debugdaily.online embed loader.
//
// Use:
//   <script
//     src="https://debugdaily.online/embed.js"
//     data-debugdaily-embed
//     data-tool="json-format"
//     data-height="640"
//     async
//   ></script>
//
// The script creates an iframe in its place and listens for resize messages
// from the embedded page to keep the iframe height in sync with the content.
(function () {
  'use strict';

  var ORIGIN = 'https://debugdaily.online';
  var SCRIPT_SELECTOR = 'script[data-debugdaily-embed]';

  function init() {
    var scripts = document.querySelectorAll(SCRIPT_SELECTOR);
    for (var i = 0; i < scripts.length; i++) {
      mount(scripts[i]);
    }
  }

  function mount(script) {
    if (script.getAttribute('data-debugdaily-mounted') === '1') return;
    script.setAttribute('data-debugdaily-mounted', '1');

    var slug = script.getAttribute('data-tool');
    if (!slug || !/^[a-z0-9-]{2,64}$/.test(slug)) return;

    var height = parseInt(script.getAttribute('data-height') || '640', 10);
    if (!height || height < 200) height = 640;

    var iframe = document.createElement('iframe');
    iframe.src = ORIGIN + '/embed/' + slug;
    iframe.width = '100%';
    iframe.height = String(height);
    iframe.loading = 'lazy';
    iframe.title = 'debugdaily — ' + slug;
    iframe.setAttribute('frameborder', '0');
    iframe.style.cssText =
      'border:0;border-radius:8px;max-width:100%;display:block';

    var parent = script.parentNode;
    if (!parent) return;
    parent.insertBefore(iframe, script);

    window.addEventListener('message', function (event) {
      if (event.origin !== ORIGIN) return;
      if (event.source !== iframe.contentWindow) return;
      var data = event.data;
      if (!data || data.type !== 'debugdaily-resize') return;
      if (typeof data.height !== 'number') return;
      if (data.slug !== slug) return;
      iframe.style.height = Math.max(200, Math.min(4000, data.height)) + 'px';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
