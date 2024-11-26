import {Project} from "../structure/nodes/Project";
import {Organization} from "../structure/nodes/Organization";
import {OrganizationsOwnProjects} from "../structure/links/OrganizationOwnsProject";
import {NodesById} from "./NodesById";

/** A graph of model nodes and links. */
export class Model {

    readonly nodes = {
        organizations: new NodesById<'Organization', Organization>,
        projects: new NodesById<'Project', Project>,
    }

    readonly links = {
        organizationsOwnProjects: OrganizationsOwnProjects()
    }

}

