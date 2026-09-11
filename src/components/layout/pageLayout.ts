/** Shared flex classes for sidebar pages (table vs scrollable forms). */

/** Page inset for sidebar routes (keep off overflow-hidden shells). */
export const SIDEBAR_PAGE_PADDING = "px-7 pb-4 pt-3";

export const PAGE_SHELL =
  "flex min-h-0 flex-1 basis-0 flex-col overflow-hidden";

export const SCROLL_PAGE =
  "flex min-h-0 flex-1 basis-0 flex-col overflow-y-auto overflow-x-hidden";

export const TABLE_SECTION =
  "flex min-h-0 flex-1 basis-0 flex-col overflow-hidden";

/** Deepest scroll boundary before the table body. */
export const TABLE_SLOT =
  "flex h-0 min-h-0 flex-1 basis-0 flex-col overflow-hidden";
