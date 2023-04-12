export default function FullPageCenter({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
  return (
    <div className="h-safe-screen flex flex-col items-center justify-center px-5 lg:px-20">
      <div className="mx-auto max-w-8xl text-center">
        <h1 className="text-5xl">{title}</h1>
        <p className="mt-3 text-2xl">{message}</p>
      </div>
    </div>
  );
}
