import { ProjectConfigModel } from '@/api/project';
import { Stepper } from '@mantine/core';
import React from 'react';
import { ConfigureProjectFlow_CheckProjectId } from './phase-1';
import { ConfigureProjectFlow_CheckDataset } from './phase-2';
import ProjectConfigFormBody from './phase-3';

interface ProjectConfigPhaseSwitcherProps {
  data: ProjectConfigModel | undefined;
}

export default function ProjectConfigFormPhaseSwitcher(
  props: ProjectConfigPhaseSwitcherProps,
) {
  const { data } = props;
  const [phase, setPhase] = React.useState(data ? 2 : 0);
  const onContinue = () => setPhase((phase) => phase + 1);
  const onBack = () => setPhase((phase) => phase - 1);
  return (
    <>
      <Stepper
        active={phase}
        onStepClick={setPhase}
        allowNextStepsSelect={false}
      >
        <Stepper.Step label="Step 1/3" description="Choose a project ID">
          <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
        </Stepper.Step>
        <Stepper.Step label="Step 2/3" description="Choose a dataset">
          <ConfigureProjectFlow_CheckDataset
            hasData={!!data}
            onContinue={onContinue}
            onBack={onBack}
          />
        </Stepper.Step>
        <Stepper.Step
          label="Step 3/3"
          description="Configure the schema of the dataset"
        >
          <ProjectConfigFormBody onBack={onBack} />
        </Stepper.Step>
      </Stepper>
    </>
  );
}
