import {Model} from "../../model/Model";
import {OrganizationId} from "../nodes/Organization";
import {ProjectId} from "../nodes/Project";
import {check, checkNonNull} from "../../../../common/util/Assertions";
import {ModelEdit} from "../../model/ModelEdit";

/** A model edit to transfer ownership of a project from one organization to another. */
export class TransferProjectOwnership implements ModelEdit {

    #priorOrganizationId?: OrganizationId

    constructor(
        private organizationId: OrganizationId,
        private projectId: ProjectId
    ) {
    }

    apply(model: Model) {

        // The ownership must involve entities already in the model.
        check(model.nodes.organizations.isPresent(this.organizationId), "Organization must be present in the model.")
        check(model.nodes.projects.isPresent(this.projectId), "Project must be present in the model.")

        // Find the prior ownership.
        const priorOwnership = model.links.organizationsOwnProjects.byProject.get(this.projectId)
        checkNonNull(priorOwnership, "Expected a prior ownership to be present in the model.")

        // First remove the project's existing ownership.
        model.links.organizationsOwnProjects.byProject.delete(priorOwnership.projectId)
        model.links.organizationsOwnProjects.byOrganization.get(priorOwnership.organizationId)!.delete(priorOwnership)

        // Save the prior owner for reversibility.
        this.#priorOrganizationId = priorOwnership.organizationId

        // Construct the new ownership.
        const ownership = {organizationId: this.organizationId, projectId: this.projectId}

        // Add by project ID.
        model.links.organizationsOwnProjects.byProject.set(this.projectId, ownership)

        // Add by organization ID, knowing the set was created when the organization was added.
        model.links.organizationsOwnProjects.byOrganization.get(this.organizationId)!.add(ownership)

    }

    reversingEdit(): ModelEdit {
        checkNonNull(this.#priorOrganizationId, "Cannot reverse this edit until it has been applied.")

        return new TransferProjectOwnership(this.#priorOrganizationId, this.projectId)
    }

}



