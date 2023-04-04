export default function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md px-3 py-1 bg-dark-muted-100 text-sm ${className}`}
    >
      {children}
    </div>
  );
}
