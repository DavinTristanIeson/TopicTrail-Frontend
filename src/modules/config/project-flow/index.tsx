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
  const onBack = () => setPhase((phase) => Math.min(phase - 1, maxPhase));
  return (
    <>
      <Stepper
        active={phase}
        onStepClick={setPhase}
        allowNextStepsSelect={false}
      >
        <Stepper.Step
          label="Step 1/3"
          description="Choose a project name"
          allowStepSelect={false}
        />
        <Stepper.Step
          label="Step 2/3"
          description="Choose a dataset"
          allowStepSelect={false}
        />
        <Stepper.Step
          label="Step 3/3"
          description="Configure the schema of the dataset"
          allowStepSelect={false}
        />
      </Stepper>
      <div className="flex flex-col items-center pt-5">
        <div className="max-w-5xl">
          {phase === 0 ? (
            <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
          ) : phase === 1 ? (
            <ConfigureProjectFlow_CheckDataset
              onContinue={onContinue}
              onBack={onBack}
            />
          ) : (
            <ProjectConfigFormBody onBack={onBack} />
          )}
        </div>
      </div>
    </>
  );
}
