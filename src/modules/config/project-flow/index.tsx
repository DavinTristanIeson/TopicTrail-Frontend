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
  const [phase, setPhase] = React.useState(0);
  const maxPhase = 2;
  const onContinue = () => setPhase((phase) => Math.min(phase + 1, maxPhase));
  const onBack = () => setPhase((phase) => Math.max(phase - 1, maxPhase));
  return (
    <>
      <Stepper
        active={phase}
        onStepClick={setPhase}
        allowNextStepsSelect={false}
      >
        <Stepper.Step
          label="Step 1/3"
          description="Choose a project ID"
          allowStepSelect={false}
        >
          <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
        </Stepper.Step>
        <Stepper.Step
          label="Step 2/3"
          description="Choose a dataset"
          allowStepSelect={false}
        >
          <ConfigureProjectFlow_CheckDataset
            hasData={!!data}
            onContinue={onContinue}
            onBack={onBack}
          />
        </Stepper.Step>
        <Stepper.Step
          label="Step 3/3"
          description="Configure the schema of the dataset"
          allowStepSelect={false}
        >
          <ProjectConfigFormBody onBack={onBack} />
        </Stepper.Step>
      </Stepper>
    </>
  );
}
