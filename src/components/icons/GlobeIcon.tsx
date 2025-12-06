// https://www.svgrepo.com/svg/532531/globe

export function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 12H20M4 12C4 16.4183 7.58172 20 12 20M4 12C4 7.58172 7.58172 4 12 4M20 12C20 16.4183 16.4183 20 12 20M20 12C20 7.58172 16.4183 4 12 4M12 20C5.56054 12.96 9.3169 6.4 12 4M12 20C18.4395 12.96 14.6831 6.4 12 4" />
    </svg>
  );
}
