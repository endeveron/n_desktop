export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="anim-fade size-full flex trans-c">
      <div className="relative size-full md:w-[400px] flex-center">
        {children}
      </div>
      <div className="relative max-md:hidden flex-1 flex-center bg-area select-none">
        {/* <AppIcon className="anim-fade w-64 h-64 text-background" /> */}
      </div>
    </div>
  );
}
