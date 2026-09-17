import { Alert } from "@heroui/react";

export default function Message({ error, message }) {
  if (!error && !message) {
    return null;
  }

  return (
    <Alert status={error ? "danger" : "success"} role={error ? "alert" : "status"}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{error || message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
