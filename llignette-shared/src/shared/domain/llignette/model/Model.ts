import {Project} from "../nodes/structure/Project";
import {Organization} from "../nodes/structure/Organization";
import {ProjectOwnerships} from "../links/structure/ProjectOwnership";
import {NodesById} from "./NodesById";

/** A graph of model nodes and links. */
export class Model {

    readonly nodes = {
        organizations: new NodesById<'Organization', Organization>,
        projects: new NodesById<'Project', Project>,
    }

    readonly links = {
        projectOwnerships: ProjectOwnerships()
    }

}

