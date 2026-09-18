import { Avatar } from "@heroui/react";

function getUserInitial(name) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "?";
  }

  return Array.from(name.trim())[0];
}

export default function UserAvatar({ image, name, size = "small" }) {
  const imageUrl = typeof image === "string" ? image.trim() : "";
  const accessibleName = name ? `${name} 프로필 이미지` : "사용자 프로필 이미지";
  const avatarSize =
    size === 'large' || size === 'lg'
      ? 'lg'
      : size === 'medium' || size === 'md'
        ? 'md'
        : 'sm';

  return (
    <Avatar size={avatarSize}>
      {imageUrl ? <Avatar.Image alt={accessibleName} src={imageUrl} /> : null}
      <Avatar.Fallback>{getUserInitial(name)}</Avatar.Fallback>
    </Avatar>
  );
}
