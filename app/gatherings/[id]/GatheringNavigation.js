'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@heroui/react';

export default function GatheringNavigation({ gatheringId }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (segment) => {
    const href = `/gatherings/${gatheringId}/${segment}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex w-full flex-row gap-2 md:flex-col" aria-label="모임 메뉴">
      <Button
        type="button"
        variant={isActive('challenges') ? 'primary' : 'tertiary'}
        aria-current={isActive('challenges') ? 'page' : undefined}
        onPress={() => router.push(`/gatherings/${gatheringId}/challenges`)}
      >
        챌린지
      </Button>
      <Button
        type="button"
        variant={isActive('schedules') ? 'primary' : 'tertiary'}
        aria-current={isActive('schedules') ? 'page' : undefined}
        onPress={() => router.push(`/gatherings/${gatheringId}/schedules`)}
      >
        일정
      </Button>
      <Button
        type="button"
        variant={isActive('cash-books') ? 'primary' : 'tertiary'}
        aria-current={isActive('cash-books') ? 'page' : undefined}
        onPress={() => router.push(`/gatherings/${gatheringId}/cash-books`)}
      >
        가계부
      </Button>
      <Button
        type="button"
        variant={isActive('chat') ? 'primary' : 'tertiary'}
        aria-current={isActive('chat') ? 'page' : undefined}
        onPress={() => router.push(`/gatherings/${gatheringId}/chat`)}
      >
        채팅
      </Button>
    </div>
  );
}
