import { Card } from '@/components/shared/Card';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="anim-fade size-full flex p-2 trans-c">
      <div className="relative size-full md:w-[400px] flex-center">
        {children}
      </div>
      <div className="relative max-md:hidden flex-1 flex-center select-none">
        <Card size="fill" />
      </div>
    </div>
  );
}
