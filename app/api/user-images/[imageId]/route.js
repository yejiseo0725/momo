import { Readable } from "node:stream";

import { getOptionalSession } from "@/lib/session";
import { getUserImage } from "@/lib/user-images";

export async function GET(_request, { params }) {
  const session = await getOptionalSession();
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { imageId } = await params;
    const image = await getUserImage(imageId);

    if (!image) {
      return Response.json({ error: "이미지를 찾지 못했습니다." }, { status: 404 });
    }

    return new Response(Readable.toWeb(image.stream), {
      headers: {
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(image.length),
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "이미지를 불러오지 못했습니다." }, { status: 500 });
  }
}
