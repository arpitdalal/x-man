import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/Dialog";
import MyLinkBtn from "~/components/MyLinkBtn";

export default function ModalMessage({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
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
