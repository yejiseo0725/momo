'use client';

import {
  Checkbox,
  CheckboxGroup,
  Label,
  Tag,
  TagGroup,
} from '@heroui/react';
import { useState } from 'react';

export default function CategoryTagGroup({
  categories,
  initialCategory = '',
  includeAll = false,
  name = 'category',
}) {
  const parseInitial = () => {
    if (Array.isArray(initialCategory)) {
      return initialCategory.filter(Boolean);
    }
    if (typeof initialCategory === 'string' && initialCategory) {
      return initialCategory
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const [selectedCategories, setSelectedCategories] = useState(parseInitial);
  const [singleCategory, setSingleCategory] = useState(
    typeof initialCategory === 'string'
      ? initialCategory
      : initialCategory[0] || '',
  );

  if (includeAll) {
    const isAllSelected = selectedCategories.length === 0;

    const handleCheckboxChange = (newValues) => {
      const wasAll = isAllSelected;
      const clickedAll = newValues.includes('all');

      if (!wasAll && clickedAll) {
        setSelectedCategories([]);
        return;
      }

      const specific = newValues.filter((v) => v !== 'all');
      if (specific.length === 0 || specific.length === categories.length) {
        setSelectedCategories([]);
      } else {
        setSelectedCategories(specific);
      }
    };

    const currentValues = isAllSelected ? ['all'] : selectedCategories;

    return (
      <div className="flex flex-col gap-2">
        <CheckboxGroup value={currentValues} onChange={handleCheckboxChange}>
          <Label>카테고리</Label>
          <div className="flex flex-wrap gap-4 pt-1">
            <Checkbox value="all">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                전체
              </Checkbox.Content>
            </Checkbox>
            {categories.map((cat) => (
              <Checkbox key={cat} value={cat}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  {cat}
                </Checkbox.Content>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>
        {selectedCategories.map((cat) => (
          <input key={cat} type="hidden" name={name} value={cat} />
        ))}
      </div>
    );
  }

  const selectedKey = singleCategory;

  return (
    <TagGroup
      aria-label="카테고리"
      size="md"
      selectionMode="single"
      selectedKeys={selectedKey ? new Set([selectedKey]) : new Set()}
      onSelectionChange={(keys) => {
        const selected = String([...keys][0] || '');
        setSingleCategory(selected);
      }}
    >
      <Label>카테고리</Label>
      <TagGroup.List className="flex flex-wrap gap-2">
        {categories.map((option) => {
          const isSelected = singleCategory === option;

          return (
            <Tag
              id={option}
              key={option}
              className={isSelected ? 'bg-primary text-white font-medium' : undefined}
            >
              {option}
            </Tag>
          );
        })}
      </TagGroup.List>
      <input type="hidden" name={name} value={singleCategory} />
    </TagGroup>
  );
}
