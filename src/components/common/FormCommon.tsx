import * as React from "react";
import type { ReactNode } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import {
  CalendarIcon,
  CameraIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { Typography } from "@/components/common/Typography";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input as BaseInput } from "@/components/ui/input";
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RadioGroup as BaseRadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select as BaseSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FieldOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

type SharedFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: ReactNode;
  /** When true, shows a red asterisk after the label. Omit for optional fields. */
  required?: boolean;
  description?: ReactNode;
  placeholder?: string;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  showMessage?: boolean;
};

type FormCommonProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  children: ReactNode;
  className?: string;
};

type InputProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Omit<
      React.ComponentProps<typeof BaseInput>,
      | "className"
      | "defaultValue"
      | "disabled"
      | "name"
      | "onBlur"
      | "onChange"
      | "placeholder"
      | "value"
    >;

type TextareaProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> &
    Omit<
      React.ComponentProps<typeof BaseTextarea>,
      | "className"
      | "defaultValue"
      | "disabled"
      | "name"
      | "onBlur"
      | "onChange"
      | "placeholder"
      | "value"
    >;

type SelectProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    options: FieldOption[];
    contentClassName?: string;
  };

type RadioGroupProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    options: FieldOption[];
  };

type CheckboxProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    checkboxClassName?: string;
  };

type DatePickerProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    displayFormat?: "mdy" | "dmy";
    /** Adds this many years beyond the current year to the year dropdown (e.g. license expiry). */
    calendarYearsFuture?: number;
  };

type ImagePickerProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    accept?: string;
    helperText?: ReactNode;
    previewClassName?: string;
    variant?: "preview" | "compact" | "avatar" | "profile-document";
    /** Shown when no new file is selected (e.g. current upload from session). */
    existingImageUrl?: string | null;
  };

type ImagePickerControlProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> & {
  value: unknown;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  accept: string;
  className?: string;
  helperText?: ReactNode;
  previewClassName?: string;
  variant?: "preview" | "compact" | "avatar" | "profile-document";
  existingImageUrl?: string | null;
};

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      as="span"
      variant="label"
      color="inherit"
      className="inline-flex items-center gap-0.5"
    >
      {children}
      {required ? (
        <span className="font-semibold text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </Typography>
  );
}

function FieldDescription({ children }: { children: ReactNode }) {
  return (
    <FormDescription>
      <Typography as="span" variant="body-sm" color="inherit">
        {children}
      </Typography>
    </FormDescription>
  );
}

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(2000, index, 1),
  ),
);

function getYearOptionsForCalendar(visibleYear: number, extraFutureYears = 0) {
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(
    currentYear + extraFutureYears,
    visibleYear,
    currentYear,
  );
  const minYear = Math.min(currentYear - 120, visibleYear);
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y -= 1) {
    years.push(y);
  }
  return years;
}

