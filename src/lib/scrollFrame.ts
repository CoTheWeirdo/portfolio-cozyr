type ScrollListener = () => void;

const listeners = new Set<ScrollListener>();

export function onScrollFrame(listener: ScrollListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitScrollFrame() {
  listeners.forEach((listener) => listener());
}
