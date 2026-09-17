import Link from "next/link";

export default function GatheringCard({ gathering }) {
  return (
    <article>
      <header>
        <p>
          <small>{gathering.category} · {gathering.region}</small>
        </p>
        <h3>
          <Link href={`/gatherings/${gathering.id}`}>{gathering.name}</Link>
        </h3>
      </header>
      <p className="gathering-card-description">{gathering.description}</p>
      <footer>
        <small>
          만든 사람: {gathering.creatorName}
          <br />
          {gathering.memberCount} / {gathering.maxMemCount}명
          {gathering.isPublic ? " · 공개" : " · 비공개"}
        </small>
      </footer>
    </article>
  );
}
