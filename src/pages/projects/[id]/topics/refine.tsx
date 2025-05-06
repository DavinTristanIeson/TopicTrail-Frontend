import { NextPageWithLayout } from '@/common/utils/types';
import { GoBackHeader } from '@/components/layout/header';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import RefineTopicsForm from '@/modules/refine-topics/form';
import { TopicModelingRequirementSafeguard } from '@/modules/topics/components/warnings';
import { Alert, Divider, List, Text } from '@mantine/core';
import React from 'react';

const RefineTopicsPage: NextPageWithLayout = function () {
  return (
    <>
      <GoBackHeader />
      <TopicModelingRequirementSafeguard canSelectColumn={false}>
        <Alert title="What is this used for?" color="blue">
          <Text>
            The topic modeling algorithm may have managed to discover some
            topics automatically for you. However, some of the topic assignments
            may be incorrect; for example:
          </Text>
          <List withPadding listStyleType="disc">
            <List.Item>
              A document may be wrongly assigned to the wrong topic, so the
              topic assignment needs to be fixed.
            </List.Item>
            <List.Item>
              Two or more topics discuss about the same concept/theme so they
              need to be merged into one large topic. This usually occurs if you
              have a low maximum topic size.
            </List.Item>
            <List.Item>
              A single topic encompasses too many concepts at once, so it needs
              to be split into multiple smaller topics.
            </List.Item>
          </List>

          <Divider className="my-5" />

          <Text>
            In order to remedy the issues above, you can use this page to:
          </Text>
          <List withPadding listStyleType="disc">
            <List.Item>Change the topic of a single document.</List.Item>
            <List.Item>
              Change the topics of multiple documents at once.
            </List.Item>
            <List.Item>
              Change the label, description, and tags of a topic to help you
              understand it easily outside of the Topics page.
            </List.Item>
            <List.Item>
              Reorder the topics so that relevant topics show up earlier in any
              select inputs.
            </List.Item>
          </List>

          <Divider className="my-5" />
          <Text fw={500} c="red">
            Please note that topics that are not assigned to at least one
            document will be automatically removed.
          </Text>
        </Alert>
        <RefineTopicsForm />
      </TopicModelingRequirementSafeguard>
    </>
  );
};

RefineTopicsPage.getLayout = (children) => (
  <ProjectCommonDependencyProvider>{children}</ProjectCommonDependencyProvider>
);

export default RefineTopicsPage;
