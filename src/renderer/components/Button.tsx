import { memo } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    loading?: boolean;
    icon?: ReactNode;
}

const Button = memo(function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold tracking-wide uppercase
    transition-all duration-150
    no-select btn-press
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      bg-tab-home text-black
      shadow-brutalist
      hover:shadow-brutalist-sm hover:translate-x-0.5 hover:translate-y-0.5
    `,
        secondary: `
      bg-surface-light text-white border border-white/20
      hover:bg-white/10
    `,
        ghost: `
      bg-transparent text-white/80
      hover:text-white hover:bg-white/5
    `,
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    );
});

export default Button;
