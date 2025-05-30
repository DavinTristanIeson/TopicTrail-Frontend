import {
  LinearRegressionPredictionResultModel,
  LogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionPredictionResultModel,
  OrdinalRegressionPredictionResultModel,
} from '@/api/statistical-analysis';
import { ResultCard } from '@/components/visual/result-card';
import PlotRenderer from '@/components/widgets/plotly';
import { Stack } from '@mantine/core';
import React from 'react';
import { PlotParams } from 'react-plotly.js';

export function LinearRegressionPredictionResult(
  props: LinearRegressionPredictionResultModel,
) {
  return <ResultCard label="Predicted Mean" value={props.mean} />;
}

export function LogisticRegressionPredictionResult(
  props: LogisticRegressionPredictionResultModel,
) {
  return <ResultCard label="Predicted Probability" value={props.probability} />;
}

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
          title: 'Levels',
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

export function MultinomialLogisticRegressionPredictionResult(
  props: MultinomialLogisticRegressionPredictionResultModel,
) {
  return (
    <PredictedProbabilityDistributionPlot
      dependentVariableLevels={props.levels}
      probabilities={props.probabilities}
    />
  );
}

export function OrdinalRegressionPredictionResult(
  props: OrdinalRegressionPredictionResultModel,
) {
  return (
    <Stack>
      <ResultCard
        label="Latent Variable Value"
        value={props.latent_score}
        info="Ordinal regression works under the assumption that there is a latent score that defines the thresholds of the levels. This score represents the log-odds that a variable has a rank equal to or lower than the rank the latent variable value is associated with."
      />
      <PredictedProbabilityDistributionPlot
        dependentVariableLevels={props.levels}
        probabilities={props.probabilities}
      />
      ;
    </Stack>
  );
}
