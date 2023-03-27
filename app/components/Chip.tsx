export default function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full px-3 py-1 bg-[rgba(0,0,0,0.1)] text-sm">
      {children}
    </div>
  );
}
