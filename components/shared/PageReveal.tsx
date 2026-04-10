"use client";

import { useLayoutEffect } from "react";

export default function PageReveal() {
  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      document.body.style.transition = "opacity 0.15s ease-in";
      document.body.style.opacity = "1";
    });
  }, []);

  return null;
}
