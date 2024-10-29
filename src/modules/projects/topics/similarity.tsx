import { ProjectConfigModel } from "@/api/project/config.model";
import ProcedureStatus, { useTriggerProcedure } from "../common/procedure";
import {
  useGetTopicSimilarity,
  useSendTopicSimilarityRequest,
} from "@/api/topics";
import { capitalize } from "lodash";
import PlotRenderer from "../common/plots";
import {
  ToggleDispatcher,
  useSetupToggleDispatcher,
} from "@/hooks/dispatch-action";
import { Modal } from "@mantine/core";
import React from "react";

interface TopicSimilarityPlotProps {
  column: string;
  config: ProjectConfigModel;
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
  });

  // Run on mount
  React.useEffect(() => {
    procedureProps.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plot = procedureProps.data?.data?.plot;

  return (
    <>
      <ProcedureStatus
        {...procedureProps}
        title={`Inter-topic Relationship of ${capitalize(column)}`}
        description={`View the relationship between the topics in ${capitalize(
          column
        )}`}
        refetchInterval={3000}
      />
      {plot && (
        <div className="relative w-full">
          <PlotRenderer plot={plot} />
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
      title={`Topic Similarity of ${capitalize(column)}`}
      size={1200}
    >
      {opened && <TopicSimilarityPlot {...props} />}
    </Modal>
  );
});
TopicSimilarityPlotModal.displayName = "TopicSimilarityPlotModal";

export default TopicSimilarityPlotModal;
