'use client';

import { Label, Tag, TagGroup } from '@heroui/react';
import { useState } from 'react';

export default function CategoryTagGroup({
  categories,
  initialCategory = '',
  includeAll = false,
  name = 'category',
}) {
  const [category, setCategory] = useState(initialCategory);
  const options = includeAll ? ['all', ...categories] : categories;
  const selectedKey = category || (includeAll ? 'all' : '');

  return (
    <TagGroup
      aria-label="카테고리"
      selectionMode="single"
      selectedKeys={selectedKey ? new Set([selectedKey]) : new Set()}
      onSelectionChange={(keys) => {
        const selected = String([...keys][0] || '');
        setCategory(selected === 'all' ? '' : selected);
      }}
    >
      <Label>카테고리</Label>
      <TagGroup.List className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option === 'all' ? !category : category === option;

          return (
            <Tag
              id={option}
              key={option}
              className={isSelected ? 'bg-primary text-white' : undefined}
            >
              {option === 'all' ? '전체' : option}
            </Tag>
          );
        })}
      </TagGroup.List>
      <input type="hidden" name={name} value={category} />
    </TagGroup>
  );
}
