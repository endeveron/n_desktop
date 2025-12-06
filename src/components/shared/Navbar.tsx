'use client';

import { usePathname } from 'next/navigation';

import { GlobeIcon } from '@/components/icons/GlobeIcon';
import { NoteIcon } from '@/components/icons/NoteIcon';
import { cn } from '@/utils';
import Link from 'next/link';

interface NavbarProps {
  isMobile: boolean;
}

const Navbar = ({ isMobile }: NavbarProps) => {
  const pathname = usePathname();

  if (isMobile) return null;

  return (
    <div className="flex-center flex-1 gap-3 mx-2">
      <Link href="/news">
        <GlobeIcon
          className={cn(
            pathname.includes('news') ? 'text-icon' : 'icon--action'
          )}
        />
      </Link>
      <Link href="/notes">
        <NoteIcon
          className={cn(
            pathname.includes('notes') ? 'text-icon' : 'icon--action'
          )}
        />
      </Link>
    </div>
  );
};

export default Navbar;
