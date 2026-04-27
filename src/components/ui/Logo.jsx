// Brand mark (gear + bolt). Substitution flag in design system: a real garage
// logo can replace this if one exists.
export default function Logo({ size = 28, className }) {
  return (
    <img
      src="/logo.svg"
      alt="VPS"
      width={size}
      height={size}
      className={className}
    />
  );
}
