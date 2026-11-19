// Script to clean up browser extension attributes that cause hydration issues

export const cleanupBrowserExtensions = () => {
  if (typeof window === 'undefined') return

  // Function to remove bis_skin_checked attributes
  const removeBisSkinChecked = () => {
    const elements = document.querySelectorAll('[bis_skin_checked], [data-bis_skin_checked]')
    elements.forEach(element => {
      element.removeAttribute('bis_skin_checked')
      element.removeAttribute('data-bis_skin_checked')
    })
  }

  // Run immediately
  removeBisSkinChecked()

  // Run after DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeBisSkinChecked)
  }

  // Run after window loads
  window.addEventListener('load', removeBisSkinChecked)

  // Run periodically to catch any dynamically added attributes
  const interval = setInterval(removeBisSkinChecked, 1000)

  // Clean up interval after 10 seconds
  setTimeout(() => {
    clearInterval(interval)
  }, 10000)

  // Also run on any DOM mutations
  const observer = new MutationObserver((mutations) => {
    let shouldCleanup = false
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as Element
        if (target.hasAttribute('bis_skin_checked') || target.hasAttribute('data-bis_skin_checked')) {
          shouldCleanup = true
        }
      }
    })
    
    if (shouldCleanup) {
      removeBisSkinChecked()
    }
  })

  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['bis_skin_checked', 'data-bis_skin_checked']
  })

  // Clean up observer after 30 seconds
  setTimeout(() => {
    observer.disconnect()
  }, 30000)
}

// Auto-run the cleanup
if (typeof window !== 'undefined') {
  cleanupBrowserExtensions()
}

