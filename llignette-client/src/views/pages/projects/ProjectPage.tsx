import {Component} from "solid-js";

import {toProjectId} from "$shared/llignette/nodes/structure/Project";
import {useParams} from "@solidjs/router";
import NameTextInput from "../../components/editing/NameTextInput";
import SummaryTextInput from "../../components/editing/SummaryTextInput";
import DescriptionTextArea from "../../components/editing/DescriptionTextArea";

const ProjectPage: Component = () => {
    const projectId = toProjectId(useParams().id)

    return (
        <>
            <NameTextInput id={projectId} placeholder="Project"/>
            <SummaryTextInput id={projectId} placeholder="Project"/>
            <DescriptionTextArea id={projectId} placeholder="Project"/>
        </>
    )
}

export default ProjectPage;
