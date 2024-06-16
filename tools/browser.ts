export const setInterval = (callback: () => void, ms: number) => {
  return window.setInterval(callback, ms);
};

export const clearInterval = (id: number) => {
  return window.clearInterval(id);
};

export const requestAnimationFrame = (callback: FrameRequestCallback) => {
  return window.requestAnimationFrame(callback);
};

export const cancelAnimationFrame = (id: number) => {
  return window.cancelAnimationFrame(id);
};
