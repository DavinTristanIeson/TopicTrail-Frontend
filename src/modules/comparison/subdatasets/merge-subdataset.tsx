import React from 'react';
import { useComparisonAppState } from '../app-state';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Modal,
  Stack,
  Switch,
  TextInput,
  Title,
  Text,
} from '@mantine/core';
import { ComparisonStateItemModel } from '@/api/comparison';
import { Intersect, Unite, Warning } from '@phosphor-icons/react';
import { useAddSubdatasetByName } from './utils';
import { DisclosureTrigger, useDisclosureTrigger } from '@/hooks/disclosure';
import { showNotification } from '@mantine/notifications';
import { CancelButton } from '@/components/standard/button/variants';

interface MergeSubdatasetBodyProps {
  onClose(): void;
}

function MergeSubdatasetBody(props: MergeSubdatasetBodyProps) {
  const { onClose } = props;
  const comparisonGroups = useComparisonAppState((store) => store.groups.state);
  const setSubdatasets = useComparisonAppState(
    (store) => store.groups.handlers.setState,
  );
  const addSubdataset = useAddSubdatasetByName();
  const [mergeTargetStorage, setMergeTargets] = React.useState<
    Record<string, ComparisonStateItemModel | undefined>
  >({});
  const [newSubdatasetName, setNewSubdatasetName] = React.useState('');
  const [shouldDeleteSubdatasets, setShouldDeleteSubdatasets] =
    React.useState<boolean>(false);
  const [mergeAsUnion, setMergeAsUnion] = React.useState<boolean>(true);

  const hasName = newSubdatasetName.length > 0;
  const mergeTargets = Object.values(mergeTargetStorage).filter(
    Boolean,
  ) as ComparisonStateItemModel[];
  const hasAtLeastTwoSubdatasets = mergeTargets.length >= 2;
  const canMerge = hasName && hasAtLeastTwoSubdatasets;

  return (
    <>
      <Modal.Header w="100%">
        <Group justify="end" w="100%">
          <CancelButton onClick={onClose} />
          <Button
            disabled={!canMerge}
            onClick={() => {
              if (shouldDeleteSubdatasets) {
                setSubdatasets((prev) =>
                  prev.filter(
                    (subdataset) =>
                      !mergeTargetStorage[subdataset.name] ||
                      // put the subdataset at the original location
                      subdataset.name === newSubdatasetName,
                  ),
                );
              }
              addSubdataset({
                name: newSubdatasetName,
                filter: {
                  type: mergeAsUnion ? 'or' : 'and',
                  operands: mergeTargets.map((target) => target.filter),
                },
              });
              showNotification({
                message: `The subdatasets have been successfully merged into ${newSubdatasetName}.`,
                color: 'green',
              });
              onClose();
            }}
            leftSection={mergeAsUnion ? <Unite /> : <Intersect />}
          >
            Merge Subdatasets
          </Button>
        </Group>
      </Modal.Header>
      <Stack>
        <TextInput
          label="Subdataset Name"
          value={newSubdatasetName}
          onChange={(e) => setNewSubdatasetName(e.target.value)}
          error={
            hasName
              ? undefined
              : 'Specify a name to represent the merged subdataset.'
          }
        />
        <Checkbox
          checked={shouldDeleteSubdatasets}
          onChange={(e) => setShouldDeleteSubdatasets(e.target.checked)}
          label="Delete merged subdatasets?"
          description="Should the selected subdatasets be deleted after the merge?"
        />
        <Switch
          checked={mergeAsUnion}
          label={mergeAsUnion ? 'Mode: Union' : 'Mode: Intersection'}
          onChange={(e) => setMergeAsUnion(e.target.checked)}
          description={
            mergeAsUnion
              ? 'The merged subdataset will contain the union of the subdatasets.'
              : 'The merged subdataset will contain the intersection of the subdatasets.'
          }
        />
        <Divider />
        <Title order={4}>Choose the subdatasets that will be merged</Title>
        {hasAtLeastTwoSubdatasets ? undefined : (
          <Alert color="red" icon={<Warning />}>
            Choose at least 2 subdatasets to be merged.
          </Alert>
        )}
        {comparisonGroups.map((group) => (
          <Card key={group.name}>
            <Group>
              <Checkbox
                checked={!!mergeTargetStorage[group.name]}
                onChange={(e) => {
                  return setMergeTargets((prev) => {
                    if (e.target.checked) {
                      return {
                        ...prev,
                        [group.name]: group,
                      };
                    } else {
                      const next = { ...prev };
                      next[group.name] = undefined;
                      return next;
                    }
                  });
                }}
              />
              <Text>{group.name}</Text>
            </Group>
          </Card>
        ))}
      </Stack>
    </>
  );
}

const MergeSubdatasetModal = React.forwardRef<DisclosureTrigger | null>(
  function MergeSubdatasetModal(props, ref) {
    const [opened, { close: onClose }] = useDisclosureTrigger(ref);
    return (
      <Modal
        title="Merge Subdatasets"
        opened={opened}
        onClose={onClose}
        size="xl"
      >
        {opened && <MergeSubdatasetBody onClose={onClose} />}
      </Modal>
    );
  },
);
export default MergeSubdatasetModal;
