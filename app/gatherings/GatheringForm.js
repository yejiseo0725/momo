"use client";

import {
  Button,
  Form,
  Input,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState, useState } from "react";

import {
  createGatheringAction,
  updateGatheringAction,
} from "@/app/gatherings/actions";
import ImageFileField from "@/components/ImageFileField";
import RegionAutocomplete from "@/components/RegionAutocomplete";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function GatheringForm({
  categories,
  gatheringId,
  initialValues,
  minimumMemberCount = 1,
  mode,
}) {
  const action = mode === "create" ? createGatheringAction : updateGatheringAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [maxMemCount, setMaxMemCount] = useState(String(initialValues.maxMemCount));
  const [category, setCategory] = useState(initialValues.category);
  const [visibility, setVisibility] = useState(initialValues.visibility);

  return (
    <Form className="flex w-full max-w-xl flex-col gap-4" action={formAction}>
      {gatheringId ? <input type="hidden" name="gatheringId" value={gatheringId} /> : null}

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
        emptyText={initialValues.imageUrl
          ? "새 이미지를 선택하지 않으면 현재 이미지를 유지합니다."
          : "선택된 파일 없음"}
        helpText="선택 사항입니다. JPG, PNG, WebP 형식의 5MB 이하 이미지를 선택해 주세요."
        id={`gathering-image-${gatheringId || "new"}`}
        label="모임 이미지"
        name="image"
      />

      <TextField fullWidth isRequired name="maxMemCount" type="number">
        <Label>최대 인원</Label>
        <Input
          min={minimumMemberCount}
          max="300"
          value={maxMemCount}
          onChange={(event) => setMaxMemCount(event.target.value)}
        />
      </TextField>

      <Select
        fullWidth
        isRequired
        name="category"
        placeholder="선택해 주세요"
        selectedKey={category || null}
        onSelectionChange={(key) => setCategory(key ? String(key) : "")}
      >
        <Label>카테고리</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {categories.map((categoryOption) => (
              <ListBox.Item
                id={categoryOption}
                key={categoryOption}
                textValue={categoryOption}
              >
                {categoryOption}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <RadioGroup
        name="visibility"
        value={visibility}
        onChange={setVisibility}
      >
        <Label>공개 여부</Label>
        <Radio value="public">
          <Radio.Content>
            <Radio.Control><Radio.Indicator /></Radio.Control>
            공개 모임
          </Radio.Content>
        </Radio>
        <Radio value="private">
          <Radio.Content>
            <Radio.Control><Radio.Indicator /></Radio.Control>
            비공개 모임
          </Radio.Content>
        </Radio>
      </RadioGroup>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending
          ? (mode === "create" ? "만드는 중..." : "저장하는 중...")
          : (mode === "create" ? "모임 만들기" : "수정 내용 저장")}
      </Button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
