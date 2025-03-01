import {IOrganizationsService} from "./structure/OrganizationsService";
import {IProjectsService} from "$shared/llignette/services/structure/ProjectsService";


/** Interface to all services for a Llignette model. */
export interface IModelService {

    organizationsService: IOrganizationsService

    projectsService: IProjectsService

}

