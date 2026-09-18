import { requireGatheringMember } from "@/lib/gatherings";
import { getDatabase } from "@/lib/mongodb";
import { getUserProfiles } from "@/lib/users";
import { parseObjectId, serializeDocument } from "@/lib/utils/documents";

export class CashBookError extends Error {
  constructor(message) {
    super(message);
    this.name = "CashBookError";
  }
}

async function getEntryForAuthor(database, entryId, gatheringId, userId) {
  const objectId = parseObjectId(entryId);
  const entry = objectId
    ? await database.collection("cashBooks").findOne({ _id: objectId, gatheringId })
    : null;

  if (!entry) {
    throw new CashBookError("존재하지 않는 가계부 내역입니다.");
  }
  if (entry.userId !== userId) {
    throw new CashBookError("가계부 내역 작성자만 수정하거나 삭제할 수 있습니다.");
  }

  return entry;
}

export async function getCashBookEntries(gatheringId, userId, month) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const query = { gatheringId };

  if (month) {
    query.date = {
      $gte: `${month}-01`,
      $lte: `${month}-31`,
    };
  }

  const entries = await database
    .collection("cashBooks")
    .find(query)
    .sort({ date: -1, createdAt: -1 })
    .toArray();
  const profiles = await getUserProfiles(
    database,
    entries.map((entry) => entry.userId),
  );
  const totals = entries.reduce(
    (result, entry) => {
      if (entry.type === "INCOME") {
        result.income += entry.amount;
      } else {
        result.spending += entry.amount;
      }
      return result;
    },
    { income: 0, spending: 0 },
  );

  return {
    entries: entries.map((entry) => {
      const profile = profiles.get(entry.userId);
      return {
        ...serializeDocument(entry),
        authorName: profile?.displayName || "알 수 없는 사용자",
        authorImage: profile?.image || "",
      };
    }),
    totals: {
      ...totals,
      balance: totals.income - totals.spending,
    },
  };
}

export async function createCashBookEntry(gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const now = new Date();
  await database.collection("cashBooks").insertOne({
    gatheringId,
    userId,
    amount: input.amount,
    type: input.type,
    title: input.title,
    date: input.date,
    memo: input.memo || null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateCashBookEntry(entryId, gatheringId, userId, input) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const entry = await getEntryForAuthor(database, entryId, gatheringId, userId);
  await database.collection("cashBooks").updateOne(
    { _id: entry._id },
    {
      $set: {
        amount: input.amount,
        type: input.type,
        title: input.title,
        date: input.date,
        memo: input.memo || null,
        updatedAt: new Date(),
      },
    },
  );
}

export async function deleteCashBookEntry(entryId, gatheringId, userId) {
  await requireGatheringMember(gatheringId, userId);
  const database = await getDatabase();
  const entry = await getEntryForAuthor(database, entryId, gatheringId, userId);
  await database.collection("cashBooks").deleteOne({ _id: entry._id });
}
