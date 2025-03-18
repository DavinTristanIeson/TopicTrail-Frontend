import { Alert, Button, Collapse, Divider, Paper, Stack } from '@mantine/core';
import { CaretDown, CaretRight, Faders, Info } from '@phosphor-icons/react';
import React from 'react';
import {
  FilterManagementActionComponentProps,
  LoadFilterActionComponent,
  SaveFilterActionComponent,
} from './actions';
import { useDisclosure } from '@mantine/hooks';

export default function TableFilterManagementModal(
  props: FilterManagementActionComponentProps,
) {
  const [opened, { toggle }] = useDisclosure(true);
  return (
    <div className="pb-3">
      <Paper className="p-2">
        <Button
          onClick={toggle}
          fullWidth
          leftSection={<Faders />}
          rightSection={opened ? <CaretDown /> : <CaretRight />}
          variant="subtle"
        >
          Manage Filters
        </Button>
        <Collapse in={opened}>
          <Divider className="my-3" />
          <Stack>
            <Alert
              color="blue"
              icon={<Info size={20} />}
              title="What is the purpose of this menu?"
            >
              If there are filters that are often used in your analysis, you can
              create a named filter so that you can load it easily later.
            </Alert>
            <SaveFilterActionComponent {...props} />
            <LoadFilterActionComponent {...props} />
          </Stack>
        </Collapse>
      </Paper>
    </div>
  );
}
