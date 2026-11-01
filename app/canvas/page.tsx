"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CanvasBoard from "@/components/CanvasBoard";

export default function CanvasPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/#projects");
  };

  return (
    <main className="min-h-screen bg-[#0c0d11]">
      <CanvasBoard isOpen={isOpen} onClose={handleClose} />
    </main>
  );
}
