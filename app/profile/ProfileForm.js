'use client';

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  Input,
  Label,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { useActionState, useState } from 'react';

import { updateProfileAction } from '@/app/auth-actions';
import HeroToast from '@/components/HeroToast';
import ImageFileField from '@/components/ImageFileField';
import RegionAutocomplete from '@/components/RegionAutocomplete';

const initialActionState = {
  error: '',
  message: '',
};

export default function ProfileForm({
  categories,
  email,
  genders,
  initialValues,
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialActionState,
  );
  const [name, setName] = useState(initialValues.name);
  const [gender, setGender] = useState(initialValues.gender);
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [selectedCategories, setSelectedCategories] = useState(
    initialValues.categories,
  );
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialValues.notificationEnabled,
  );

  return (
    <Form className="flex w-full max-w-lg flex-col gap-4" action={formAction}>
      <TextField fullWidth isDisabled type="email" value={email}>
        <Label>이메일</Label>
        <Input />
      </TextField>

      <ImageFileField
        emptyText={
          initialValues.image
            ? '새 이미지를 선택하지 않으면 현재 이미지를 유지합니다.'
            : '선택된 파일 없음'
        }
        helpText="선택 사항입니다. JPG, PNG, WebP 형식의 5MB 이하 이미지를 선택해 주세요."
        id="profile-image"
        label="프로필 이미지"
        name="image"
      />

      <TextField fullWidth isRequired name="name">
        <Label>이름</Label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength="50"
        />
      </TextField>

      <div className="flex flex-col gap-1.5">
        <Label>성별</Label>
        <ToggleButtonGroup
          className="w-full flex"
          disallowEmptySelection
          fullWidth
          selectedKeys={gender ? new Set([gender]) : new Set()}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const nextKey = Array.from(keys)[0];
            if (nextKey) {
              setGender(nextKey);
            }
          }}
        >
          {genders.map((genderOption, index) => [
            index > 0 ? (
              <ToggleButtonGroup.Separator key={`sep-${genderOption}`} />
            ) : null,
            <ToggleButton
              key={genderOption}
              className="flex-1"
              id={genderOption}
            >
              {genderOption}
            </ToggleButton>,
          ])}
        </ToggleButtonGroup>
        <input type="hidden" name="gender" value={gender} />
      </div>

      <TextField fullWidth isRequired name="nickname">
        <Label>닉네임</Label>
        <Input
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          maxLength="10"
        />
      </TextField>

      <CheckboxGroup
        name="category"
        value={selectedCategories}
        onChange={setSelectedCategories}
      >
        <Label>관심 카테고리</Label>
        {categories.map((category) => (
          <Checkbox key={category} value={category}>
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              {category}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </CheckboxGroup>

      <RegionAutocomplete
        helpText="읍면동 또는 온라인을 입력하고 자동완성 목록에서 선택해 주세요."
        initialRegionCode={initialValues.region}
        initialRegionName={initialValues.regionName}
      />

      <Checkbox
        name="notificationEnabled"
        isSelected={notificationEnabled}
        onChange={setNotificationEnabled}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          새 일정과 새 챌린지 알림 받기
        </Checkbox.Content>
      </Checkbox>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending ? '저장하는 중...' : '프로필 저장'}
      </Button>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
