import { useHydrated } from "remix-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/Dialog";
import MyLinkBtn from "~/components/MyLinkBtn";
import PageOverlayCenter from "~/components/PageOverlayCenter";

export default function ModalMessage({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
  const isHydrated = useHydrated();
  if (!isHydrated) {
    return (
      <PageOverlayCenter className="px-4">
        <div className="mx-auto max-w-4xl rounded-lg bg-day-100 p-8 text-center dark:bg-night-500">
          <h1 className="text-5xl">Something went wrong</h1>
          <p className="mt-3 text-2xl">
            Looks like Javascript didn't load. Either because of bad network or
            your browser has disabled Javascript. Please reload the page or try
            again later.
          </p>
        </div>
      </PageOverlayCenter>
    );
  }

  return (
    <Dialog open modal>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 text-[15px] leading-normal text-night-300">
          {message}
        </DialogDescription>
        <p className="mt-5">
          <MyLinkBtn to="/app" size="sm">
            Go to dashboard
          </MyLinkBtn>
        </p>
      </DialogContent>
    </Dialog>
  );
}
