"use client";

import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "@heroui/react";
import { useActionState, useState } from "react";

import { signupAction } from "@/app/auth-actions";
import RegionAutocomplete from "@/components/RegionAutocomplete";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function SignupForm({ categories }) {
  const [state, formAction, pending] = useActionState(signupAction, initialActionState);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  return (
    <Form
      className="flex w-full max-w-xl flex-col gap-4"
      action={formAction}
      onReset={(event) => event.preventDefault()}
    >
      <ToastMessage error={state.error} trigger={state} />

      <TextField fullWidth isRequired name="name">
        <Label>이름</Label>
        <Input
          maxLength="50"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </TextField>

      <RadioGroup isRequired name="gender" value={gender} onChange={setGender}>
        <Label>성별</Label>
        {["남성", "여성"].map((genderOption) => (
          <Radio key={genderOption} value={genderOption}>
            <Radio.Content>
              <Radio.Control><Radio.Indicator /></Radio.Control>
              {genderOption}
            </Radio.Content>
          </Radio>
        ))}
      </RadioGroup>

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

      <TextField fullWidth isRequired name="nickname">
        <Label>닉네임</Label>
        <Input
          maxLength="30"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
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
              <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
              {category}
            </Checkbox.Content>
          </Checkbox>
        ))}
      </CheckboxGroup>

      <RegionAutocomplete
        helpText="읍면동 또는 온라인을 입력하고 자동완성 목록에서 선택해 주세요."
        id="signup-region"
        initialRegionCode=""
        initialRegionName=""
      />

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending ? "가입하는 중..." : "가입하기"}
      </Button>
    </Form>
  );
}
