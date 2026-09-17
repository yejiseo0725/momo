import { GatheringError, requireGatheringMember } from "@/lib/gatherings";
import { getOptionalSession } from "@/lib/session";

export async function GET(_request, { params }) {
  const session = await getOptionalSession();

  if (!session) {
    return Response.json({ allowed: false }, { status: 401 });
  }

  const { id } = await params;

  try {
    await requireGatheringMember(id, session.user.id);
    return Response.json({ allowed: true });
  } catch (error) {
    if (error instanceof GatheringError) {
      return Response.json({ allowed: false }, { status: 403 });
    }

    return Response.json({ allowed: false }, { status: 500 });
  }
}
