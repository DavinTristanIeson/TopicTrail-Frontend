import NavigationRoutes from '@/common/constants/routes';
import { useRouter } from 'next/router';
import React from 'react';

export default function ProjectRedirect() {
  const router = useRouter();
  const queryId = router.query.id as string;
  React.useEffect(() => {
    router.replace(NavigationRoutes.ProjectTopics, {
      query: {
        id: queryId,
      },
    });
  }, [queryId, router]);
  return <></>;
}
