'use client';

import { Card, Chip, Disclosure } from '@heroui/react';
import Link from 'next/link';
import UserInfo from '@/components/UserInfo';

export default function ChallengeCard({ challenge, gatheringId }) {
  return (
    <Card>
      <Disclosure>
        <Card.Header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 좌측: [인증방식 칩 맨 앞] + 제목 + 날짜 + 펼침(Disclosure) 토글 */}
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <Chip
                size="md"
                className={
                  challenge.useImage
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-tertiary text-tertiary-foreground font-semibold'
                }
              >
                {challenge.useImage ? '이미지 인증' : '텍스트 인증'}
              </Chip>

              <Card.Title>
                <Link
                  className="link font-bold text-lg"
                  href={`/gatherings/${gatheringId}/challenges/${challenge.id}`}
                >
                  {challenge.title}
                </Link>
              </Card.Title>

              <span className="text-xs text-foreground/60">
                {challenge.startDate} – {challenge.endDate}
              </span>

              <Disclosure.Trigger className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground cursor-pointer transition-colors p-1">
                <span>더보기</span>
                <Disclosure.Indicator />
              </Disclosure.Trigger>
            </div>

            {/* 우측: 인증 개수 + 자세히 보기 버튼 */}
            <div className="flex items-center gap-2 shrink-0">
              <Chip size="md">
                인증 {challenge.feedCount ?? challenge.feeds?.length ?? 0}개
              </Chip>
              <Link
                className="button button--outline"
                href={`/gatherings/${gatheringId}/challenges/${challenge.id}`}
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </Card.Header>

        {/* Disclosure 펼침 영역: 개설자 유저 정보 + 챌린지 상세 설명 */}
        <Disclosure.Content>
          <Disclosure.Body className="border-t border-border px-4 py-3 bg-surface-secondary/40 flex flex-col gap-3">
            <div>
              <UserInfo label="개설자" name={challenge.authorName} image={challenge.authorImage} />
            </div>
            {challenge.description ? (
              <p className="text-sm whitespace-pre-wrap text-foreground/90">
                {challenge.description}
              </p>
            ) : (
              <p className="text-sm text-foreground/50">등록된 설명이 없습니다.</p>
            )}
          </Disclosure.Body>
        </Disclosure.Content>
      </Disclosure>
    </Card>
  );
}
