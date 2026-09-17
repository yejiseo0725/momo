"use client";

function getUserInitial(name) {
  if (typeof name !== "string" || name.trim().length === 0) {
    return "?";
  }

  return Array.from(name.trim())[0];
}

export default function UserAvatar({ image, name, size = "small" }) {
  const imageUrl = typeof image === "string" ? image.trim() : "";
  const accessibleName = name ? `${name} 프로필 이미지` : "사용자 프로필 이미지";

  return (
    <span
      className={`user-avatar user-avatar-${size}`}
      role="img"
      aria-label={accessibleName}
    >
      <span aria-hidden="true">{getUserInitial(name)}</span>
      {imageUrl ? (
        // 임의의 인증 제공자 URL을 표시하므로 Next Image의 고정 원격 호스트 설정을 사용하지 않는다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="user-avatar-image"
          src={imageUrl}
          alt=""
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
    </span>
  );
}
