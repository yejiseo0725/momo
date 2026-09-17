import { Card, Chip } from "@heroui/react";
import Link from "next/link";

export default function GatheringCard({ gathering }) {
  return (
    <Card>
      <Card.Header>
        <Card.Description>{gathering.category} · {gathering.region}</Card.Description>
        <Card.Title>
          <span className="flex flex-wrap items-center gap-2">
            <Link className="link" href={`/gatherings/${gathering.id}`}>
              {gathering.name}
            </Link>
            {gathering.role === "LEADER" ? <Chip size="sm">모임장</Chip> : null}
          </span>
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p>{gathering.description}</p>
      </Card.Content>
      <Card.Footer>
        <small>
          만든 사람: {gathering.creatorName}
          <br />
          {gathering.memberCount} / {gathering.maxMemCount}명
          {gathering.isPublic ? " · 공개" : " · 비공개"}
        </small>
      </Card.Footer>
    </Card>
  );
}
