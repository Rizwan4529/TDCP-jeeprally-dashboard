import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type LightboxImage = {
  src: string;
  label: string;
};

/** Full-screen image viewer with prev/next navigation (buttons + arrow keys). */
export function ImageLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: LightboxImage[];
  /** Index of the open image; `null` closes the lightbox. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const open = index !== null && images.length > 0;
  const current = open ? images[Math.min(index, images.length - 1)] : null;
  const hasMany = images.length > 1;

  const go = React.useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndexChange],
  );

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/85 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none sm:p-10"
          onKeyDown={(e) => {
            if (!hasMany) return;
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <DialogPrimitive.Title className="sr-only">
            {current?.label ?? "Image preview"}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Use the left and right arrow keys to switch images.
          </DialogPrimitive.Description>

          <DialogPrimitive.Close
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <XIcon className="size-5" />
          </DialogPrimitive.Close>

          {hasMany && (
            <>
              <LightboxNavButton
                side="left"
                label="Previous image"
                onClick={() => go(-1)}
              />
              <LightboxNavButton
                side="right"
                label="Next image"
                onClick={() => go(1)}
              />
            </>
          )}

          {current && (
            <img
              key={current.src}
              src={current.src}
              alt={current.label}
              className="max-h-[80vh] max-w-full rounded-md object-contain shadow-2xl"
            />
          )}

          <p className="mt-4 text-center text-[14px] font-medium text-white">
            {current?.label}
            {hasMany && index !== null && (
              <span className="ml-2 text-white/60">
                {index + 1} / {images.length}
              </span>
            )}
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function LightboxNavButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6",
      )}
    >
      <Icon className="size-6" />
    </button>
  );
}
