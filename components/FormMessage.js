import { Description, ErrorMessage } from "@heroui/react";

export default function FormMessage({ error, message }) {
  if (!error && !message) {
    return null;
  }

  if (error) {
    return <ErrorMessage role="alert">{error}</ErrorMessage>;
  }

  return <Description role="status">{message}</Description>;
}
