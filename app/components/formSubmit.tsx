import * as React from "react";
import { useIsSubmitting } from "remix-validated-form";

type InputProps = {
  label: string,
  labelSubmitting: string
}

export default function SubmitButton({
  label,
  labelSubmitting
}:InputProps) {
  const isSubmitting = useIsSubmitting();

  return (
    <button type="submit" disabled={isSubmitting} className="btn btn-danger">
      {isSubmitting ? labelSubmitting: label }
    </button>
  );
};