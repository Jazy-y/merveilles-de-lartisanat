// Fix hydration errors caused by browser extensions
(function() {
  'use strict';
  
  function removeProblematicAttributes() {
    try {
      // Remove bis_skin_checked attributes (most common cause)
      const bisElements = document.querySelectorAll('[bis_skin_checked]');
      bisElements.forEach(element => {
        element.removeAttribute('bis_skin_checked');
      });
      
      // Remove data-bis_skin_checked attributes
      const dataBisElements = document.querySelectorAll('[data-bis_skin_checked]');
      dataBisElements.forEach(element => {
        element.removeAttribute('data-bis_skin_checked');
      });
      
      // Remove other problematic attributes
      const otherAttrs = [
        '__processed_104fe8bf-bedd-4a0d-b2e7-5f6181169876__', 
        'bis_register',
        'data-bis_register',
        'data-bis_skin_checked'
      ];
      
      otherAttrs.forEach(attr => {
        try {
          const elements = document.querySelectorAll(`[${attr}]`);
          elements.forEach(element => {
            element.removeAttribute(attr);
          });
        } catch (error) {
          // Ignore errors for individual attributes
        }
      });
      
      // Remove any elements that might be added by extensions
      const extensionElements = document.querySelectorAll('[style*="display: none !important"]');
      extensionElements.forEach(element => {
        if (element.hasAttribute('bis_skin_checked') || 
            element.hasAttribute('data-bis_skin_checked')) {
          element.remove();
        }
      });
      
    } catch (error) {
      console.warn('Error removing problematic attributes:', error);
    }
  }
  
  // Run immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeProblematicAttributes);
  } else {
    removeProblematicAttributes();
  }
  
  // Run on window load
  window.addEventListener('load', removeProblematicAttributes);
  
  // Run more frequently for the first 10 seconds to catch dynamic additions
  let count = 0;
  const interval = setInterval(() => {
    removeProblematicAttributes();
    count++;
    if (count >= 20) { // 20 * 500ms = 10 seconds
      clearInterval(interval);
    }
  }, 500);
  
  // Also run on any DOM mutations
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'bis_skin_checked' || 
             mutation.attributeName === 'data-bis_skin_checked')) {
          shouldClean = true;
        }
      });
      if (shouldClean) {
        removeProblematicAttributes();
      }
    });
    
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked']
    });
  }
})();