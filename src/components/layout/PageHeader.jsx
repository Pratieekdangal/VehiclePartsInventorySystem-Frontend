// Section heading inside the main content area — pairs with the Topbar.
// kit.css equivalent of `.section-head`.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="min-w-0">
        <h2 className="font-display font-bold text-2xl tracking-h2 text-fg-1">{title}</h2>
        {subtitle && <p className="vps-body-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}
