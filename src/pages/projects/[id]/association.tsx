import { ProjectModel } from "@/api/project/model";
import AppProjectLayout from "@/modules/projects/common/layout";

function ProjectAssociationPageBody(props: ProjectModel) {
  return <></>;
}

export default function ProjectAssociationPage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectAssociationPageBody {...project} />}
    </AppProjectLayout>
  );
}
