
import { cn as myCn } from '@udecode/cn';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return myCn(clsx(inputs));
}
