import { NextPageWithLayout } from '@/common/utils/types';
import ProjectConfigUpdateForm from '@/modules/config/update';
import { ProjectCommonDependencyProvider } from '@/modules/project/app-state';
import { ProjectContext } from '@/modules/project/context';
import React from 'react';

const UpdateProjectPage: NextPageWithLayout = function () {
  const data = React.useContext(ProjectContext);
  return <ProjectConfigUpdateForm data={data.config} />;
};

UpdateProjectPage.getLayout = (children) => {
  return (
    <ProjectCommonDependencyProvider>
      {children}
    </ProjectCommonDependencyProvider>
  );
};

export default UpdateProjectPage;
