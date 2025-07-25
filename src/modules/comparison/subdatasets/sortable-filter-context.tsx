import { ComparisonStateItemModel } from '@/api/comparison';
import NavigationRoutes from '@/common/constants/routes';
import {
  ParametrizedDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import {
  SortableGridStackDefaultOptions,
  useControlledGridstack,
  useSortableGridStack,
} from '@/hooks/gridstack';
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Popover,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  DotsThree,
  PencilSimple,
  Subtract,
  Table,
  TrashSimple,
} from '@phosphor-icons/react';
import { useRouter } from 'next/router';
import React from 'react';
import {
  useCheckComparisonSubdatasetsSpecificVisibility,
  useComparisonAppState,
} from '../app-state';
import { useTableAppState } from '@/modules/table/app-state';
import {
  CancelButton,
  VisibilityActionIcon,
} from '@/components/standard/button/variants';
import { ProjectContext } from '@/modules/project/context';
import { useNegateComparisonSubdataset } from './utils';

interface ComparisonStateItemExtraActionsButtonProps {
  item: ComparisonStateItemModel;
}

function ComparisonStateItemExtraActionsButton(
  props: ComparisonStateItemExtraActionsButtonProps,
) {
  const { item } = props;
  const setFilter = useTableAppState((store) => store.params.setFilter);
  const onNegate = useNegateComparisonSubdataset();
  const router = useRouter();
  const project = React.useContext(ProjectContext);

  return (
    <Popover>
      <Popover.Target>
        <ActionIcon>
          <DotsThree />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Button
            variant="subtle"
            leftSection={<Table />}
            onClick={() => {
              setFilter(item.filter);
              router.push({
                pathname: NavigationRoutes.ProjectTable,
                query: {
                  id: project.id,
                },
              });
            }}
          >
            View Table
          </Button>
          <Tooltip label="Create a new subdataset that is the negation of this subdataset; as in, the new subdataset contains all rows that are not included in this subdataset.">
            <Button
              variant="subtle"
              leftSection={<Subtract />}
              onClick={() => {
                onNegate(item);
              }}
            >
              Negate
            </Button>
          </Tooltip>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

interface SortableComparisonStateDndContextProps {
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>;
}

interface ComparisonStateItemComponentProps {
  item: ComparisonStateItemModel;
  editRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>;
  deleteRemote: React.MutableRefObject<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>;
}

const ComparisonStateItemComponent = React.memo(
  function ComparisonStateItemComponent(
    props: ComparisonStateItemComponentProps,
  ) {
    const { item, editRemote, deleteRemote } = props;
    const { visible, toggle } = useCheckComparisonSubdatasetsSpecificVisibility(
      item.name,
    );

    return (
      <Card
        className="select-none grid-stack-item-content"
        bg={visible ? undefined : 'gray.1'}
      >
        <Group align="center" className="h-full">
          <VisibilityActionIcon visible={visible} setVisibility={toggle} />
          <Text>{item.name}</Text>
          <div className="flex-1"></div>
          <Button
            leftSection={<PencilSimple />}
            onClick={() => {
              editRemote.current?.open(item);
            }}
          >
            Edit
          </Button>
          <Button
            leftSection={<TrashSimple />}
            color="red"
            variant="outline"
            onClick={() => {
              deleteRemote.current?.open(item);
            }}
          >
            Delete
          </Button>
          <ComparisonStateItemExtraActionsButton item={item} />
        </Group>
      </Card>
    );
  },
);

const DeleteComparisonStateItemConfirmationModal = React.forwardRef<
  ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null,
  object
>(function DeleteComparisonStateItemConfirmationModal(props, ref) {
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  const filterSubdatasets = useComparisonAppState(
    (store) => store.groups.handlers.filter,
  );
  return (
    <Modal
      opened={!!item}
      onClose={close}
      centered
      title="Delete Dashboard Item?"
    >
      {item && (
        <>
          <Text pb={16}>
            Are you sure you want to delete {item.name}? You can always create
            this subdataset again from the &quot;Add Subdataset&quot; button. If
            you plan to use this subdataset again in the future, we recommend
            that you save the subdataset using the &quot;Manage
            Subdatasets&quot; menu or save the filter using the &quot;Manage
            Filters&quot; menu in the &quot;Edit Subdataset&quot; drawer.
          </Text>
          <Group justify="end" gap={8}>
            <CancelButton onClick={close} />
            <Button
              variant="filled"
              leftSection={<TrashSimple />}
              color={'red'}
              onClick={() => {
                filterSubdatasets(
                  (subdataset) => subdataset.name !== item.name,
                );
                close();
              }}
            >
              Delete
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
});

function accessComparisonStateIdentifier(item: ComparisonStateItemModel) {
  return item.name;
}

export default function SortableComparisonStateDndContext(
  props: SortableComparisonStateDndContextProps,
) {
  const { editRemote } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setComparisonGroups = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const { id, grid, gridElements } = useControlledGridstack({
    gridItems: comparisonGroups.map(accessComparisonStateIdentifier),
    options: SortableGridStackDefaultOptions({
      itemsCount: comparisonGroups.length,
    }),
  });
  useSortableGridStack({
    grid,
    setValues: setComparisonGroups,
    getId: accessComparisonStateIdentifier,
  });

  const deleteRemote =
    React.useRef<ParametrizedDisclosureTrigger<ComparisonStateItemModel> | null>(
      null,
    );

  return (
    <>
      <DeleteComparisonStateItemConfirmationModal ref={deleteRemote} />
      <div className="grid-stack" id={id}>
        {comparisonGroups.map((group) => (
          <div
            className="grid-stack-item"
            key={group.name}
            ref={gridElements.current[group.name]}
          >
            <ComparisonStateItemComponent
              item={group}
              editRemote={editRemote}
              deleteRemote={deleteRemote}
            />
          </div>
        ))}
      </div>
    </>
  );
}