const calendarSelectClassName =
  "h-9 shrink-0 rounded-md border border-[#D7DAE1] bg-white px-2 text-sm text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value !== "string" || !value) {
    return undefined;
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(value: unknown, displayFormat: "mdy" | "dmy") {
  const date = parseDateValue(value);

  if (!date) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return displayFormat === "dmy"
    ? `${day}/${month}/${year}`
    : `${month}/${day}/${year}`;
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function DatePickerControl({
  value,
  onChange,
  placeholder = "mm/dd/yyyy",
  disabled,
  className,
  displayFormat = "mdy",
  calendarYearsFuture = 0,
}: {
  value: unknown;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayFormat?: "mdy" | "dmy";
  calendarYearsFuture?: number;
}) {
  const selectedDate = parseDateValue(value);
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(
    selectedDate ?? new Date(),
  );
  const formattedValue = formatDateValue(value, displayFormat);
  const calendarCells = getCalendarCells(visibleMonth);
  const yearOptions = React.useMemo(
    () =>
      getYearOptionsForCalendar(
        visibleMonth.getFullYear(),
        calendarYearsFuture,
      ),
    [visibleMonth, calendarYearsFuture],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setVisibleMonth(selectedDate ?? new Date());
    }

    setOpen(nextOpen);
  };

  const moveMonth = (amount: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FormControl>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-md border border-[#D7DAE1] bg-white px-4 text-left text-[15px] text-[#25314D] shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-colors outline-none hover:border-primary/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
              !formattedValue && "text-[#8B96AD]",
              className,
            )}
          >
            <span>{formattedValue || placeholder}</span>
            <CalendarIcon className="size-4 shrink-0 text-[#6B7890]" />
          </button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,340px)] min-w-[290px] p-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#25314D] hover:bg-[#F0F1F7]"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <BaseSelect
            value={String(visibleMonth.getMonth())}
            onValueChange={(value: string) => {
              setVisibleMonth(
                new Date(visibleMonth.getFullYear(), Number(value), 1),
              );
            }}
          >
            <SelectTrigger
              aria-label="Month"
              size="sm"
              className={cn(
                calendarSelectClassName,
                "min-w-0 flex-1 shadow-xs",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-60">
              {MONTH_LABELS.map((label, index) => (
                <SelectItem key={label} value={String(index)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </BaseSelect>
          <BaseSelect
            value={String(visibleMonth.getFullYear())}
            onValueChange={(value: string) => {
              setVisibleMonth(
                new Date(Number(value), visibleMonth.getMonth(), 1),
              );
            }}
          >
            <SelectTrigger
              aria-label="Year"
              size="sm"
              className={cn(
                calendarSelectClassName,
                calendarYearsFuture > 0
                  ? "min-w-[5.25rem] shrink-0"
                  : "w-[4.75rem]",
                "shadow-xs",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-60">
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </BaseSelect>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#25314D] hover:bg-[#F0F1F7]"
            aria-label="Next month"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <Typography
              key={day}
              as="span"
              variant="caption"
              className="flex h-7 items-center justify-center text-[#6B7890]"
            >
              {day}
            </Typography>
          ))}
          {calendarCells.map((day, index) => {
            const selected =
              day && selectedDate && isSameDate(day, selectedDate);

            return day ? (
              <button
                key={toIsoDate(day)}
                type="button"
                onClick={() => {
                  onChange(toIsoDate(day));
                  setOpen(false);
                }}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-md text-sm text-[#25314D] hover:bg-[#F0F1F7]",
                  selected && "bg-primary text-white hover:bg-primary",
                )}
              >
                {day.getDate()}
              </button>
            ) : (
              <span key={`empty-${index}`} className="size-9" />
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#E8E8E8] pt-3">
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-[#6B7890] hover:text-[#25314D]"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="cursor-pointer text-sm font-medium text-primary hover:text-primary/80"
            onClick={() => {
              onChange(toIsoDate(new Date()));
              setOpen(false);
            }}
          >
            Today
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormCommon<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormCommonProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        {children}
      </form>
    </Form>
  );
}

function Input<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  ...props
}: InputProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <FormControl>
            <BaseInput
              {...props}
              {...field}
              value={field.value ?? ""}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
            />
          </FormControl>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

function Textarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  ...props
}: TextareaProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <FormControl>
            <BaseTextarea
              {...props}
              {...field}
              value={field.value ?? ""}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
            />
          </FormControl>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

function Select<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  options,
  contentClassName,
}: SelectProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <BaseSelect
            value={
              field.value == null || field.value === ""
                ? undefined
                : String(field.value)
            }
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn("w-full", className)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={contentClassName}>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </BaseSelect>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

function DatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  placeholder,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  displayFormat = "mdy",
  calendarYearsFuture = 0,
}: DatePickerProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <DatePickerControl
            value={field.value}
            onChange={field.onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            displayFormat={displayFormat}
            calendarYearsFuture={calendarYearsFuture}
          />
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

function RadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  options,
}: RadioGroupProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <FormControl>
            <BaseRadioGroup
              value={field.value == null ? "" : String(field.value)}
              onValueChange={field.onChange}
              disabled={disabled}
              className={className}
            >
              {options.map((option) => {
                const id = `${name}-${option.value}`;

                return (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      id={id}
                      value={option.value}
                      disabled={option.disabled || disabled}
                    />
                    <label
                      htmlFor={id}
                      className={cn(
                        "text-sm leading-none",
                        option.disabled || disabled
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer",
                      )}
                    >
                      <Typography as="span" variant="label" color="inherit">
                        {option.label}
                      </Typography>
                    </label>
                  </div>
                );
              })}
            </BaseRadioGroup>
          </FormControl>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

function Checkbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  checkboxClassName,
}: CheckboxProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn("flex flex-row items-center gap-2.5", itemClassName)}
        >
          <FormControl>
            <BaseCheckbox
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
              className={checkboxClassName}
            />
          </FormControl>
          <div className={cn("grid gap-1.5 leading-none", className)}>
            {label ? (
              <FormLabel>
                <FieldLabel required={required}>{label}</FieldLabel>
              </FormLabel>
            ) : null}
            {description ? (
              <FieldDescription>{description}</FieldDescription>
            ) : null}
            {showMessage ? <FormMessage /> : null}
          </div>
        </FormItem>
      )}
    />
  );
}

