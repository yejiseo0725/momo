"use client";

import { useState } from "react";

export default function InviteButton({ inviteToken }) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function copyInviteUrl() {
    const url = new URL(`/invite/${inviteToken}`, window.location.origin).toString();
    setInviteUrl(url);

    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("초대 URL을 복사했습니다.");
    } catch {
      setCopyMessage("자동으로 복사하지 못했습니다. 아래 URL을 직접 복사해 주세요.");
    }
  }

  return (
    <div className="invite-link">
      <button type="button" onClick={copyInviteUrl}>모임에 초대</button>
      {inviteUrl ? (
        <>
          <p><a href={inviteUrl}>{inviteUrl}</a></p>
          <small role="status">{copyMessage}</small>
        </>
      ) : null}
    </div>
  );
}
