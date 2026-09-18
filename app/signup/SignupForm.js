'use client';

import {
  Button,
  Description,
  Form,
  Input,
  Label,
  Tag,
  TagGroup,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { useActionState, useState } from 'react';

import { signupAction } from '@/app/auth-actions';
import HeroToast from '@/components/HeroToast';
import RegionAutocomplete from '@/components/RegionAutocomplete';

const initialActionState = {
  error: '',
  message: '',
};

export default function SignupForm({ categories }) {
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialActionState,
  );
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <Form
      className="flex w-full max-w-md flex-col gap-4"
      action={formAction}
      onReset={(event) => event.preventDefault()}
    >
      <HeroToast error={state.error} trigger={state} />

      <TextField fullWidth isRequired name="email" type="email">
        <Label>이메일</Label>
        <Input
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="password" type="password">
        <Label>비밀번호</Label>
        <Input
          minLength="8"
          maxLength="128"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Description>8자 이상 입력해 주세요.</Description>
      </TextField>

      <TextField fullWidth isRequired name="name">
        <Label>이름</Label>
        <Input
          maxLength="50"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="nickname">
        <Label>닉네임</Label>
        <Input
          maxLength="10"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
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
          {['남성', '여성'].map((genderOption, index) => [
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

      <RegionAutocomplete
        helpText="읍면동 또는 온라인을 입력하고 자동완성 목록에서 선택해 주세요."
        id="signup-region"
        initialRegionCode=""
        initialRegionName=""
      />

      <div className="flex flex-col gap-1.5">
        <TagGroup
          aria-label="관심 카테고리"
          size="md"
          selectionMode="multiple"
          selectedKeys={new Set(selectedCategories)}
          onSelectionChange={(keys) => {
            setSelectedCategories(Array.from(keys).map(String));
          }}
        >
          <Label>관심 카테고리</Label>
          <TagGroup.List className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Tag
                  id={category}
                  key={category}
                  className={
                    isSelected
                      ? 'bg-primary text-white font-medium'
                      : undefined
                  }
                >
                  {category}
                </Tag>
              );
            })}
          </TagGroup.List>
        </TagGroup>
        {selectedCategories.map((category) => (
          <input key={category} type="hidden" name="category" value={category} />
        ))}
      </div>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending ? '가입하는 중...' : '가입하기'}
      </Button>
    </Form>
  );
}
