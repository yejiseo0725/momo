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
          {gathering.role === "LEADER" ? (
            <span className="leader-mark" title="모임장">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
                <path d="M5 21h14" />
              </svg>
              <span className="visually-hidden">모임장</span>
            </span>
          ) : null}
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
