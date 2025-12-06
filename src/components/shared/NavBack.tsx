import { NavBackIcon } from '@/components/icons/NavBackIcon';
import { cn } from '@/utils';
import { useRouter } from 'next/navigation';

interface NavbackProps {
  className?: string;
  route?: string;
}

export const NavBack = ({ className, route }: NavbackProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => (route ? router.push(route) : router.back())}
      className={cn('w-6 h-6 -ml-0.5', className)}
    >
      <NavBackIcon className="icon--action" />
    </div>
  );
};
