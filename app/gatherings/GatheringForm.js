'use client';

import {
  createGatheringAction,
  updateGatheringAction,
} from '@/app/gatherings/actions';
import {
  Button,
  Form,
  Input,
  Label,
  NumberField,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { useActionState, useState } from 'react';

import CategoryTagGroup from '@/components/CategoryTagGroup';
import HeroToast from '@/components/HeroToast';
import ImageFileField from '@/components/ImageFileField';
import RegionAutocomplete from '@/components/RegionAutocomplete';
import Link from 'next/link';

const initialActionState = {
  error: '',
  message: '',
};

export default function GatheringForm({
  cancelHref,
  categories,
  gatheringId,
  initialValues,
  minimumMemberCount = 1,
  mode,
}) {
  const action =
    mode === 'create' ? createGatheringAction : updateGatheringAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [maxMemCount, setMaxMemCount] = useState(
    String(initialValues.maxMemCount),
  );
  const [visibility, setVisibility] = useState(initialValues.visibility);

  return (
    <Form className="flex w-full max-w-md flex-col gap-4" action={formAction}>
      {gatheringId ? (
        <input type="hidden" name="gatheringId" value={gatheringId} />
      ) : null}

      <TextField fullWidth isRequired name="name">
        <Label>모임명</Label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength="80"
        />
      </TextField>

      <RegionAutocomplete
        helpText="읍면동 또는 온라인을 입력하고 자동완성 목록에서 선택해 주세요."
        initialRegionCode={initialValues.region}
        initialRegionName={initialValues.regionName}
      />

      <TextField fullWidth isRequired name="description">
        <Label>소개</Label>
        <TextArea
          rows="6"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength="1000"
        />
      </TextField>

      <ImageFileField
        emptyText={
          initialValues.imageUrl
            ? '새 이미지를 선택하지 않으면 현재 이미지를 유지합니다.'
            : '선택된 파일 없음'
        }
        helpText="선택 사항입니다. JPG, PNG, WebP 형식의 5MB 이하 이미지를 선택해 주세요."
        id={`gathering-image-${gatheringId || 'new'}`}
        label="모임 이미지"
        name="image"
      />

      <NumberField
        fullWidth
        isRequired
        minValue={minimumMemberCount}
        maxValue={300}
        value={maxMemCount === '' ? undefined : Number(maxMemCount)}
        onChange={(value) => setMaxMemCount(String(value))}
      >
        <Label>최대 인원</Label>
        <NumberField.Group>
          <NumberField.DecrementButton aria-label="최대 인원 줄이기" />
          <NumberField.Input name="maxMemCount" />
          <NumberField.IncrementButton aria-label="최대 인원 늘리기" />
        </NumberField.Group>
      </NumberField>

      <CategoryTagGroup
        categories={categories}
        initialCategory={initialValues.category}
      />

      <div className="flex flex-col gap-1.5">
        <Label>공개 여부</Label>
        <ToggleButtonGroup
          className="w-full flex"
          disallowEmptySelection
          fullWidth
          selectedKeys={visibility ? new Set([visibility]) : new Set()}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const nextKey = Array.from(keys)[0];
            if (nextKey) {
              setVisibility(nextKey);
            }
          }}
        >
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:font-semibold"
            id="public"
          >
            공개 모임
          </ToggleButton>
          <ToggleButtonGroup.Separator />
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground data-[selected=true]:font-semibold"
            id="private"
          >
            비공개 모임
          </ToggleButton>
        </ToggleButtonGroup>
        <input type="hidden" name="visibility" value={visibility} />
      </div>

      <div className="flex gap-2">
        {cancelHref ? (
          <Link
            href={cancelHref}
            className="button button--outline flex-1"
          >
            취소
          </Link>
        ) : null}
        <Button
          className={cancelHref ? 'flex-1' : 'w-full'}
          type="submit"
          isDisabled={pending}
          isPending={pending}
        >
          {pending
            ? mode === 'create'
              ? '만드는 중...'
              : '저장하는 중...'
            : mode === 'create'
              ? '모임 만들기'
              : '수정 완료'}
        </Button>
      </div>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
