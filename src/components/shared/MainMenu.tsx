'use client';

import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

import { LightbulbIcon } from '@/components/icons/LightbulbIcon';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { MoonIcon } from '@/components/icons/MoonIcon';
import { SignOutIcon } from '@/components/icons/SignOutIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/DropdownMenu';
import { cn } from '@/utils';
import { useSessionClient } from '@/features/auth/hooks/useSessionClient';
import {
  MAIN_MENU_TITLE,
  SIGN_OUT_LABEL,
  THEME_LABEL_DARK,
  THEME_LABEL_LIGHT,
  THEME_LABEL_SUFFIX,
} from '@/translations/en';

type MainMenuProps = {
  className?: string;
};

const MainMenu = ({ className }: MainMenuProps) => {
  const { session } = useSessionClient();
  const { setTheme, theme } = useTheme();

  const userData = useMemo(() => {
    if (!session) return null;

    return {
      email: session.user.email,
      name: session.user.name,
    };
  }, [session]);

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleSignOut = () => {
    signOut();
  };

  const themeIcon =
    theme === 'light' ? (
      <MoonIcon className="text-icon" />
    ) : (
      <LightbulbIcon className="text-icon" />
    );

  return (
    <div className={cn('main-menu h-6', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger title={MAIN_MENU_TITLE}>
          <MenuIcon className="icon--action" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="cursor-default px-4 py-2">
            {userData?.name ? (
              <div className="text-lg font-bold text-accent">
                {userData.name}
              </div>
            ) : null}
            {userData ? (
              <div className="text-sm text-muted">{userData.email}</div>
            ) : null}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleToggleTheme}>
            {themeIcon}
            {theme === 'light'
              ? `${THEME_LABEL_DARK}${THEME_LABEL_SUFFIX}`
              : `${THEME_LABEL_LIGHT}${THEME_LABEL_SUFFIX}`}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleSignOut}>
            <SignOutIcon className="text-icon flip-x" />
            {SIGN_OUT_LABEL}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

MainMenu.displayName = 'MainMenu';

export default MainMenu;
