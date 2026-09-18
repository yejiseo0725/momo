import UserAvatar from '@/components/UserAvatar';

export default function UserInfo({
  image,
  name,
  label,
  size = 'sm',
  className = '',
  children,
}) {
  const isLarge = size === 'large' || size === 'lg';
  const isMedium = size === 'medium' || size === 'md';
  const avatarSize = isLarge ? 'large' : isMedium ? 'medium' : 'small';
  const textSize = isLarge ? 'text-lg' : 'text-sm';

  return (
    <div className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      {label ? (
        <span className="text-muted text-sm shrink-0">{label}</span>
      ) : null}
      <UserAvatar image={image} name={name} size={avatarSize} />
      <span className={`font-medium ${textSize} truncate`}>
        {name || '알 수 없는 사용자'}
      </span>
      {children}
    </div>
  );
}
