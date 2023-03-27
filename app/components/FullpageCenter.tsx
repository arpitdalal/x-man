export default function FullPageCenter({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
  return (
    <div className="h-screen flex items-center justify-center flex-col px-5 lg:px-20">
      <div className="max-w-8xl mx-auto text-center">
        <h1 className="text-5xl">{title}</h1>
        <p className="mt-3 text-2xl">{message}</p>
      </div>
    </div>
  );
}
