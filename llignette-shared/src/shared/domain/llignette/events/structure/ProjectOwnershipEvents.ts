import {Model} from "../../model/Model";
import {OrganizationId, toOrganizationId} from "../../nodes/structure/Organization";
import {ProjectId, toProjectId} from "../../nodes/structure/Project";
import {check, checkNonNull} from "../../../../common/util/Assertions";
import {ModelEventJson, ModelEvent} from "../../model/ModelEvent";

/** A model edit to transfer ownership of a project from one organization to another. */
export class TransferProjectOwnership implements ModelEvent {

    #priorOrganizationId?: OrganizationId

    constructor(
        private organizationId: OrganizationId,
        private projectId: ProjectId
    ) {
    }

    apply(model: Model) {

        // The ownership must involve entities already in the model.
        check(model.nodes.organizations.isPresent(this.organizationId), () => `Organization with ID '${this.organizationId}' must be present in the model.`)
        check(model.nodes.projects.isPresent(this.projectId), () => `Project with ID '${this.projectId}' must be present in the model.`)

        // Find the prior ownership.
        const priorOwnership = model.links.projectOwnerships.byProject.get(this.projectId)
        checkNonNull(priorOwnership, () => `Expected a prior ownership to be present in the model.`)

        // First remove the project's existing ownership.
        model.links.projectOwnerships.byProject.delete(priorOwnership.projectId)
        model.links.projectOwnerships.byOrganization.get(priorOwnership.organizationId)!.delete(priorOwnership)

        // Save the prior owner for reversibility.
        this.#priorOrganizationId = priorOwnership.organizationId

        // Construct the new ownership.
        const ownership = {organizationId: this.organizationId, projectId: this.projectId}

        // Add by project ID.
        model.links.projectOwnerships.byProject.set(this.projectId, ownership)

        // Add by organization ID, knowing the set was created when the organization was added.
        model.links.projectOwnerships.byOrganization.get(this.organizationId)!.add(ownership)

    }

    reversingEdit(): ModelEvent {
        checkNonNull(this.#priorOrganizationId, () => "Cannot reverse this project ownership transfer edit until it has been applied.")

        return new TransferProjectOwnership(this.#priorOrganizationId, this.projectId)
    }

    toJson(): ModelEventJson {
        return {
            kind: 'structure.ProjectOwnership.Transfer',
            organizationId: this.organizationId,
            projectId: this.projectId,
        }
    }

}




export function projectOwnershipEventFromJson(eventJson: ModelEventJson): ModelEvent {
    switch (eventJson.kind[2]) {
        case 'Transfer':
            return new TransferProjectOwnership(
                toOrganizationId(eventJson.organizationId),
                toProjectId(eventJson.projectId)
            )
        default:
            throw new Error(`Unrecognized event name: '${eventJson.kind}'.`)
    }
}