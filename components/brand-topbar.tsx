import type { ReactNode } from "react";
import { BrandLogo } from "./brand-logo";

export function BrandTopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b-2 border-brand-gold bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <BrandLogo height={40} />
        {right}
      </div>
    </header>
  );
}
