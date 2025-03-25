import {
  Card,
  Group,
  Stack,
  Text,
  useMantineTheme,
  Button,
  Collapse,
  Divider,
  Anchor,
  Tooltip,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Play, XCircle } from '@phosphor-icons/react';
import useTopicModelingActions from '../behavior/procedure';
import { TaskStatusEnum } from '@/common/constants/enum';
import { TopicModelingOptionFlagCheckboxes } from '../components/controls';

interface TopicsIconProps {
  loading: boolean;
  error: boolean;
}

function TopicsIcon(props: TopicsIconProps) {
  const theme = useMantineTheme();
  const color = props.error ? theme.colors.red[8] : theme.colors.brand[8];
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: 'white',
        border: `0.5rem solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {props.loading ? (
        <Loader size={40} color={color} />
      ) : props.error ? (
        <XCircle size={40} color={color} weight="fill" />
      ) : (
        <Play size={40} weight="fill" color={color} />
      )}
    </div>
  );
}

function TopicModelingExplanation() {
  const [opened, { open, close }] = useDisclosure();
  return (
    <>
      <Text>
        Our algorithm will scan all of the textual columns in your dataset to
        try and find common keywords from documents that discuss the same theme
        or concept. A group consisting of these keywords refers to a{' '}
        <Tooltip label="Click to find out more!">
          <Anchor component="button" onClick={open}>
            Topic
          </Anchor>
        </Tooltip>
        . With this, you won&apos;t have to read the rows in your dataset one by
        one in order to uncover common or unexpected patterns. The technique
        that is used to uncover these topics is called{' '}
        <Tooltip label="Click to find out more!">
          <Anchor component="button" onClick={open}>
            Topic Modeling
          </Anchor>
        </Tooltip>
        .
      </Text>
      <Collapse in={opened} style={{ marginTop: '8px' }}>
        <Card
          withBorder
          shadow="sm"
          p="md"
          radius="md"
          style={{ backgroundColor: '#E6E6FA' }}
        >
          <Text size="sm">
            <Text span fw={500}>
              Topic Modeling
            </Text>{' '}
            is a technique used in natural language processing (NLP) to identify
            hidden patterns or topics in a collection of documents. It groups
            similar words and phrases that frequently appear together, helping
            to uncover underlying themes.
          </Text>
          <Text size="sm" mt="sm">
            <Text span fw={500}>
              Algorithm Used
            </Text>
            : This application utilizes BERTopic, which leverages SBERT
            embeddings and clustering methods like HDBSCAN to discover
            meaningful topics in textual data.
          </Text>
          <Button variant="subtle" onClick={close}>
            Hide Explanation
          </Button>
        </Card>
      </Collapse>
    </>
  );
}

type ProjectTopicsEmptyPageControlsProps = ReturnType<
  typeof useTopicModelingActions
>;

export default function ProjectTopicsEmptyPageControls(
  props: ProjectTopicsEmptyPageControlsProps,
) {
  const { onStartTopicModeling, startTopicModelingButtonIsLoading, progress } =
    props;

  return (
    <Card withBorder shadow="lg" p="md" radius="md">
      <Stack>
        <Group align="start">
          <TopicsIcon
            loading={startTopicModelingButtonIsLoading}
            error={progress?.status === TaskStatusEnum.Failed}
          />
          <Stack className="flex-1">
            <Text fw={500} size="xl">
              Discover Topics
            </Text>
            <TopicModelingExplanation />
            <Group justify="end">
              <Button
                onClick={onStartTopicModeling}
                loading={startTopicModelingButtonIsLoading}
                leftSection={<Play />}
                className="max-w-sm"
              >
                Start Topic Modeling
              </Button>
            </Group>
          </Stack>
          <Divider orientation="vertical" />
          <TopicModelingOptionFlagCheckboxes {...props} />
        </Group>
      </Stack>
    </Card>
  );
}
