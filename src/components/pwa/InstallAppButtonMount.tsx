"use client";

import { useEffect, useState } from "react";
import InstallAppButton from "@/components/pwa/InstallAppButton";

export default function InstallAppButtonMount({
  className,
  iosClassName,
  label,
  iosLabel
}: {
  className: string;
  iosClassName?: string;
  label?: string;
  iosLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <InstallAppButton
      className={className}
      iosClassName={iosClassName}
      label={label}
      iosLabel={iosLabel}
    />
  );
}
