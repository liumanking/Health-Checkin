import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClass: Record<Variant, string> = {
  primary: 'bg-indigo-500 text-white active:bg-indigo-600 disabled:bg-indigo-300',
  secondary:
    'bg-indigo-50 text-indigo-600 active:bg-indigo-100 disabled:text-indigo-300',
  ghost: 'bg-transparent text-gray-700 active:bg-gray-100 disabled:text-gray-300',
  danger: 'bg-red-500 text-white active:bg-red-600 disabled:bg-red-300',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

/** 最小觸控 44px（min-h-11 = 2.75rem = 44px）。 */
export function Button({
  variant = 'primary',
  block = false,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-base font-medium transition-colors ${variantClass[variant]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    />
  );
}
