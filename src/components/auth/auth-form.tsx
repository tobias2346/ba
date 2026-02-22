'use client'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

type AuthFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>
  name: FieldPath<T>
  label: string
  placeholder?: string
  type?: string
  disabled?: boolean
  maxLength?: number
}

export function AuthFormField<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  maxLength,
}: AuthFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormLabel className="text-sm font-normal">{label}</FormLabel>
          <FormControl className="border-none">
            <Input
              {...field}
              placeholder={placeholder}
              type={type}
              disabled={disabled}
              maxLength={maxLength}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
