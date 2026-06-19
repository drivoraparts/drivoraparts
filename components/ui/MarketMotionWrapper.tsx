"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export default function MarketMotionWrapper({
  children,
  isActive,
}: {
  children: ReactNode;
  isActive: boolean;
}) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -20 }}
          transition={{
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}