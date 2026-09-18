import {
  Alert,
  Button,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  Typography,
} from "@heroui/react";
import Link from "next/link";
import Form from "next/form";
import { connection } from "next/server";

import EmptyState from "@/components/EmptyState";
import GatheringCard from "@/components/GatheringCard";
import ToastMessage from "@/components/ToastMessage";
import { getPublicGatherings } from "@/lib/gatherings";
import { getSigunguName } from "@/lib/regions";
import { requireSession } from "@/lib/session";
import { getUserRegion } from "@/lib/users";
import { CATEGORIES, getSingleSearchParam } from "@/lib/utils/validation";

function createGatheringsPath({ category, keyword, nearby }) {
  const query = new URLSearchParams();

  if (keyword) {
    query.set("keyword", keyword);
  }
  if (category) {
    query.set("category", category);
  }
  if (nearby) {
    query.set("nearby", "true");
  }

  const search = query.toString();
  return search ? `/gatherings?${search}` : "/gatherings";
}

export default async function GatheringsPage({ searchParams }) {
  await connection();
  const session = await requireSession();
  const query = await searchParams;
  const keyword = getSingleSearchParam(query.keyword).trim();
  const category = getSingleSearchParam(query.category);
  const selectedCategory = CATEGORIES.includes(category) ? category : "";
  const nearbyOnly = getSingleSearchParam(query.nearby) === "true";
  const userRegionCode = nearbyOnly ? await getUserRegion(session.user.id) : "";
  const sigunguName = getSigunguName(userRegionCode);
  const gatherings = await getPublicGatherings({
    keyword,
    category: selectedCategory,
    excludeUserId: session.user.id,
    nearbyRegionCode: userRegionCode,
  });
  const allGatheringsPath = createGatheringsPath({
    keyword,
    category: selectedCategory,
    nearby: false,
  });
  const nearbyGatheringsPath = createGatheringsPath({
    keyword,
    category: selectedCategory,
    nearby: true,
  });

  return (
    <>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography type="h1">모임 찾기</Typography>
            <p>공개된 모임을 최신순으로 둘러보세요.</p>
          </div>
          <Link href="/gatherings/new" className="button button--primary">새 모임 만들기</Link>
        </div>

        <Form action="/gatherings" className="flex w-full max-w-xl flex-col gap-4">
          <Typography weight="semibold">조회 범위</Typography>
          <div className="flex flex-wrap gap-2" aria-label="모임 조회 범위">
            <Link
              href={allGatheringsPath}
              className={`button ${nearbyOnly ? "button--outline" : "button--primary"}`}
              aria-current={nearbyOnly ? undefined : "page"}
            >
              전체 모임
            </Link>
            <Link
              href={nearbyGatheringsPath}
              className={`button ${nearbyOnly ? "button--primary" : "button--outline"}`}
              aria-current={nearbyOnly ? "page" : undefined}
            >
              내 주변 모임
            </Link>
          </div>
          {nearbyOnly ? (
            <Alert status="accent">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {sigunguName
                    ? `${sigunguName}의 모임과 온라인 모임을 보고 있습니다.`
                    : "프로필 지역을 확인할 수 없어 온라인 모임만 보고 있습니다."}
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <TextField
            fullWidth
            name="keyword"
            type="search"
            defaultValue={keyword}
          >
            <Label>키워드</Label>
            <Input
              placeholder="모임명, 소개, 지역"
              maxLength="100"
            />
          </TextField>

          <Select
            fullWidth
            name="category"
            defaultSelectedKey={selectedCategory || "all"}
          >
            <Label>카테고리</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="전체">전체</ListBox.Item>
                {CATEGORIES.map((item) => (
                  <ListBox.Item id={item} key={item} textValue={item}>{item}</ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {nearbyOnly ? <input type="hidden" name="nearby" value="true" /> : null}

          <Button type="submit">검색</Button>
        </Form>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography type="h2">모임 {gatherings.length}개</Typography>
            <p>이미 가입했거나 직접 만든 모임은 내 모임에서 확인할 수 있습니다.</p>
          </div>
          <Link className="link" href="/my-gatherings">내 모임 보기</Link>
        </div>
        {gatherings.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gatherings.map((gathering) => (
              <GatheringCard key={gathering.id} gathering={gathering} />
            ))}
          </div>
        ) : (
          <EmptyState>조건에 맞는 가입 가능한 공개 모임이 없습니다.</EmptyState>
        )}
      </section>
    </>
  );
}
