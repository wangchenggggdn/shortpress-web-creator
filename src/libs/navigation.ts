import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import appConfig from '@/appConfig';

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales: appConfig.locales });
