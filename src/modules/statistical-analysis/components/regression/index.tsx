import { Stack, Tabs, Tooltip } from '@mantine/core';
import React from 'react';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import { ArrowsDownUp, List, Question } from '@phosphor-icons/react';
import { RegressionModelType, UltimateRegressionResult } from './types';
import { REGRESSION_MODEL_CONFIG } from './regression-model-config';
import RegressionModelPredictionTab from './prediction';
import FitEvaluationTable from './fit-evaluation';

enum RegressionTabType {
  FitEvaluation = 'fit-evaluation',
  Coefficients = 'coefficients',
  Predictions = 'predictions',
  VariableInfo = 'variable-info',
}

interface RegressionResultRendererProps<
  TData extends UltimateRegressionResult,
  TConfig,
> extends BaseStatisticalAnalysisResultRendererProps<TData, TConfig> {
  modelType: RegressionModelType;
}

export function RegressionResultRenderer<
  TData extends UltimateRegressionResult,
  TConfig,
>(allProps: RegressionResultRendererProps<TData, TConfig>) {
  const { modelType, ...props } = allProps;
  const [tab, setTab] = React.useState(RegressionTabType.FitEvaluation);
  const { CoefficientsRenderer, VariableInfoRenderer } =
    REGRESSION_MODEL_CONFIG[modelType];
  return (
    <Stack>
      <Tabs
        value={tab}
        onChange={setTab as React.Dispatch<React.SetStateAction<string | null>>}
        allowTabDeactivation={false}
      >
        <Tabs.List>
          <Tooltip
            label="Evaluate the fit of the regression model; to see whether the presence of the independent variables (the fitted model) explains the dependent variable any better than if they were not present in the first place (the null model)."
            maw={320}
          >
            <Tabs.Tab
              value={RegressionTabType.Coefficients}
              leftSection={<ArrowsDownUp />}
            >
              Model Fit
            </Tabs.Tab>
          </Tooltip>
          <Tooltip
            label="Analyze the coefficients of the regression model to figure out which independent variable has a significant impact on the dependent variable."
            maw={320}
          >
            <Tabs.Tab
              value={RegressionTabType.Coefficients}
              leftSection={<ArrowsDownUp />}
            >
              Model Parameters
            </Tabs.Tab>
          </Tooltip>
          <Tooltip
            label="Use the fitted regression model to make predictions on combinations of the independent variables."
            maw={320}
          >
            <Tabs.Tab
              value={RegressionTabType.Predictions}
              leftSection={<Question />}
            >
              Model Predictions
            </Tabs.Tab>
          </Tooltip>
          <Tooltip
            label="View the information of the variables, such as their sample sizes and variance inflation factor. If your dependent variable consists of levels, you can also view their frequency distribution here."
            maw={320}
          >
            <Tabs.Tab
              value={RegressionTabType.VariableInfo}
              leftSection={<List />}
            >
              Variable Info
            </Tabs.Tab>
          </Tooltip>
        </Tabs.List>
      </Tabs>
      {tab === RegressionTabType.FitEvaluation ? (
        <FitEvaluationTable {...props} modelType={modelType} />
      ) : tab === RegressionTabType.Coefficients ? (
        <CoefficientsRenderer {...(props as any)} />
      ) : tab === RegressionTabType.Predictions ? (
        <RegressionModelPredictionTab
          {...(props as any)}
          modelId={props.data.model_id}
          modelType={modelType}
        />
      ) : tab === RegressionTabType.VariableInfo ? (
        <VariableInfoRenderer {...(props as any)} />
      ) : null}
    </Stack>
  );
}
