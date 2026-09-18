import { Card, Chip } from '@heroui/react';

import UserInfo from '@/components/UserInfo';
import Image from 'next/image';
import Link from 'next/link';

export default function GatheringCard({ gathering, loading = 'eager' }) {
  const isFull = gathering.memberCount >= gathering.maxMemCount;

  return (
    <Card className="overflow-hidden border-none bg-white/80 p-0 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <Link
        href={`/gatherings/${gathering.id}`}
        aria-label={`${gathering.name} 모임 보기`}
        className="group relative block aspect-square w-full overflow-hidden"
      >
        <Image
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={gathering.imageUrl || '/placeholder-image.png'}
          alt={
            gathering.imageUrl
              ? `${gathering.name} 모임 이미지`
              : '모임 기본 이미지'
          }
          width={400}
          height={400}
          loading={loading}
          unoptimized
        />

        <div className="absolute top-4 right-4 z-10 flex flex-wrap justify-end gap-2">
          <Chip
            size="md"
            className="rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm"
          >
            {gathering.isPublic ? '공개 모임' : '비공개 모임'}
          </Chip>
          <Chip
            size="md"
            className={`rounded-full shadow-sm backdrop-blur-sm ${
              isFull
                ? 'bg-warning text-warning-foreground font-semibold'
                : 'bg-white/90 text-foreground'
            }`}
          >
            {gathering.memberCount} / {gathering.maxMemCount}명
          </Chip>
        </div>

        {/* 카드 하단에서 사진 위로 자연스럽게 올라가는 그라데이션 */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface via-surface/80 to-transparent"
          aria-hidden="true"
        />
      </Link>

      {/* 카드 본문: 모임 제목이 사진 하단 위로 살짝 오버랩 */}
      <div className="relative -mt-8 z-10 flex flex-1 flex-col gap-3 px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            size="md"
            className="rounded-full bg-accent-sky text-primary font-medium"
          >
            {gathering.category}
          </Chip>
          <Link
            href={`/gatherings/${gathering.id}`}
            className="line-clamp-1 font-bold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {gathering.name}
          </Link>
          {gathering.role === 'LEADER' ? (
            <Chip
              size="md"
              className="bg-accent-pink text-white font-semibold shadow-xs"
            >
              모임장
            </Chip>
          ) : null}
        </div>

        <span className="text-muted">{gathering.region}</span>

        <p className="line-clamp-2 text-muted">{gathering.description}</p>

        <div className="mt-auto -mx-4 flex items-center justify-start gap-4 border-t border-border px-4 pt-3">
          <UserInfo name={gathering.creatorName} image={gathering.creatorImage} />
        </div>
      </div>
    </Card>
  );
}
