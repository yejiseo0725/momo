import Link from "next/link";

export default function GatheringCard({ gathering, showLeader = false }) {
  return (
    <article>
      <header>
        <p>
          <small>{gathering.category} · {gathering.region}</small>
        </p>
        <h3>
          <Link href={`/gatherings/${gathering.id}`}>{gathering.name}</Link>
          {showLeader && gathering.role === "LEADER" ? (
            <span className="leader-mark" aria-label="모임장"> ★</span>
          ) : null}
        </h3>
      </header>
      <p>{gathering.description}</p>
      <footer>
        <small>
          {gathering.memberCount} / {gathering.maxMemCount}명
          {gathering.isPublic ? " · 공개" : " · 비공개"}
        </small>
      </footer>
    </article>
  );
}
