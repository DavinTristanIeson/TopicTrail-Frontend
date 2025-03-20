import { Alert, Stepper } from '@mantine/core';
import React from 'react';
import { ConfigureProjectFlow_CheckProjectId } from './phase-1';
import { ConfigureProjectFlow_CheckDataset } from './phase-2';
import ConfigureProjectFlow_ConfigureColumns from './phase-3';
import { Lock } from '@phosphor-icons/react';
import { FormEditableContext } from '@/components/standard/fields/context';
import { ErrorAlert } from '@/components/standard/fields/watcher';

interface ProjectConfigFormPhaseSwitcherProps {
  hasData?: boolean;
}

export default function ProjectConfigFormPhaseSwitcher(
  props: ProjectConfigFormPhaseSwitcherProps,
) {
  const { hasData } = props;
  const [phase, setPhase] = React.useState(hasData ? 2 : 0);
  const maxPhase = 2;
  const [accessiblePhase, setAccessiblePhase] = React.useState(
    props.hasData ? maxPhase : 0,
  );
  const onContinue = () => {
    setPhase((phase) => Math.min(phase + 1, maxPhase));
    setAccessiblePhase((phase) => Math.min(phase + 1, maxPhase));
  };
  const onBack = () => setPhase((phase) => Math.min(phase - 1, maxPhase));
  const { editable } = React.useContext(FormEditableContext);
  return (
    <>
      <Stepper active={phase} onStepClick={setPhase}>
        <Stepper.Step
          label="Step 1/3"
          description="Choose a project name"
          allowStepSelect
        />
        <Stepper.Step
          label="Step 2/3"
          description="Choose a dataset"
          allowStepSelect={accessiblePhase >= 1}
        />
        <Stepper.Step
          label="Step 3/3"
          description="Configure the schema of the dataset"
          allowStepSelect={accessiblePhase >= 2}
        />
      </Stepper>
      <ErrorAlert />
      {!editable && (
        <Alert icon={<Lock size={20} />} title="View-Only" color="yellow">
          You&apos;re currently viewing the configuration of this project. If
          you want to make any changes, press the &quot;Edit&quot; button at the
          top right corner.
        </Alert>
      )}
      <div className="flex flex-col items-center pt-5">
        <div className="max-w-5xl px-3">
          {phase === 0 ? (
            <ConfigureProjectFlow_CheckProjectId onContinue={onContinue} />
          ) : phase === 1 ? (
            <ConfigureProjectFlow_CheckDataset
              onContinue={onContinue}
              onBack={onBack}
              hasData={hasData}
            />
          ) : (
            <ConfigureProjectFlow_ConfigureColumns
              onBack={onBack}
              hasData={hasData}
            />
          )}
        </div>
      </div>
    </>
  );
}
