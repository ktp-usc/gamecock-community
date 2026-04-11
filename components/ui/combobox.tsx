"use client";

import * as React from "react";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";

const Combobox = ComboboxPrimitive.Root;

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <div className="relative">
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        className={cn(
          "flex h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-20 text-lg text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[#7a1c1c] focus:ring-4 focus:ring-[#7a1c1c]/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
          className,
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-2 text-slate-500">
        <ComboboxPrimitive.Clear
          data-slot="combobox-clear"
          className="pointer-events-auto inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </ComboboxPrimitive.Clear>
        <ComboboxPrimitive.Icon data-slot="combobox-icon">
          <ChevronsUpDown className="size-5" />
        </ComboboxPrimitive.Icon>
      </div>
    </div>
  );
}

function ComboboxContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Positioner>) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        data-slot="combobox-positioner"
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-popup"
          className={cn(
            "w-(--anchor-width) max-h-[min(var(--available-height),23rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white px-2 pt-1 pb-2 shadow-[0_18px_40px_rgba(0,0,0,0.16)] outline-none transition-[transform,opacity] data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98]",
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "px-3 py-6 text-center text-sm text-slate-500 empty:hidden",
        className,
      )}
      {...props}
    />
  );
}

type ComboboxListProps = React.ComponentProps<typeof ComboboxPrimitive.List>;

function ComboboxList({
  className,
  ...props
}: ComboboxListProps) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("space-y-1 pt-0", className)}
      {...props}
    />
  );
}

type ComboboxItemProps = React.ComponentProps<typeof ComboboxPrimitive.Item>;

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-base text-slate-950 outline-none select-none data-[highlighted]:bg-slate-100",
        className,
      )}
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator data-slot="combobox-item-indicator">
        <Check className="size-4 text-[#7a1c1c]" />
      </ComboboxPrimitive.ItemIndicator>
      <span className="truncate">{children}</span>
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
};