function ImagePickerControl({
  value,
  onChange,
  disabled,
  accept,
  className,
  helperText,
  previewClassName,
  variant = "preview",
  existingImageUrl,
  ...rootProps
}: ImagePickerControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isNewFile = typeof File !== "undefined" && value instanceof File;

  const previewUrl = React.useMemo(() => {
    if (isNewFile && value instanceof File) {
      return URL.createObjectURL(value);
    }
    if (typeof value === "string" && value.trim()) {
      return value;
    }
    if (existingImageUrl?.trim()) {
      return existingImageUrl;
    }
    return null;
  }, [value, existingImageUrl, isNewFile]);

  React.useEffect(() => {
    if (isNewFile && previewUrl?.startsWith("blob:")) {
      return () => URL.revokeObjectURL(previewUrl);
    }
    return undefined;
  }, [previewUrl, isNewFile]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onChange(file);
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (variant === "avatar") {
    return (
      <div
        {...rootProps}
        className={cn("flex flex-col items-start gap-2", className)}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative flex size-[7.25rem] shrink-0 items-center justify-center rounded-full border-2 border-[#E8E8E8] bg-[#F9FAFD] shadow-sm outline-none transition-[border-color,box-shadow] hover:border-[#3FA565] focus-visible:ring-2 focus-visible:ring-[#3FA565]/35 disabled:cursor-not-allowed disabled:opacity-60",
            previewClassName,
          )}
          aria-label="Choose vehicle photo"
        >
          <span className="absolute inset-0 z-0 overflow-hidden rounded-full bg-[#F9FAFD]">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center">
                <ImageIcon className="size-10 text-[#B4BFD4]" />
              </span>
            )}
          </span>
          <span className="pointer-events-none absolute bottom-0 right-0 z-20 flex size-9 translate-x-px translate-y-px items-center justify-center rounded-full border-2 border-white bg-[#3FA565] text-white shadow-md ring-1 ring-black/5">
            <CameraIcon className="size-3.5" />
          </span>
        </button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            className="h-8 gap-1 px-2 text-xs text-[#6B7890] hover:text-[#1F1838]"
            onClick={handleRemove}
            disabled={disabled}
          >
            <XIcon className="size-3.5" />
            <Typography as="span" variant="caption" color="inherit">
              Remove photo
            </Typography>
          </Button>
        ) : null}
        {helperText ? (
          <Typography as="span" variant="caption" color="muted">
            {helperText}
          </Typography>
        ) : null}
        <BaseInput
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={handleSelect}
        />
      </div>
    );
  }

  if (variant === "compact") {
    const fileName =
      typeof File !== "undefined" && value instanceof File ? value.name : "";

    return (
      <div {...rootProps} className={cn("grid gap-2", className)}>
        <div className="flex h-10 items-center rounded-md border border-[#D6D9E0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="min-w-0 flex-1 truncate px-4 text-left text-sm text-[#6B7890] outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {fileName || "choose file"}
          </button>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="mr-2 h-7 rounded-md bg-gradient-to-b from-[#747474] to-[#303030] px-4 text-xs text-white shadow-sm hover:from-[#747474] hover:to-[#303030]"
          >
            <Typography as="span" variant="caption" color="inherit">
              Upload
            </Typography>
          </Button>
        </div>
        {helperText ? (
          <Typography as="span" variant="caption" color="muted">
            {helperText}
          </Typography>
        ) : null}
        <BaseInput
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={handleSelect}
        />
      </div>
    );
  }

  if (variant === "profile-document") {
    const fileName =
      typeof File !== "undefined" && value instanceof File ? value.name : "";
    const hasOnFile = Boolean(previewUrl);
    const status = isNewFile
      ? {
          label: "New upload",
          className: "border-[#BFD9F0] bg-[#EBF5FF] text-[#1D4E89]",
          icon: UploadIcon,
        }
      : hasOnFile
        ? {
            label: "Uploaded",
            className: "border-[#C5E6D4] bg-[#EAF6EF] text-[#1F6B43]",
            icon: CheckCircle2Icon,
          }
        : {
            label: "Required",
            className: "border-[#F3D0D0] bg-[#FFF5F5] text-[#B91C1C]",
            icon: CircleAlertIcon,
          };
    const StatusIcon = status.icon;

    return (
      <div
        {...rootProps}
        className={cn(
          "overflow-hidden rounded-[12px] border border-[#E8E8E8] bg-white shadow-[0_4px_14px_rgba(15,23,42,0.04)]",
          className,
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="group relative block w-full aspect-[4/3] overflow-hidden bg-[#F4F6FA] outline-none focus-visible:ring-2 focus-visible:ring-[#3FA565]/40 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={
            hasOnFile ? "Replace document image" : "Upload document image"
          }
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt=""
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-white shadow-sm">
                <ImageIcon className="size-6 text-[#9AA6C8]" />
              </span>
              <Typography
                as="span"
                variant="caption"
                className="text-[#6B7890]"
              >
                No image on file
              </Typography>
            </span>
          )}
          <span
            className={cn(
              "absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
              status.className,
            )}
          >
            <StatusIcon className="size-3 shrink-0" aria-hidden />
            {status.label}
          </span>
          {hasOnFile ? (
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/55 to-transparent py-3 text-[12px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              <CameraIcon className="size-3.5" aria-hidden />
              {isNewFile ? "Change selection" : "Replace"}
            </span>
          ) : null}
        </button>

        <div className="space-y-2 border-t border-[#EEF0F4] px-3 py-3">
          {fileName ? (
            <p className="truncate text-[12px] text-[#6B7890]" title={fileName}>
              {fileName}
            </p>
          ) : null}
          <Button
            type="button"
            variant="primary-outline"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="h-9 w-full rounded-[8px] text-[13px] font-medium"
          >
            {hasOnFile ? "Replace image" : "Upload image"}
          </Button>
          {helperText ? (
            <Typography
              as="p"
              variant="caption"
              className="text-center text-[#8B96AD]"
            >
              {helperText}
            </Typography>
          ) : null}
        </div>

        <BaseInput
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={handleSelect}
        />
      </div>
    );
  }

  return (
    <div {...rootProps} className={cn("grid gap-3", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-background transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          previewClassName,
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="h-full max-h-64 w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <ImageIcon className="size-8 text-muted-foreground" />
            <Typography as="span" variant="label">
              Choose image
            </Typography>
            <Typography as="span" variant="caption" color="muted">
              PNG, JPG, GIF, or WEBP
            </Typography>
          </div>
        )}
        {previewUrl ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <UploadIcon className="size-6 text-white" />
          </span>
        ) : null}
      </button>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <UploadIcon />
          <Typography as="span" variant="label" color="inherit">
            Select image
          </Typography>
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
            disabled={disabled}
          >
            <XIcon />
            <Typography as="span" variant="label" color="inherit">
              Remove
            </Typography>
          </Button>
        ) : null}
      </div>

      <BaseInput
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={handleSelect}
      />
    </div>
  );
}

function ImagePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required,
  description,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  accept = "image/*",
  helperText,
  previewClassName,
  variant = "preview",
  existingImageUrl,
}: ImagePickerProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel required={required}>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <FormControl>
            <ImagePickerControl
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              accept={accept}
              className={className}
              helperText={helperText}
              previewClassName={previewClassName}
              variant={variant}
              existingImageUrl={existingImageUrl}
            />
          </FormControl>
          {description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}

export {
  Checkbox,
  DatePicker,
  FormCommon,
  ImagePicker,
  Input,
  RadioGroup,
  Select,
  Textarea,
};
