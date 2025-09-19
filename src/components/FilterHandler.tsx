'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState } from './JobFilters';

interface FilterHandlerProps {
  children: React.ReactNode;
}

export default function FilterHandler({ children }: FilterHandlerProps) {
  return (
    <div>
      {children}
    </div>
  );
}
