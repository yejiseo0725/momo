"use client";

import { useState } from "react";

function copyWithTemporaryTextArea(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";

  document.body.appendChild(textArea);
  try {
    textArea.select();
    textArea.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 브라우저가 Clipboard API를 막으면 아래의 호환 방식으로 다시 시도한다.
    }
  }

  return copyWithTemporaryTextArea(text);
}

export default function InviteButton({ inviteToken }) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  function showAndCopyInviteUrl() {
    const invitePath = `/invite/${encodeURIComponent(inviteToken)}`;
    const url = `${window.location.origin}${invitePath}`;

    // 복사 권한 확인이 끝나기 전에도 초대 URL은 즉시 화면에 표시한다.
    setInviteUrl(url);
    setCopyMessage("초대 URL을 복사하는 중입니다.");

    void copyText(url).then(
      (copied) => {
        setCopyMessage(
          copied
            ? "초대 URL을 복사했습니다."
            : "자동으로 복사하지 못했습니다. 아래 URL을 직접 복사해 주세요.",
        );
      },
      () => {
        setCopyMessage("자동으로 복사하지 못했습니다. 아래 URL을 직접 복사해 주세요.");
      },
    );
  }

  return (
    <div className="invite-link">
      <button
        type="button"
        aria-controls="gathering-invite-url"
        aria-expanded={Boolean(inviteUrl)}
        onClick={showAndCopyInviteUrl}
      >
        모임에 초대
      </button>
      {inviteUrl ? (
        <div id="gathering-invite-url">
          <label htmlFor="invite-url">초대 URL</label>
          <input
            id="invite-url"
            type="text"
            readOnly
            value={inviteUrl}
            onFocus={(event) => event.currentTarget.select()}
          />
          <small role="status">{copyMessage}</small>
        </div>
      ) : null}
    </div>
  );
}
