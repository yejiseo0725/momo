export default function FormMessage({ error, message }) {
  if (!error && !message) {
    return null;
  }

  return (
    <small
      className={error ? "form-error" : "form-message"}
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      {error || message}
    </small>
  );
}
