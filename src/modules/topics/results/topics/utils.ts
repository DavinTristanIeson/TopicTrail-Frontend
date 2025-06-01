import { getTopicLabel, TopicModel } from '@/api/topic';
import { formatNumber } from '@/common/utils/number';
import { plotlyWrapText } from '@/modules/visualization/components/utils';

interface ExtractTopicCustomdataForPlotlyParams {
  topics: (TopicModel | null)[];
  toggles?: {
    label?: boolean;
    words?: boolean;
    description?: boolean;
    tags?: boolean;
    frequency?: boolean;
  };
  percentage?: boolean;
}

export function extractTopicCustomdataForPlotly(
  props: ExtractTopicCustomdataForPlotlyParams,
) {
  const { topics, toggles, percentage } = props;
  const customdata = [];
  const hovertemplateBuilder = [];

  const index = () => hovertemplateBuilder.length;

  if (toggles?.label !== false) {
    const labels = topics.map((topic) => {
      if (!topic) {
        return 'Outlier';
      }
      return getTopicLabel(topic);
    });
    customdata.push(labels);
    hovertemplateBuilder.push(`<b>Topic</b>: %{customdata[${index()}]}`);
  }
  if (toggles?.frequency !== false) {
    const topicFrequencies = topics.map((topic) => {
      if (percentage) {
        return `${formatNumber(topic?.frequency ?? 0)}%`;
      } else {
        return topic?.frequency ?? 0;
      }
    });
    customdata.push(topicFrequencies);
    hovertemplateBuilder.push(
      `<b>${percentage ? 'Proportion' : 'Frequency'}</b>: %{customdata[${index()}]}`,
    );
  }
  if (toggles?.tags !== false) {
    const topicTags = topics.map((topic) =>
      plotlyWrapText(topic?.tags?.join(', ') ?? ''),
    );
    customdata.push(topicTags);
    hovertemplateBuilder.push(`<b>Tags</b>: %{customdata[${index()}]}`);
  }
  if (toggles?.description !== false) {
    const topicDescriptions = topics.map((topic) =>
      plotlyWrapText(topic?.description ?? ''),
    );
    customdata.push(topicDescriptions);
    hovertemplateBuilder.push(`<b>Description</b>: %{customdata[${index()}]}`);
  }
  if (toggles?.words !== false) {
    const topicWords = topics.map((topic) => {
      if (!topic) {
        return '';
      }
      return plotlyWrapText(
        topic.words
          .slice(0, 20)
          .map((word) => `(${word[0]}, ${formatNumber(word[1])})`)
          .join(', '),
      );
    });
    customdata.push(topicWords);
    hovertemplateBuilder.push(`<b>Words</b>: %{customdata[${index()}]}`);
  }
  return {
    customdata: customdata as string[][],
    hovertemplate: hovertemplateBuilder.join('<br>'),
  };
}
