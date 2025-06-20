import { components } from './openapi';

export type StatisticTestResultModel =
  components['schemas']['StatisticTestResult'];
export type ComparisonGroupInfoModel =
  components['schemas']['ComparisonGroupInfo'];
export type SignificanceResultModel =
  components['schemas']['SignificanceResult'];
export type EffectSizeResultModel = components['schemas']['EffectSizeResult'];

export type BinaryStatisticTestOnDistributionResultModel =
  components['schemas']['BinaryStatisticTestOnDistributionResultResource'];
export type BinaryStatisticTestOnContingencyTableMainResultModel =
  components['schemas']['BinaryStatisticTestOnContingencyTableResultMainResource'];
export type ContingencyTableModel =
  components['schemas']['ContingencyTableResource'];
export type PairwiseStatisticTestResultModel =
  components['schemas']['PairwiseStatisticTestResultResource'];

export type LinearRegressionResultModel =
  components['schemas']['LinearRegressionResult'];
export type LogisticRegressionResultModel =
  components['schemas']['LogisticRegressionResult'];
export type MultinomialLogisticRegressionResultModel =
  components['schemas']['MultinomialLogisticRegressionResult'];
export type MultinomialLogisticRegressionFacetResultModel =
  components['schemas']['MultinomialLogisticRegressionFacetResult'];
export type OrdinalRegressionResultModel =
  components['schemas']['OrdinalRegressionResult'];
export type OrdinalRegressionThresholdModel =
  components['schemas']['OrdinalRegressionThreshold'];

export type RegressionCoefficientModel =
  components['schemas']['RegressionCoefficient'];
export type LogisticRegressionCoefficientModel =
  components['schemas']['LogisticRegressionCoefficient'];
export type OrdinalRegressionCoefficientModel =
  components['schemas']['OrdinalRegressionCoefficient'];

export type LinearRegressionPredictionResultModel =
  components['schemas']['LinearRegressionPredictionResult'];
export type LogisticRegressionPredictionResultModel =
  components['schemas']['LogisticRegressionPredictionResult'];
export type MultinomialLogisticRegressionPredictionResultModel =
  components['schemas']['MultinomialLogisticRegressionPredictionResult'];
export type MultinomialLogisticRegressionMarginalEffectsFacetResultModel =
  components['schemas']['MultinomialLogisticRegressionMarginalEffectsFacetResult'];
export type OrdinalRegressionPredictionResultModel =
  components['schemas']['OrdinalRegressionPredictionResult'];

export type RegressionPredictionInput =
  components['schemas']['BaseRegressionPredictionInput'];

export type RegressionIndependentVariableInfo =
  components['schemas']['RegressionIndependentVariableInfo'];

export type RegressionDependentVariableLevelInfo =
  components['schemas']['RegressionDependentVariableLevelInfo'];
