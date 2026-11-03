/* Mobile users get a popup that offers the Android app.
   Put the link to your signed APK in APK_URL. Until it is set, Android visitors see no popup.
   The browser cannot install an app by itself: the popup downloads the APK, then the user opens the
   downloaded file, and Android's own package installer asks them to confirm the install. */
(function () {
  'use strict';
  const APK_URL = 'https://github.com/saksham744-y/Daybreak/releases/download/v3.0/daybreak3.apk';                       // e.g. 'https://saksham744-y.github.io/downloads/daybreak.apk'
  const APK_NOTE = 'Version 3.0 · 9.29 MB';                      // optional line shown under the button, e.g. 'Version 1.4 · 12 MB'
  const KEY = 'daybreak.appPrompt';         // when the popup was last dismissed (localStorage)
  const WAIT_DAYS = 7;                      // do not show again for this many days after "Not now"

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isMobile = isAndroid || isIOS || (navigator.userAgentData && navigator.userAgentData.mobile === true);
  const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  function dismissedRecently() {
    try { return Date.now() - (+localStorage.getItem(KEY) || 0) < WAIT_DAYS * 864e5; } catch (e) { return false; }
  }
  function remember() { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {} }

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  }

  function close(sheet) {
    remember();
    sheet.classList.remove('show');
    setTimeout(() => sheet.remove(), 260);
  }

  function open() {
    const steps = isAndroid
      ? [
          'Tap Download app. The file starts downloading.',
          'When it finishes, open it from the notification or your Downloads.',
          'Tap Install. Android asks you to confirm, so you choose whether to install.',
          'If Android asks, allow installs from this browser once, then tap Install again.'
        ]
      : [
          'Tap the Share button in Safari.',
          'Choose Add to Home Screen.',
          'Open Daybreak from your Home Screen.'
        ];
    const title = isAndroid ? 'Get the Daybreak app' : 'Add Daybreak to your Home Screen';
    const intro = isAndroid
      ? 'The Android app keeps reminders working even when the browser is closed. It keeps its own data on your phone, so your plan in this browser stays here.'
      : 'Open Daybreak like an app from your Home Screen. Reminders work while the app is open.';
    const actions = [];
    if (isAndroid) {
      actions.push(el('a', { class: 'btn primary', href: APK_URL, download: true, onclick: () => remember(), text: 'Download app' }));
    }
    actions.push(el('button', { type: 'button', class: 'btn quiet', onclick: () => close(sheet), text: isAndroid ? 'Not now' : 'Got it' }));

    const card = el('div', { class: 'sheet-card appprompt', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'appprompt-title' },
      el('div', { class: 'sheet-grip' }),
      el('h3', { id: 'appprompt-title', text: title }),
      el('p', { class: 'hint', text: intro }),
      el('ol', { class: 'appprompt-steps' }, steps.map(s => el('li', { text: s }))),
      APK_NOTE && isAndroid ? el('p', { class: 'hint', text: APK_NOTE }) : null,
      el('div', { class: 'actions' }, actions)
    );
    const sheet = el('div', { class: 'sheet', onclick: e => { if (e.target === sheet) close(sheet); } }, card);
    document.body.append(sheet);
    requestAnimationFrame(() => sheet.classList.add('show'));
  }

  function init() {
    if (!isMobile || isInstalled() || dismissedRecently()) return;
    if (isAndroid && !APK_URL) return;      // no app link yet: show nothing
    setTimeout(open, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
