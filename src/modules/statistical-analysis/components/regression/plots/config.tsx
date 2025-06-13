import { generateColorsFromSequence } from '@/common/utils/colors';
import { pickArrayById } from '@/common/utils/iterable';
import { useVisualizationSubdatasetsMultiSelect } from '@/modules/visualization/components/configuration/subdatasets';
import { NamedData } from '@/modules/visualization/types/base';
import chroma from 'chroma-js';
import { zip, fromPairs } from 'lodash-es';
import React from 'react';
import { UltimateRegressionCoefficientModel } from '../types';
import { Select } from '@mantine/core';
import { useSelectLeftRightButtons } from '@/components/visual/select';
import { MultinomialLogisticRegressionResultModel } from '@/api/statistical-analysis';

interface UseAlphaConstrainedColorsProps {
  alpha: number;
}

export function useRegressionAlphaConstrainedColors(
  props: UseAlphaConstrainedColorsProps,
) {
  const { alpha } = props;
  return React.useCallback(
    (facets: NamedData<UltimateRegressionCoefficientModel[]>[]) => {
      if (facets.length === 1) {
        const coefficients = facets[0]!.data;
        const baseColors = generateColorsFromSequence(
          coefficients.map((coefficient) => coefficient.name),
        ).colors;
        const colors = zip(coefficients, baseColors).map(
          ([coefficient, baseColor]) => {
            if (coefficient!.p_value < alpha) {
              return baseColor!;
            }
            return chroma(baseColor!).set('hsv.s', 0.05).hex();
          },
        );
        return {
          [facets[0]!.name]: colors,
        };
      }
      const { colorMap } = generateColorsFromSequence(
        facets.map((facet) => facet.name),
      );
      return fromPairs(
        facets.map((facet) => {
          const coefficients = facet.data;
          const baseColor = colorMap.get(facet.name);
          const colors = coefficients.map((coefficient) => {
            if (coefficient!.p_value < alpha) {
              return baseColor!;
            }
            return chroma(baseColor!).set('hsv.s', 0.05).hex();
          });
          return [facet.name, colors];
        }),
      );
    },
    [alpha],
  );
}

interface UseRegressionChosenCoefficientsProps {
  coefficients: UltimateRegressionCoefficientModel[];
}

export function useRegressionCoefficientMultiSelect(
  props: UseRegressionChosenCoefficientsProps,
) {
  const { coefficients } = props;
  const namedData = React.useMemo(() => {
    return coefficients.map((coefficient) => {
      return {
        name: coefficient.name,
        data: coefficient,
      };
    });
  }, [coefficients]);
  const { viewedData, viewed, Component } =
    useVisualizationSubdatasetsMultiSelect({
      data: namedData,
      limit: null,
      selectProps: {
        label: 'Independent Variables',
        description: 'Choose the independent variables to visualize.',
      },
    });
  const select = React.useCallback(
    (coefficients: UltimateRegressionCoefficientModel[]) => {
      return pickArrayById(coefficients, viewed, (coef) => coef.name);
    },
    [viewed],
  );
  return {
    Component,
    coefficients: React.useMemo(() => {
      return viewedData.map((coefficient) => coefficient.data);
    }, [viewedData]),
    select,
  };
}

interface UseMultinomialLogisticRegressionViewedDependentVariableLevelProps {
  result: MultinomialLogisticRegressionResultModel;
}

export function useMultinomialLogisticRegressionViewedDependentVariableLevel(
  props: UseMultinomialLogisticRegressionViewedDependentVariableLevelProps,
) {
  const { result } = props;
  const levels = React.useMemo(
    () => result.facets.map((facet) => facet.level),
    [result.facets],
  );
  const [level, setLevel] = React.useState<string | null>(null);
  const inputContainer = useSelectLeftRightButtons({
    onChange: setLevel,
    options: levels,
    value: level,
  });
  const Component = (
    <Select
      value={level}
      onChange={setLevel}
      data={levels}
      label="Level of Dependent Variable"
      description="Choose a specific level (also called category) of the independent variable to be visualized."
      inputContainer={inputContainer}
      clearable
    />
  );
  const facet = result.facets.find((facet) => {
    return facet.level === level;
  });

  return { Component, level, facet };
}
