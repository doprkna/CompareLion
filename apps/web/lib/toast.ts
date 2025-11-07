/**
 * Toast Notification Utility
 * v0.19.5 - Simple toast system
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info') {
  // This is a simple implementation
  // In production, you'd want to use a proper toast library like sonner or react-hot-toast
  
  if (typeof window === 'undefined') return;

  const toastContainer = getOrCreateToastContainer();
  const toast = createToastElement(message, type);
  
  toastContainer.appendChild(toast);

  // Fade in
  setTimeout(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    toast.classList.remove('opacity-100', 'translate-y-0');
    
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function getOrCreateToastContainer(): HTMLElement {
  let container = document.getElementById('toast-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  
  return container;
}

function createToastElement(message: string, type: ToastType): HTMLElement {
  const toast = document.createElement('div');
  toast.className = `
    pointer-events-auto
    px-4 py-3 rounded-lg shadow-lg
    flex items-center gap-2
    transform transition-all duration-300
    opacity-0 translate-y-2
    ${getToastStyles(type)}
  `.trim().replace(/\s+/g, ' ');

  const icon = getToastIcon(type);
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icon;
  iconSpan.className = 'text-lg';

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  messageSpan.className = 'text-sm font-medium';

  toast.appendChild(iconSpan);
  toast.appendChild(messageSpan);

  return toast;
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100';
    case 'error':
      return 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100';
    case 'info':
    default:
      return 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
}

// Expose globally for use in components
if (typeof window !== 'undefined') {
  (window as any).showToast = showToast;
}

