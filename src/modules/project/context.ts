import { ProjectModel } from "@/api/project";
import React from "react";

export const ProjectContext = React.createContext<ProjectModel | undefined>(undefined);