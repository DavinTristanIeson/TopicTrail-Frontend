import {
  Button,
  Drawer,
  Group,
  Paper,
  Skeleton,
  Switch,
  TagsInput,
  Text,
} from '@mantine/core';
import {
  ProjectConfigColumnFormProps,
  useInferProjectDatasetColumn,
} from './utils';
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProjectConfigFormType } from '../form-type';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { useManyRefs } from '@/hooks/ref';
import {
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';

interface ReorderCategoryOrderModalBodyProps {
  categories: string[];
  setCategories(categories: string[]): void;
}
function ReorderCategoryOrderDndContext(props: {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { categories, setCategories } = props;

  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: categories,
    options: {
      column: 1,
      margin: 4,
      maxRow: categories.length,
      cellHeight: 80,
      disableResize: true,
      removable: false,
      alwaysShowResizeHandle: false,
      float: true,
    },
  });
  useSortableGridStack({
    grid,
    onSort: setCategories,
  });

  return (
    <div id={id} className="grid-stack">
      {categories.map((category, index) => (
        <div
          className="grid-stack-item"
          key={category}
          ref={gridElements.current![category]}
        >
          <Paper
            className="p-3 select-none grid-stack-item-content flex items-center flex-row"
            style={{ display: 'flex' }}
          >
            <div className="rounded bg-primary">{index + 1}</div>
            <Text ta="center" className="flex-1">
              {category}
            </Text>
            <div></div>
          </Paper>
        </div>
      ))}
    </div>
  );
}

const ReorderCategoryOrderDrawer = React.forwardRef<
  DisclosureTrigger | null,
  ReorderCategoryOrderModalBodyProps
>((props, ref) => {
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
          <Group align="end">
            <TagsInput
              value={categories}
              label="Categories"
              className="flex-1"
              readOnly
            />
            <Button onClick={() => drawerRemote.current?.open()}>
              Reorder
            </Button>
          </Group>
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
