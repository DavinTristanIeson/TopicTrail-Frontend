import {
  Button,
  Drawer,
  Group,
  Skeleton,
  Switch,
  TagsInput,
} from '@mantine/core';
import {
  ProjectConfigColumnFormProps,
  useInferProjectDatasetColumn,
} from './utils';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import dynamic from 'next/dynamic';
import { ListSkeleton } from '@/components/visual/loading';

const ReorderCategoryOrderDndContext = dynamic(
  () => import('./sortable-category-context'),
  {
    ssr: false,
    loading: ListSkeleton,
  },
);

interface ReorderCategoryOrderDrawerBodyProps {
  categories: string[];
  setCategories(categories: string[]): void;
}
const ReorderCategoryOrderDrawer = React.forwardRef<
  DisclosureTrigger | null,
  ReorderCategoryOrderDrawerBodyProps
>(function ReorderCategoryOrderDrawer(props, ref) {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const { categories: formCategories, setCategories: setFormCategories } =
    props;
  const [localCategories, setLocalCategories] = React.useState(formCategories);

  React.useEffect(() => {
    setLocalCategories(formCategories);
  }, [formCategories]);

  return (
    <Drawer
      opened={opened}
      onClose={close}
      size="lg"
      position="right"
      closeOnClickOutside={false}
      closeOnEscape={false}
      title="Reorder Categories"
    >
      <Group justify="end" gap={8}>
        <Button variant="outline" color="red" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => {
            setFormCategories(localCategories);
            close();
          }}
        >
          Save
        </Button>
      </Group>
      <ReorderCategoryOrderDndContext
        categories={localCategories}
        setCategories={setLocalCategories}
      />
    </Drawer>
  );
});

export function ProjectConfigColumnOrderedCategoricalForm(
  props: ProjectConfigColumnFormProps,
) {
  const { index } = props;
  const categoriesName = `columns.${index}.category_order` as const;
  const { control, setValue } = useFormContext<ProjectConfigFormType>();
  const categories = useWatch({
    name: categoriesName,
    control,
  });

  const { data: column, loading } = useInferProjectDatasetColumn(index);
  const drawerRemote = React.useRef<DisclosureTrigger | null>(null);

  if (loading) {
    return <Skeleton height={60} />;
  }

  return (
    <>
      <Switch
        label="Manually specify category order?"
        checked={!!categories}
        description="Toggle this on if you want to manually specify the order of the categories. Otherwise, the categories will be sorted alphanumerically."
        disabled={!column}
        onChange={(e) => {
          if (e.target.checked) {
            setValue(categoriesName, column?.categories ?? []);
          } else {
            setValue(categoriesName, null);
          }
        }}
      />
      {categories && (
        <>
          <TagsInput
            value={categories}
            label="Categories"
            className="flex-1"
            readOnly
            inputContainer={(children) => {
              return (
                <Group align="start">
                  {children}
                  <Button onClick={() => drawerRemote.current?.open()}>
                    Reorder
                  </Button>
                </Group>
              );
            }}
          />
          <ReorderCategoryOrderDrawer
            categories={categories}
            setCategories={(value) => {
              setValue(categoriesName, value);
            }}
            ref={drawerRemote}
          />
        </>
      )}
    </>
  );
}
