import {
  MultinomialLogisticRegressionFacetResultModel,
  MultinomialLogisticRegressionMarginalEffectsFacetResultModel,
  RegressionCoefficientModel,
} from '@/api/statistical-analysis';
import { Stack, Title, Divider } from '@mantine/core';
import {
  RegressionModelType,
  UltimateRegressionCoefficientModel,
} from '../types';
import {
  RegressionCoefficientsPerFacetTableRenderer,
  RegressionCoefficientsTableRenderer,
} from './coefficients';
import {
  MarginalEffectsPerFacetTableRenderer,
  MarginalEffectsTableRenderer,
} from './marginal-effects';

interface RegressionCoefficientsTableProps {
  modelType: RegressionModelType;
  coefficients: UltimateRegressionCoefficientModel[];
  marginalEffects?: RegressionCoefficientModel[];
  intercept: UltimateRegressionCoefficientModel | null;
}

export function RegressionCoefficientsTable(
  props: RegressionCoefficientsTableProps,
) {
  return (
    <Stack>
      <Title order={3}>Coefficients Table</Title>
      <RegressionCoefficientsTableRenderer {...props} />
      <Divider />
      {props.marginalEffects && (
        <>
          <Title order={3}>Marginal Effects Table</Title>
          <MarginalEffectsTableRenderer
            marginalEffects={props.marginalEffects}
          />
        </>
      )}
    </Stack>
  );
}

interface RegressionCoefficientsPerFacetTableProps {
  facets: MultinomialLogisticRegressionFacetResultModel[];
  marginalEffects?: MultinomialLogisticRegressionMarginalEffectsFacetResultModel[];
}

export function RegressionCoefficientsPerFacetTable(
  props: RegressionCoefficientsPerFacetTableProps,
) {
  return (
    <Stack>
      <Title order={3}>Coefficients Table</Title>
      <RegressionCoefficientsPerFacetTableRenderer {...props} />
      {props.marginalEffects && (
        <>
          <Title order={3}>Marginal Effects Table</Title>
          <MarginalEffectsPerFacetTableRenderer
            facets={props.marginalEffects}
          />
        </>
      )}
    </Stack>
  );
}
