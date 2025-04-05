import {
  Text,
  Alert,
  Button,
  Collapse,
  Divider,
  Fieldset,
  Group,
  Paper,
  Stack,
} from '@mantine/core';
import {
  CaretDown,
  CaretRight,
  Faders,
  Info,
  Plus,
} from '@phosphor-icons/react';
import React from 'react';
import { useDisclosure } from '@mantine/hooks';
import { UserDataInput, UserDataManagerRendererProps } from './types';
import { LoadUserDataActionComponent } from './load-data';
import EditUserDataModal from './edit-data';
import { ParametrizedDisclosureTrigger } from '@/hooks/disclosure';

interface UserDataManagerProps<T> extends UserDataManagerRendererProps<T> {
  label: string;
}

export default function UserDataManager<T>(props: UserDataManagerProps<T>) {
  const { label, data, canSave } = props;
  const [opened, { toggle }] = useDisclosure(false);
  const editDataRemote =
    React.useRef<ParametrizedDisclosureTrigger<UserDataInput> | null>(null);
  return (
    <>
      <EditUserDataModal {...props} ref={editDataRemote} />
      <div className="pb-3">
        <Paper className="p-2">
          <Button
            onClick={toggle}
            fullWidth
            leftSection={<Faders />}
            rightSection={opened ? <CaretDown /> : <CaretRight />}
            variant="subtle"
          >
            Manage {label}
          </Button>
          <Collapse in={opened}>
            <Stack>
              <Divider className="my-3" />
              <Alert
                color="blue"
                icon={<Info size={20} />}
                title="What is the purpose of this menu?"
              >
                During your analysis, there may be times when you have to
                rapidly switch between different {label.toLowerCase()}{' '}
                configurations or load previous {label.toLowerCase()}{' '}
                configurations. To make things easier, you can store frequently
                used configurations here so that you can load it easily when you
                need them.
              </Alert>
              <Group align="stretch">
                <Fieldset legend="Save Data" className="min-w-md flex-1">
                  <Group className="h-full" justify="space-between">
                    <Text c="gray" size="sm">
                      Store the current {label.toLowerCase()} configuration so
                      you can use it later. If you want to modify an existing
                      configuration,{' '}
                      <Text inherit span>
                        load
                      </Text>{' '}
                      a configuration first from the &quot;Load {label}&quot;
                      section and then press &quot;Edit&quot;.
                    </Text>
                    <Button
                      leftSection={<Plus />}
                      disabled={!canSave}
                      className="max-w-md min-w-48"
                      onClick={() => {
                        editDataRemote.current?.open({
                          id: null,
                          name: '',
                          description: null,
                          tags: null,
                        });
                      }}
                    >
                      Store
                    </Button>
                  </Group>
                </Fieldset>

                <Fieldset legend={`Load ${label}`} className="min-w-md flex-1">
                  <LoadUserDataActionComponent
                    {...props}
                    onEdit={(id) => {
                      const item = data.find((value) => value.id === id);
                      if (!item) return;
                      editDataRemote.current?.open(item);
                    }}
                  />
                </Fieldset>
              </Group>
            </Stack>
          </Collapse>
        </Paper>
      </div>
    </>
  );
}
