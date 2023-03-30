export default function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full px-3 py-1 bg-dark-muted-100 text-sm">
      {children}
    </div>
  );
}
