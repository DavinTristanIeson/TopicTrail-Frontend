import { ProjectConfigModel } from "@/api/project/config.model";
import ProcedureStatus, { useTriggerProcedure } from "../common/procedure";
import {
  useGetTopicSimilarity,
  useSendTopicSimilarityRequest,
} from "@/api/topics";
import PlotRenderer from "../common/plots";
import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Box, Modal, Select, Title } from "@mantine/core";
import React from "react";

interface TopicSimilarityPlotProps {
  column: string;
  config: ProjectConfigModel;
}

enum TopicSimilarityVisualizationMethod {
  Ldavis = "ldavis",
  Heatmap = "heatmap",
  Barchart = "barchart",
}

function TopicSimilarityPlot(props: TopicSimilarityPlotProps) {
  const { column, config } = props;
  const procedureProps = useTriggerProcedure({
    useGetStatus: useGetTopicSimilarity,
    useSendRequest: useSendTopicSimilarityRequest,
    input: {
      id: config.projectId,
      column,
    },
    autostart: true,
    keepPreviousData: true,
  });

  // Run on mount
  React.useEffect(() => {
    procedureProps.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heatmap = procedureProps.data?.data?.heatmap;
  const ldavis = procedureProps.data?.data?.ldavis;
  const topicsBarchart = procedureProps.data?.data?.topicsBarchart;
  const [mode, setMode] = React.useState(
    TopicSimilarityVisualizationMethod.Heatmap
  );

  return (
    <>
      <ProcedureStatus
        {...procedureProps}
        title={`Inter-topic Relationship of ${column}`}
        description={`View the relationship between the topics in ${column}`}
        BelowDescription={
          <Select
            value={mode}
            onChange={setMode as (value: string | null) => void}
            label="Visualization Method"
            data={[
              {
                label: "Heatmap",
                value: TopicSimilarityVisualizationMethod.Heatmap,
              },
              {
                label: "LDAVis-style",
                value: TopicSimilarityVisualizationMethod.Ldavis,
              },
              {
                label: "Topic Words Barchart",
                value: TopicSimilarityVisualizationMethod.Barchart,
              },
            ]}
            allowDeselect={false}
            clearable={false}
            description={
              mode === TopicSimilarityVisualizationMethod.Heatmap
                ? "Heatmaps show the similarity between two topics. Deeper shades indicate higher similarity."
                : mode === TopicSimilarityVisualizationMethod.Ldavis
                ? "The LDAvis visualization method shows how topics are related to each other based on proximity. The size of the bubbles indicate the number of documents that are assigned to that topic."
                : mode === TopicSimilarityVisualizationMethod.Barchart
                ? "This visualization method does not actually show the relationship between the topics. Rather, it shows a high level overview of the keywords in each topic."
                : "Choose a visualization method"
            }
          />
        }
        refetchInterval={3000}
      />
      <Box h={48} />
      {heatmap && mode === TopicSimilarityVisualizationMethod.Heatmap && (
        <div className="relative w-full">
          <PlotRenderer plot={heatmap} />
        </div>
      )}
      {ldavis && mode === TopicSimilarityVisualizationMethod.Ldavis && (
        <div className="relative w-full">
          <PlotRenderer plot={ldavis} />
        </div>
      )}
      {topicsBarchart &&
        mode === TopicSimilarityVisualizationMethod.Barchart && (
          <div className="relative w-full">
            <PlotRenderer plot={topicsBarchart} />
          </div>
        )}
    </>
  );
}

const TopicSimilarityPlotModal = React.forwardRef<
  ToggleDispatcher | undefined,
  TopicSimilarityPlotProps
>((props, ref) => {
  const { column } = props;
  const [opened, setOpened] = useSetupToggleDispatcher(ref);
  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={<Title order={2}>{`Topic Similarity of ${column}`}</Title>}
      size={1200}
    >
      {opened && <TopicSimilarityPlot {...props} />}
    </Modal>
  );
});
TopicSimilarityPlotModal.displayName = "TopicSimilarityPlotModal";

export default TopicSimilarityPlotModal;
