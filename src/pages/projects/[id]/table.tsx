import { ProjectModel } from "@/api/project/model";
import AppProjectLayout from "@/modules/projects/common/layout";

function ProjectTablePageBody(props: ProjectModel) {
  return <></>;
}

export default function ProjectTablePage() {
  return (
    <AppProjectLayout>
      {(project) => <ProjectTablePageBody {...project} />}
    </AppProjectLayout>
  );
}
