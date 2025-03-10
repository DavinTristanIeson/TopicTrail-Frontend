import {
  Button,
  Drawer,
  Group,
  Paper,
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
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';

interface CategoryItemComponentProps {
  category: string;
}

function CategoryItemComponent(props: CategoryItemComponentProps) {
  return <Paper>{props.category}</Paper>;
}

function SortableCategoryItemComponent(props: CategoryItemComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CategoryItemComponent {...props} />
    </div>
  );
}

interface ReorderCategoryOrderModalBodyProps {
  categories: string[];
  setCategories(categories: string[]): void;
}
function ReorderCategoryOrderDndContext(props: {
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const { categories, setCategories } = props;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id === over?.id || !over) return;
    setCategories((items) => {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      return arrayMove(items, oldIndex, newIndex);
    });
    setActiveId(null);
  }, []);

  const onDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const resetDrag = React.useCallback(() => {
    setActiveId(null);
  }, []);
  return (
    <DndContext
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragAbort={resetDrag}
      onDragCancel={resetDrag}
      sensors={sensors}
      collisionDetection={closestCenter}
    >
      <SortableContext
        items={categories}
        strategy={verticalListSortingStrategy}
      >
        {categories.map((category) => (
          <SortableCategoryItemComponent category={category} />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeId ? <CategoryItemComponent category={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

const ReorderCategoryOrderDrawer = React.forwardRef<
  DisclosureTrigger | null,
  ReorderCategoryOrderModalBodyProps
>((props, ref) => {
  const [opened, { close }] = useDisclosureTrigger(ref);
  const [categories, setCategories] = React.useState(props.categories);
  return (
    <Drawer
      opened={opened}
      onClose={close}
      size="lg"
      title="Reorder Categories"
    >
      <Group justify="end" gap={8}>
        <Button variant="outline" color="red" onClick={close}>
          Cancel
        </Button>
        <Button
          variant="default"
          onClick={() => {
            props.setCategories(categories);
            close();
          }}
        >
          Save
        </Button>
      </Group>
      <ReorderCategoryOrderDndContext
        categories={categories}
        setCategories={setCategories}
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
          <Group>
            <TagsInput
              value={categories}
              label="Categories"
              className="flex-1"
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
