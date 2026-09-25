// Navigation utility để tránh reload trang khi redirect
// Sử dụng event để communicate với React Router

let navigateCallback: ((path: string) => void) | null = null;

export const navigationUtils = {
  setNavigate: (navigate: (path: string) => void) => {
    navigateCallback = navigate;
  },
  
  navigate: (path: string) => {
    if (navigateCallback) {
      navigateCallback(path);
    } else {
      // Fallback: chỉ reload khi không có navigate callback
      // Điều này chỉ xảy ra khi app chưa mount hoặc có vấn đề
      window.location.href = path;
    }
  },
};

