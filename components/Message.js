export default function Message({ error, message }) {
  if (!error && !message) {
    return null;
  }

  return (
    <p className={`notice${error ? " error-notice" : ""}`} role={error ? "alert" : "status"}>
      {error || message}
    </p>
  );
}
