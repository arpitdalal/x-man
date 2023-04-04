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
    <Dialog.Root open defaultOpen modal>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-day-100 p-[25px] text-center shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]  focus:outline-none dark:bg-night-500 dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]">
          <Dialog.Title className="m-0 text-[17px] font-medium">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-[15px] leading-normal text-night-300">
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
