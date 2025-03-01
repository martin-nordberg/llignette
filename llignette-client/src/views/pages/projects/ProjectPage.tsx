import {Component} from "solid-js";

import {activeModelService} from "../../../model/activeModel";
import {toProjectId} from "$shared/llignette/nodes/structure/Project";
import {useParams} from "@solidjs/router";

const ProjectPage: Component = () => {
    const projectId = toProjectId(useParams().id)
    const project = activeModelService.projectsService.queryProjectById(projectId)

    return (
        <>
            <h1>{project?.name}</h1>
            <p>{project?.summary}</p>
        </>
    );
};

export default ProjectPage;
