import { useRouter, usePathname } from 'next/navigation';

/**
 * Custom hook for navigation logic.
 * Keeps the component focused on UI and offloads route handling.
 */
export const useNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return {
    navigateTo,
    isActive,
    pathname,
  };
};
