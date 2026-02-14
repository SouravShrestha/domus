let listener: (() => void) | null = null;

export const onVisitorRefresh = (callback: () => void) => {
  listener = callback;
  return () => {
    listener = null;
  };
};

export const emitVisitorRefresh = () => {
  listener?.();
};
