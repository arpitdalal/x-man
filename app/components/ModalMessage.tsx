import * as Dialog from "@radix-ui/react-dialog";
import MyLinkBtn from "~/components/MyLinkBtn";

export default function ModalMessage({
  title,
  message,
}: {
  title: string;
  message: React.ReactNode;
}) {
  return (
    <Dialog.Root defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-[rgba(0,0,0,0.2)] backdrop-blur data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="overflow-auto data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-day-100 dark:bg-night-500 p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]  focus:outline-none dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px] text-center">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-night-300 mt-2 text-[15px] leading-normal">
            {message}
          </Dialog.Description>
          <p className="mt-5">
            <MyLinkBtn to="/app" size="sm">
              Go to dashboard
            </MyLinkBtn>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
