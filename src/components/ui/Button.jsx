import { cn } from '../../lib/cn';

// Variants & sizes mirror kit.css `.btn-*`.
const variantClasses = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
  secondary:
    'bg-surface text-fg-1 border border-border-strong hover:bg-bg-subtle',
  ghost:
    'bg-transparent text-fg-2 hover:bg-bg-subtle hover:text-fg-1',
  danger:
    'bg-crimson-500 text-white hover:bg-crimson-600 active:bg-crimson-700',
  amber:
    'bg-amber-400 text-amber-700 hover:bg-amber-300 active:bg-amber-500',
};

const sizeClasses = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 [&_svg]:w-3 [&_svg]:h-3',
  md: 'px-3.5 py-2 text-sm gap-1.5 [&_svg]:w-3.5 [&_svg]:h-3.5',
  lg: 'px-4 py-2.5 text-base gap-2 [&_svg]:w-4 [&_svg]:h-4',
  icon: 'p-1.5 [&_svg]:w-4 [&_svg]:h-4',
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  type = 'button',
  className,
  disabled,
  children,
  ...rest
}) {
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-sm transition-colors duration-fast ease-standard',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:shadow-focus focus-visible:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}
