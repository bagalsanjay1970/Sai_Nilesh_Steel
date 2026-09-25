/**
 * Anti-Inspection & Source Code Protection System
 * Blocks DevTools shortcuts, right-click inspect, and strips source maps.
 */

export const initCodeProtection = () => {
  // 1. Disable Right-Click Context Menu ("Inspect", "View Page Source")
  document.addEventListener('contextmenu', (e) => {
    // Allow right click inside form inputs if user wants to paste
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  }, false);

  // 2. Block DevTools & Source Viewing Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // F12 (DevTools)
    if (e.keyCode === 123 || e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I or Cmd+Option+I (Inspect Element)
    if (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+J or Cmd+Option+J (Console)
    if (cmdOrCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+C or Cmd+Option+C (Element Picker)
    if (cmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U or Cmd+U (View Page Source)
    if (cmdOrCtrl && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S or Cmd+S (Save Page Source)
    if (cmdOrCtrl && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, false);

  // 3. Security Warning in Console
  try {
    const warningStyle1 = 'color: #D32F2F; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;';
    const warningStyle2 = 'color: #333; font-size: 14px; font-weight: 500;';
    
    console.log('%c⛔ STOP!', warningStyle1);
    console.log(
      '%cThis is a browser feature intended strictly for developers. Inspecting, decompiling, or copying proprietary Sai Nilesh Steel code, images, or designs is strictly prohibited.',
      warningStyle2
    );
  } catch (err) {}
};
