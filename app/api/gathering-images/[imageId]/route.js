import { Readable } from "node:stream";

import { getGatheringImage } from "@/lib/gathering-images";
import { GatheringError, requireGatheringMember } from "@/lib/gatherings";
import { getOptionalSession } from "@/lib/session";

export async function GET(_request, { params }) {
  const session = await getOptionalSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { imageId } = await params;
    const image = await getGatheringImage(imageId);

    if (!image) {
      return Response.json({ error: "이미지를 찾지 못했습니다." }, { status: 404 });
    }

    if (!image.isPublic) {
      await requireGatheringMember(image.gatheringId, session.user.id);
    }

    return new Response(Readable.toWeb(image.stream), {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(image.length),
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof GatheringError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    return Response.json({ error: "이미지를 불러오지 못했습니다." }, { status: 500 });
  }
}
