import { TaskControlsCard } from '@/modules/task/controls';
import { useMantineTheme, Group, Text } from '@mantine/core';
import { CheckCircle, XCircle } from '@phosphor-icons/react';

interface RegressionConvergenceResultRendererProps {
  converged: boolean;
}

export function RegressionConvergenceResultRenderer(
  props: RegressionConvergenceResultRendererProps,
) {
  const { converged } = props;
  const { colors } = useMantineTheme();
  return (
    <TaskControlsCard>
      <Group wrap="nowrap">
        {converged ? (
          <>
            <CheckCircle color={colors.green[6]} size={48} weight="fill" />
            <Text className="flex-1">
              The regression model has converged successfully; this means that
              the optimization algorithm was able to find best-fit parameters
              for the model. The coefficients can be relied on.
            </Text>
          </>
        ) : (
          <>
            <XCircle color={colors.red[6]} size={48} weight="fill" />
            <Text className="flex-1">
              The regression model wasn&apos;t able to converge successfully;
              this means that the optimization algorithm wasn&apos;t able to
              find best-fit parameters for the model. The coefficients
              shouldn&apos;t be relied on. This may happen because of complete
              or quasi-complete separation; consider dropping or merging
              independent variables with ridiculously high standard errors as
              they are the prime suspects for the separation.
            </Text>
          </>
        )}
      </Group>
    </TaskControlsCard>
  );
}
