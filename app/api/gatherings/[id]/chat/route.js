import { GatheringError } from "@/lib/gatherings";
import { getChatMessages } from "@/lib/chat";
import { getOptionalSession } from "@/lib/session";

export async function GET(request, { params }) {
  const session = await getOptionalSession();

  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const afterMessageId = new URL(request.url).searchParams.get("after") || "";

  try {
    const messages = await getChatMessages(id, session.user.id, { afterMessageId });
    return Response.json({ messages });
  } catch (error) {
    if (error instanceof GatheringError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json({ error: "메시지를 불러오지 못했습니다." }, { status: 500 });
  }
}
