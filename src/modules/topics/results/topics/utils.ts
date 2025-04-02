import { getTopicLabel, TopicModel } from '@/api/topic';
import { plotlyWrapText } from '@/components/widgets/plotly';

interface ExtractTopicCustomdataForPlotlyParams {
  topics: (TopicModel | null)[];
  startIndex?: number;
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
  const { topics, startIndex = 0, toggles, percentage } = props;
  const customdata = [];
  const hovertemplateBuilder = [];

  const index = () => startIndex + hovertemplateBuilder.length;

  if (toggles?.label !== false) {
    const labels = topics.map((topic) => {
      if (!topic) {
        return 'Outlier';
      }
      return getTopicLabel(topic);
    });
    customdata.push(labels);
    hovertemplateBuilder.push(`<b>Topic</b>: %{customdata[${index()}]}<br>`);
  }
  if (toggles?.frequency !== false) {
    const topicFrequencies = topics.map((topic) => {
      if (percentage) {
        return `${topic?.frequency.toFixed(2) ?? 0}%`;
      } else {
        return topic?.frequency ?? 0;
      }
    });
    customdata.push(topicFrequencies);
    hovertemplateBuilder.push(
      `<b>${percentage ? 'Proportion' : 'Frequency'}</b>: %{customdata[${index()}]}<br>`,
    );
  }
  if (toggles?.tags !== false) {
    const topicTags = topics.map((topic) =>
      plotlyWrapText(topic?.tags?.join(', ') ?? ''),
    );
    customdata.push(topicTags);
    hovertemplateBuilder.push(`<b>Tags</b>: %{customdata[${index()}]}<br>`);
  }
  if (toggles?.description !== false) {
    const topicDescriptions = topics.map((topic) =>
      plotlyWrapText(topic?.description ?? ''),
    );
    customdata.push(topicDescriptions);
    hovertemplateBuilder.push(
      `<b>Description</b>: %{customdata[${index()}]}<br>`,
    );
  }
  if (toggles?.words !== false) {
    const topicWords = topics.map((topic) => {
      if (!topic) {
        return '';
      }
      return plotlyWrapText(
        topic.words
          .slice(0, 20)
          .map((word) => `(${word[0]}, ${word[1].toFixed(2)})`)
          .join(', '),
      );
    });
    customdata.push(topicWords);
    hovertemplateBuilder.push(`<b>Words</b>: %{customdata[${index()}]}<br>`);
  }
  return {
    customdata: customdata as string[][],
    hovertemplate: hovertemplateBuilder.join(''),
  };
}
