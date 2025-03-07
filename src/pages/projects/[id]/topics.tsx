import { ProjectContext } from "@/modules/project/context";
import AppProjectLayout from "@/modules/project/layout";
import ProjectTopicsEmptyPage from "@/modules/topics/empty";
import React from "react";

function ProjectTopicSwitcher(){
  const project = React.useContext(ProjectContext);
  if (!project) return null;

  const topics = 
  return <ProjectTopicsEmptyPage />
}

export default function ProjectTopics() {
  return <AppProjectLayout>

  </AppProjectLayout>
}
