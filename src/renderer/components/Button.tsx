import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    loading?: boolean;
    icon?: ReactNode;
    disabled?: boolean; // Re-declare disabled as it might be relevant for styling logic
}

const Button = memo(function Button({
    variant = 'primary',
    size = 'md',
    children,
    loading = false,
    icon,
    className = '',
    disabled,
    onClick,
    ...props
}: ButtonProps) {
    const baseStyles = `
    relative inline-flex items-center justify-center gap-2
    font-display font-bold tracking-widest-tech uppercase
    no-select border transition-colors duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variants = {
        primary: `
      bg-brand-primary text-deep border-brand-primary
      hover:bg-amber-300
    `,
        secondary: `
      bg-surface text-white border-white-10
      hover:bg-white-5 hover:border-white/30
    `,
        ghost: `
      bg-transparent text-text-muted border-transparent
      hover:text-white
    `,
        glow: `
      bg-surface text-brand-primary border-brand-primary/20
      shadow-[0_0_20px_rgba(251,191,36,0.1)]
      hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:border-brand-primary/50
    `
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs min-h-[36px]',
        md: 'px-6 py-3 text-sm min-h-[44px]',
        lg: 'px-10 py-4 text-sm min-h-[56px]',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {/* Loading Spinner Overlap */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Content (Hidden when loading to preserve width) */}
            <div className={`flex items-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {icon && <span className="inline-block">{icon}</span>}
                {children}
            </div>
        </motion.button>
    );
});

export default Button;
