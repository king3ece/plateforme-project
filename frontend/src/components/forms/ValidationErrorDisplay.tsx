import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface ValidationErrorsProps {
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export function ValidationErrors({ errors }: ValidationErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <div className="font-semibold mb-2">
          Veuillez corriger les erreurs suivantes:
        </div>
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

export function FormFieldError({ error, className = "" }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <p className={`text-sm text-red-600 mt-1 font-medium ${className}`}>
      <span className="inline-block mr-1">•</span>
      {error}
    </p>
  );
}

interface FormInputWithErrorProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const FormInputWithError = React.forwardRef<
  HTMLInputElement,
  FormInputWithErrorProps
>(({ error, label, className = "", ...props }, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <input
        ref={ref}
        className={`
            px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              error
                ? "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:ring-blue-500"
            }
            ${className}
          `}
        {...props}
      />
      {error && <FormFieldError error={error} />}
    </div>
  );
});

FormInputWithError.displayName = "FormInputWithError";

interface FormSelectWithErrorProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const FormSelectWithError = React.forwardRef<
  HTMLSelectElement,
  FormSelectWithErrorProps
>(({ error, label, options, className = "", ...props }, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2">{label}</label>
      )}
      <select
        ref={ref}
        className={`
            px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              error
                ? "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:ring-blue-500"
            }
            ${className}
          `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <FormFieldError error={error} />}
    </div>
  );
});

FormSelectWithError.displayName = "FormSelectWithError";
