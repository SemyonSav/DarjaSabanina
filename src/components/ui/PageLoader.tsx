"use client";

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="relative flex size-16 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-sand"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
        <span className="size-2 rounded-full bg-accent" />
      </div>
    </div>
  );
}
