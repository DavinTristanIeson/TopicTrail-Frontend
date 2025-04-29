import { DashboardItemModel } from '@/api/userdata';
import {
  DisclosureTrigger,
  ParametrizedDisclosureTrigger,
  useDisclosureTrigger,
  useParametrizedDisclosureTrigger,
} from '@/hooks/disclosure';
import {
  Alert,
  Button,
  Collapse,
  Divider,
  Flex,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  Faders,
  Info,
  Plus,
  TrashSimple,
  Warning,
} from '@phosphor-icons/react';
import React from 'react';
import VisualizationConfigurationForm from '../configuration';
import { CancelButton } from '@/components/standard/button/variants';
import { DashboardItemRenderer } from './grid-item';
import { useDisclosure, type UseListStateHandlers } from '@mantine/hooks';
import { DASHBOARD_ITEM_CONFIGURATION } from '../types/dashboard-item-configuration';
import { DashboardItemTypeEnum } from '../types/dashboard-item-types';
import ConfirmationDialog from '@/components/widgets/confirmation';
import { PlotRendererContext } from '../components/configuration';

interface VisualizationConfigurationDialogProps {
  onSubmit(item: DashboardItemModel): void;
}

export const AddVisualizationConfigurationDialog = React.forwardRef<
  DisclosureTrigger | null,
  VisualizationConfigurationDialogProps
>(function AddVisualizationConfigurationDialog(props, ref) {
  const { onSubmit } = props;
  const [opened, { close }] = useDisclosureTrigger(ref);
  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Add a New Visualization Component"
    >
      <Alert
        color="blue"
        title="What are visualizations for?"
        icon={<Info size={20} />}
        className="mb-5"
      >
        Humans absorb information more easily with images rather than text or
        numbers. Rather than reading through your dataset row per row, why not
        refer to these graphs to help you get a bird&apos;s eye view over the
        dataset? These visualization components will also be affected by the
        filters you have set on your dataset.
      </Alert>
      {opened && (
        <VisualizationConfigurationForm
          onClose={close}
          data={undefined}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
});

export const VisualizationConfigurationDialog = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  VisualizationConfigurationDialogProps
>(function VisualizationConfigurationDialog(props, ref) {
  const { onSubmit } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  return (
    <Modal opened={!!item} onClose={close} title="Edit Visualization Component">
      {item && (
        <VisualizationConfigurationForm
          onClose={close}
          data={item}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
});

export function AddVisualizationConfigurationButton(
  props: VisualizationConfigurationDialogProps,
) {
  const remote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <AddVisualizationConfigurationDialog ref={remote} {...props} />
      <Button
        leftSection={<Plus />}
        onClick={() => {
          remote.current?.open();
        }}
      >
        Add Visualization
      </Button>
    </>
  );
}

interface DashboardFullScreenConfigurationProps {
  item: DashboardItemModel;
  onSubmit(item: DashboardItemModel): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DashboardFullScreenConfiguration(
  props: DashboardFullScreenConfigurationProps,
) {
  const { onSubmit, item } = props;
  const [opened, { toggle, close }] = useDisclosure();
  return (
    <Paper className="p-3">
      <Button
        leftSection={<Faders />}
        fullWidth
        onClick={toggle}
        variant="subtle"
      >
        Configure Visualization
      </Button>
      <Collapse in={opened}>
        {opened && (
          <>
            <Divider className="my-4" />
            <VisualizationConfigurationForm
              data={item}
              onClose={close}
              onSubmit={onSubmit}
            />
          </>
        )}
      </Collapse>
    </Paper>
  );
}

interface DashboardGridItemFullScreenModalProps {
  onSubmit(item: DashboardItemModel): void;
}

const isFullScreenValue = { isFullScreen: true };
export const DashboardGridItemFullScreenModal = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  DashboardGridItemFullScreenModalProps
>(function DashboardGridItemFullScreenModal(props, ref) {
  // const { onSubmit } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);
  const dashboardItemConfig = item
    ? DASHBOARD_ITEM_CONFIGURATION[item.type as DashboardItemTypeEnum]
    : undefined;
  return (
    <Modal
      size="xl"
      opened={!!item}
      onClose={close}
      transitionProps={{ transition: 'fade', duration: 200 }}
      fullScreen
      radius={0}
    >
      {/* {item && (
        <DashboardFullScreenConfiguration item={item} onSubmit={onSubmit} />
      )} */}
      <Stack className="pb-5">
        {dashboardItemConfig && (
          <>
            <Title
              order={2}
            >{`${dashboardItemConfig.label} of ${item?.column ?? 'Column'}`}</Title>
            <Text c="gray" size="sm">
              {dashboardItemConfig.description}
            </Text>
          </>
        )}
        {item?.description && <Text>{item.description}</Text>}
      </Stack>
      <div style={{ height: `calc(100dvh - 12rem)` }}>
        <PlotRendererContext.Provider value={isFullScreenValue}>
          {item && <DashboardItemRenderer {...item} />}
        </PlotRendererContext.Provider>
      </div>
    </Modal>
  );
});

interface DashboardGridItemDeleteModalProps {
  filterDashboardItems: UseListStateHandlers<DashboardItemModel>['filter'];
}
export const DashboardGridItemDeleteModal = React.forwardRef<
  ParametrizedDisclosureTrigger<DashboardItemModel> | null,
  DashboardGridItemDeleteModalProps
>(function ConfirmationDialog(props, ref) {
  const { filterDashboardItems } = props;
  const [item, { close }] = useParametrizedDisclosureTrigger(ref);

  return (
    <Modal
      opened={!!item}
      onClose={close}
      centered
      title="Delete Dashboard Item?"
    >
      <Text pb={16}>
        Are you sure you want to delete this dashboard item? You can always
        create the dashboard item again from the &quot;Add Visualization&quot;
        button.
      </Text>
      <Flex direction="row-reverse" gap={8}>
        <CancelButton onClick={close} />
        <Button
          variant="filled"
          leftSection={<TrashSimple />}
          color={'red'}
          onClick={() => {
            if (!item) return;
            filterDashboardItems(
              (dashboardItem) => dashboardItem.id !== item.id,
            );
            close();
          }}
        >
          Delete
        </Button>
      </Flex>
    </Modal>
  );
});

interface DashboardResetButtonProps {
  onReset(): void;
}
export function DashboardResetButton(props: DashboardResetButtonProps) {
  const resetRemote = React.useRef<DisclosureTrigger | null>(null);
  return (
    <>
      <ConfirmationDialog
        title="Reset Dashboard"
        message="Are you sure you want to reset the dashboard? All unsaved visualization components will be removed!"
        dangerous
        ref={resetRemote}
        onConfirm={props.onReset}
      />
      <Button
        color="red"
        variant="outline"
        leftSection={<Warning />}
        onClick={() => resetRemote.current?.open()}
      >
        Reset
      </Button>
    </>
  );
}
