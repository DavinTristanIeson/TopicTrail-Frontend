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
} from './logistic';
import {
  DefaultMultinomialLogisticRegressionPredictionResultRenderer,
  MultinomialLogisticRegressionCoefficientsPlot,
  MultinomialLogisticRegressionPredictionResultRenderer,
  MultinomialLogisticRegressionVariablesInfoSection,
} from './multinomial-logistic';
import {
  OrdinalRegressionCoefficientsPlot,
  OrdinalRegressionPredictionResultRenderer,
  DefaultOrdinalRegressionPredictionResultRenderer,
  OrdinalRegressionVariablesInfoSection,
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

export default REGRESSION_MODEL_CONFIG;
