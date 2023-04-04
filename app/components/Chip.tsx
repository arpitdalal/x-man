export default function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md bg-dark-muted-100 px-3 py-1 text-sm ${className}`}
    >
      {children}
    </div>
  );
}
