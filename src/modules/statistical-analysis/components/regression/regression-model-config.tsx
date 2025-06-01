import {
  LinearRegressionPredictionResultModel,
  LinearRegressionResultModel,
  LogisticRegressionPredictionResultModel,
  LogisticRegressionResultModel,
  MultinomialLogisticRegressionPredictionResultModel,
  MultinomialLogisticRegressionResultModel,
  OrdinalRegressionPredictionResultModel,
  OrdinalRegressionResultModel,
} from '@/api/statistical-analysis';
import { BaseStatisticalAnalysisResultRendererProps } from '../../types';
import {
  LinearRegressionCoefficientsPlot,
  LinearRegressionPredictionResultRenderer,
  DefaultLinearRegressionPredictionResultRenderer,
  LinearRegressionVariablesInfoSection,
  useLinearRegressionPredictionAPIHook,
} from './linear';
import {
  RegressionModelType,
  RegressionPredictionAPIHookType,
  StatisticalAnalysisPredictionResultRendererProps,
} from './types';
import {
  LinearRegressionConfigType,
  MultinomialLogisticRegressionConfigType,
} from '../../configuration/regression';
import { LogisticRegressionConfigType } from '../../configuration/logistic-regression';
import {
  DefaultLogisticRegressionPredictionResultRenderer,
  LogisticRegressionCoefficientsPlot,
  LogisticRegressionPredictionResultRenderer,
  LogisticRegressionVariablesInfoSection,
  useLogisticRegressionPredictionAPIHook,
} from './logistic';
import {
  DefaultMultinomialLogisticRegressionPredictionResultRenderer,
  MultinomialLogisticRegressionCoefficientsPlot,
  MultinomialLogisticRegressionPredictionResultRenderer,
  MultinomialLogisticRegressionVariablesInfoSection,
  useMultinomialLogisticRegressionPredictionAPIHook,
} from './multinomial-logistic';
import {
  OrdinalRegressionCoefficientsPlot,
  OrdinalRegressionPredictionResultRenderer,
  DefaultOrdinalRegressionPredictionResultRenderer,
  OrdinalRegressionVariablesInfoSection,
  useOrdinalRegressionPredictionAPIHook,
} from './ordinal';
import { RegressionConfigType } from '../../configuration/regression-common';

type StatisticalAnalysisResultRenderer<TData, TConfig> = (
  props: BaseStatisticalAnalysisResultRendererProps<TData, TConfig>,
) => React.ReactNode;

type StatisticalAnalysisPredictionResultRenderer<TResult, TConfig> = (
  props: StatisticalAnalysisPredictionResultRendererProps<TResult, TConfig>,
) => React.ReactNode;

interface RegressionModelConfigType<TData, TConfig, TResult> {
  CoefficientsRenderer: StatisticalAnalysisResultRenderer<TData, TConfig>;
  PredictionsRenderer: StatisticalAnalysisPredictionResultRenderer<
    TResult,
    TConfig
  >;
  usePredictionAPI: RegressionPredictionAPIHookType<TResult, TConfig>;
  DefaultPredictionsRenderer: StatisticalAnalysisResultRenderer<TData, TConfig>;
  IndependentVariablesRenderer: StatisticalAnalysisResultRenderer<
    TData,
    TConfig
  >;
  VariableInfoRenderer: StatisticalAnalysisResultRenderer<TData, TConfig>;
}

export const REGRESSION_MODEL_CONFIG = {
  [RegressionModelType.Linear]: {
    usePredictionAPI: useLinearRegressionPredictionAPIHook,
    CoefficientsRenderer: LinearRegressionCoefficientsPlot,
    PredictionsRenderer: LinearRegressionPredictionResultRenderer,
    DefaultPredictionsRenderer: DefaultLinearRegressionPredictionResultRenderer,
    IndependentVariablesRenderer: LinearRegressionVariablesInfoSection,
    VariableInfoRenderer: LinearRegressionVariablesInfoSection,
  } as RegressionModelConfigType<
    LinearRegressionResultModel,
    LinearRegressionConfigType,
    LinearRegressionPredictionResultModel
  >,
  [RegressionModelType.Logistic]: {
    usePredictionAPI: useLogisticRegressionPredictionAPIHook,
    CoefficientsRenderer: LogisticRegressionCoefficientsPlot,
    PredictionsRenderer: LogisticRegressionPredictionResultRenderer,
    DefaultPredictionsRenderer:
      DefaultLogisticRegressionPredictionResultRenderer,
    VariableInfoRenderer: LogisticRegressionVariablesInfoSection,
  } as RegressionModelConfigType<
    LogisticRegressionResultModel,
    LogisticRegressionConfigType,
    LogisticRegressionPredictionResultModel
  >,
  [RegressionModelType.MultinomialLogistic]: {
    usePredictionAPI: useMultinomialLogisticRegressionPredictionAPIHook,
    CoefficientsRenderer: MultinomialLogisticRegressionCoefficientsPlot,
    PredictionsRenderer: MultinomialLogisticRegressionPredictionResultRenderer,
    DefaultPredictionsRenderer:
      DefaultMultinomialLogisticRegressionPredictionResultRenderer,
    VariableInfoRenderer: MultinomialLogisticRegressionVariablesInfoSection,
  } as RegressionModelConfigType<
    MultinomialLogisticRegressionResultModel,
    MultinomialLogisticRegressionConfigType,
    MultinomialLogisticRegressionPredictionResultModel
  >,
  [RegressionModelType.Ordinal]: {
    usePredictionAPI: useOrdinalRegressionPredictionAPIHook,
    CoefficientsRenderer: OrdinalRegressionCoefficientsPlot,
    PredictionsRenderer: OrdinalRegressionPredictionResultRenderer,
    DefaultPredictionsRenderer:
      DefaultOrdinalRegressionPredictionResultRenderer,
    VariableInfoRenderer: OrdinalRegressionVariablesInfoSection,
  } as RegressionModelConfigType<
    OrdinalRegressionResultModel,
    RegressionConfigType,
    OrdinalRegressionPredictionResultModel
  >,
};
