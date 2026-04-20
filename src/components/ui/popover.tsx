import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 origin-[--radix-popover-content-transform-origin] rounded-[15px] border border-[#f2f4f4] bg-white shadow-[0_8px_32px_rgba(12,22,41,0.12)] outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex w-full flex-col gap-1 rounded-t-[15px] border-b border-[#f2f4f4] px-4 py-3', className)} {...props} />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm font-semibold text-[#1F3649]', className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-xs text-[#5a6061]', className)} {...props} />;
}

function PopoverBody({ children, className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-2', className)} {...props}>{children}</div>;
}

function PopoverFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('grid w-full gap-2 rounded-b-[15px] border-t border-[#f2f4f4] px-3 py-2.5', className)} {...props} />
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor {...props} />;
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverHeader, PopoverTitle, PopoverDescription, PopoverFooter, PopoverAnchor, PopoverClose };
