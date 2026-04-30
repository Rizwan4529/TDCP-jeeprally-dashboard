import * as React from "react"
import type { ReactNode } from "react"
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form"
import { ImageIcon, UploadIcon, XIcon } from "lucide-react"

import { Typography } from "@/components/common/Typography"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input as BaseInput } from "@/components/ui/input"
import { Checkbox as BaseCheckbox } from "@/components/ui/checkbox"
import { RadioGroup as BaseRadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select as BaseSelect,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea as BaseTextarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type FieldOption = {
  label: ReactNode
  value: string
  disabled?: boolean
}

type SharedFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label?: ReactNode
  description?: ReactNode
  placeholder?: string
  className?: string
  itemClassName?: string
  disabled?: boolean
  showMessage?: boolean
}

type FormCommonProps<TFieldValues extends FieldValues> = {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  children: ReactNode
  className?: string
}

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
    >

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
    >

type SelectProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    options: FieldOption[]
    contentClassName?: string
  }

type RadioGroupProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    options: FieldOption[]
  }

type CheckboxProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    checkboxClassName?: string
  }

type ImagePickerProps<TFieldValues extends FieldValues> =
  SharedFieldProps<TFieldValues> & {
    accept?: string
    previewClassName?: string
  }

type ImagePickerControlProps = Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> & {
  value: unknown
  onChange: (file: File | null) => void
  disabled?: boolean
  accept: string
  className?: string
  previewClassName?: string
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography as="span" variant="label" color="inherit">
      {children}
    </Typography>
  )
}

function FieldDescription({ children }: { children: ReactNode }) {
  return (
    <FormDescription>
      <Typography as="span" variant="body-sm" color="inherit">
        {children}
      </Typography>
    </FormDescription>
  )
}

function FormCommon<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: FormCommonProps<TFieldValues>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        {children}
      </form>
    </Form>
  )
}

function Input<TFieldValues extends FieldValues>({
  control,
  name,
  label,
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
              <FieldLabel>{label}</FieldLabel>
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
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  )
}

function Textarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
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
              <FieldLabel>{label}</FieldLabel>
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
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  )
}

function Select<TFieldValues extends FieldValues>({
  control,
  name,
  label,
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
              <FieldLabel>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <BaseSelect
            value={field.value == null ? "" : String(field.value)}
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
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  )
}

function RadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  label,
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
              <FieldLabel>{label}</FieldLabel>
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
                const id = `${name}-${option.value}`

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
                          : "cursor-pointer"
                      )}
                    >
                      <Typography as="span" variant="label" color="inherit">
                        {option.label}
                      </Typography>
                    </label>
                  </div>
                )
              })}
            </BaseRadioGroup>
          </FormControl>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  )
}

function Checkbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
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
        <FormItem className={cn("flex flex-row items-start gap-3", itemClassName)}>
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
                <FieldLabel>{label}</FieldLabel>
              </FormLabel>
            ) : null}
            {description ? <FieldDescription>{description}</FieldDescription> : null}
            {showMessage ? <FormMessage /> : null}
          </div>
        </FormItem>
      )}
    />
  )
}

function ImagePickerControl({
  value,
  onChange,
  disabled,
  accept,
  className,
  previewClassName,
  ...rootProps
}: ImagePickerControlProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const previewUrl = React.useMemo(() => {
    if (typeof File !== "undefined" && value instanceof File) {
      return URL.createObjectURL(value)
    }

    return typeof value === "string" ? value : null
  }, [value])

  React.useEffect(() => {
    if (typeof File !== "undefined" && value instanceof File && previewUrl) {
      return () => URL.revokeObjectURL(previewUrl)
    }

    return undefined
  }, [previewUrl, value])

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    onChange(file)
  }

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onChange(null)

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div {...rootProps} className={cn("grid gap-3", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex min-h-40 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-background transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          previewClassName
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
  )
}

function ImagePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  itemClassName,
  disabled,
  showMessage = true,
  accept = "image/*",
  previewClassName,
}: ImagePickerProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={itemClassName}>
          {label ? (
            <FormLabel>
              <FieldLabel>{label}</FieldLabel>
            </FormLabel>
          ) : null}
          <FormControl>
            <ImagePickerControl
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              accept={accept}
              className={className}
              previewClassName={previewClassName}
            />
          </FormControl>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  )
}

export {
  Checkbox,
  FormCommon,
  ImagePicker,
  Input,
  RadioGroup,
  Select,
  Textarea,
}
