import useGetParentRef, { ParentRefType } from "@/hooks/parent-ref";
import React from "react";
import { useCombinedRefs } from "@/hooks/ref";
import { AppShell, Flex, ScrollArea } from "@mantine/core";
import LayoutStyles from './layout.module.css';

interface AppLayoutProps {
  Aside?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AppLayout(props: AppLayoutProps) {
  const { Aside: Aside, children } = props;
  const loadingRef = useGetParentRef(ParentRefType.Loading);
  const scrollRef = useGetParentRef(ParentRefType.Scroll);
  const combineRef = useCombinedRefs(loadingRef, scrollRef);
  return (
    <AppShell>
      <AppShell.Aside>
        {Aside}
      </AppShell.Aside>
      <AppShell.Main ref={combineRef}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
