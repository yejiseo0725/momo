import Link from "next/link";

export default function GatheringCard({ gathering, leader = false }) {
  return (
    <article>
      <h3>
        <Link href={`/gatherings/${gathering._id.toString()}`}>{gathering.name}</Link>
      </h3>
      <p>{gathering.description}</p>
      <p>
        <small>
          {gathering.category} · {gathering.region} · 최대 {gathering.maxMemCount}명
          {leader ? " · 모임장" : ""}
        </small>
      </p>
    </article>
  );
}
