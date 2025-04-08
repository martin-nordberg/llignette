import {
    findOrganizationById,
    findOrganizationByProjectId,
    findOrganizationsAll,
    IOrganizationServices
} from "./structure/OrganizationServices";
import {
    findDescription,
    findName,
    findSummary,
    ICoreServices,
    updateDescription,
    updateName,
    updateSummary,
} from "$shared/llignette/services/core/CoreServices";
import {DescribedId} from "$shared/llignette/nodes/core/Described";
import {NamedId} from "$shared/llignette/nodes/core/Named";
import {Model} from "$shared/llignette/model/Model";
import {Organization, OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {Project, ProjectId} from "$shared/llignette/nodes/structure/Project";
import {
    findProjectById,
    findProjectsByOrganizationId,
    IProjectServices
} from "$shared/llignette/services/structure/ProjectServices";


export interface IModelService
    extends ICoreServices<IModelService>,
        IOrganizationServices,
        IProjectServices {
}

export class ModelService implements IModelService {
    readonly #branchName: string
    readonly #model: Model

    constructor(
        model: Model,
        branchName: string
    ) {
        this.#model = model
        this.#branchName = branchName
    }

    /** Finds the description of an element. */
    findDescription(id: DescribedId): string | null {
        return findDescription(this.#model, this.#branchName, id)
    }

    /** Finds the name of an element. */
    findName(id: NamedId): string | null {
        return findName(this.#model, this.#branchName, id)
    }

    /** Finds one organization with given ID. */
    findOrganizationById(organizationId: OrganizationId): Organization | null {
        return findOrganizationById(this.#model, this.#branchName, organizationId)
    }

    /** Finds the parent organization of a given project. */
    findOrganizationByProjectId(projectId: ProjectId): Organization | null {
        return findOrganizationByProjectId(this.#model, this.#branchName, projectId)
    }

    /** Finds all organizations. */
    findOrganizationsAll(): Organization[] {
        return findOrganizationsAll(this.#model, this.#branchName)
    }

    /** Finds one project with given ID. */
    findProjectById(projectId: ProjectId): Project | null {
        return findProjectById(this.#model, this.#branchName, projectId)
    }

    /** Finds all projects of a given organization. */
    findProjectsByOrganizationId(organizationId: OrganizationId): Project[] {
        return findProjectsByOrganizationId(this.#model, this.#branchName, organizationId)
    }

    /** Finds the summary of an element. */
    findSummary(id: DescribedId): string | null {
        return findSummary(this.#model, this.#branchName, id)
    }

    /** Changes the description of an element. */
    updateDescription(id: DescribedId, description: string): ModelService {
        const newModel = updateDescription(this.#model, this.#branchName, id, description)
        return new ModelService(newModel, this.#branchName)
    }

    /** Changes the name of an element. */
    updateName(id: NamedId, name: string): ModelService {
        const newModel = updateName(this.#model, this.#branchName, id, name)
        return new ModelService(newModel, this.#branchName)
    }

    /** Changes the summary of an element. */
    updateSummary(id: DescribedId, summary: string): ModelService {
        const newModel = updateSummary(this.#model, this.#branchName, id, summary)
        return new ModelService(newModel, this.#branchName)
    }

}

