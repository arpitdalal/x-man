import * as Tooltip from "@radix-ui/react-tooltip";

export default function MyTooltip({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="radix-state-open:data-[side=top]:animate-slideDownAndFade radix-state-open:data-[side=right]:animate-slideLeftAndFade radix-state-open:data-[side=left]:animate-slideRightAndFade radix-state-open:data-[side=bottom]:animate-slideUpAndFade text-violet11 z-50 select-none rounded-lg bg-day-100 px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] dark:bg-night-500 dark:shadow-[hsl(0_0%_0%_/_35%)_0px_10px_38px_-10px,_hsl(0_0%_0%_/_35%)_0px_10px_20px_-15px]"
            sideOffset={5}
          >
            {title}
            <Tooltip.Arrow className="fill-day-100 dark:fill-night-500" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
