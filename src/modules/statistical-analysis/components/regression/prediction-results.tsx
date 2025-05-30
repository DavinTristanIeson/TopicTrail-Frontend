import { ResultCard } from '@/components/visual/result-card';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack } from '@mantine/core';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

export function LinearRegressionPredictionResult() {}

export function LogisticRegressionPredictionResult() {}

interface PredictedProbabilityDistributionPlotProps {
  dependentVariableLevels: string[];
  probabilities: number[];
}

function PredictedProbabilityDistributionPlot(
  props: PredictedProbabilityDistributionPlotProps,
) {
  const { dependentVariableLevels, probabilities } = props;
  const plot = React.useMemo<PlotParams>(() => {
    return {
      data: [
        {
          x: dependentVariableLevels,
          y: probabilities.map((probability) => probability * 100),
        },
      ],
      layout: {
        title: 'Predicted Probability Distribution',
        xaxis: {
          title: 'Levels of Dependent Variable',
        },
        yaxis: {
          title: 'Probability',
          minallowed: 0,
          maxallowed: 100,
          ticksuffix: '%',
        },
      },
    };
  }, [dependentVariableLevels, probabilities]);
  return <PlotRenderer plot={plot} />;
}

interface MultinomialLogisticRegressionPredictionResultProps {
  dependentVariableLevels: string[];
  probabilities: number[];
}

export function MultinomialLogisticRegressionPredictionResult(
  props: MultinomialLogisticRegressionPredictionResultProps,
) {
  return <PredictedProbabilityDistributionPlot {...props} />;
}

interface OrdinalRegressionPredictionResultProps {
  dependentVariableLevels: string[];
  probabilities: number[];
  latentValue: number;
}

export function OrdinalRegressionPredictionResult(
  props: OrdinalRegressionPredictionResultProps,
) {
  return (
    <Stack>
      <ResultCard
        label="Latent Variable Value"
        value={props.latentValue}
        info="Ordinal regression works under the assumption that there is a latent score that defines the thresholds of the levels. This score represents the log-odds that a variable has a rank equal to or lower than the rank the latent variable value is associated with."
      />
      <PredictedProbabilityDistributionPlot {...props} />;
    </Stack>
  );
}
