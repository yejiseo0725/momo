import { Typography } from "@heroui/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { getGatheringDetails } from "@/lib/gatherings";
import { requireSession } from "@/lib/session";

export default async function GatheringLayout({ children, params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const details = await getGatheringDetails(id, session.user.id);

  if (!details) {
    notFound();
  }

  return (
    <>
      <nav
        className="flex flex-wrap items-center gap-2 border-b border-border pb-4"
        aria-label={`${details.gathering.name} 메뉴`}
      >
        <Link className="link mr-2" href={`/gatherings/${id}`}>
          <Typography weight="semibold">{details.gathering.name}</Typography>
        </Link>
        {details.membership ? (
          <>
            <Link className="button button--ghost button--sm" href={`/gatherings/${id}/challenges`}>챌린지</Link>
            <Link className="button button--ghost button--sm" href={`/gatherings/${id}/schedules`}>일정</Link>
            <Link className="button button--ghost button--sm" href={`/gatherings/${id}/cash-books`}>가계부</Link>
            <Link className="button button--ghost button--sm" href={`/gatherings/${id}/chat`}>채팅</Link>
          </>
        ) : null}
      </nav>
      {children}
    </>
  );
}
