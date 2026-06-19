export const clickAnimation = {
  initial: { scale: 1 },
  tap: { scale: 0.96 },
  hover: { scale: 1.03 },
};

export const pageFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25 },
};