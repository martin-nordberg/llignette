import {Model} from "../../model/Model";
import {checkNonNull} from "../../../../common/util/Assertions";
import {ModelEventJson, ModelEvent} from "../../model/ModelEvent";
import {Name, toName} from "../../nodes/core/Named";
import {Organization, OrganizationId, toOrganizationId} from "../../nodes/structure/Organization";
import {ProjectOwnership} from "../../links/structure/ProjectOwnership";

/** A model edit to create a brand-new organization with its name set. */
export class CreateOrganization implements ModelEvent {

    constructor(
        private organizationId: OrganizationId,
        private name: Name,
    ) {
    }

    apply(model: Model) {
        const organization: Organization = {
            id: this.organizationId,
            isDeleted: false,
            name: this.name,
        }

        // Add the organization.
        model.nodes.organizations.put(organization)

        // Start out with an empty set of project ownerships.
        model.links.projectOwnerships.byOrganization.set(organization.id, new Set<ProjectOwnership>())
    }

    reversingEdit(): ModelEvent {
        return new DeleteOrganization(this.organizationId)
    }

    toJson(): ModelEventJson {
        return {
            kind: 'structure.Organization.Create',
            name: this.name,
            organizationId: this.organizationId,
        }
    }

}

/** A model edit to delete an organization. */
export class DeleteOrganization implements ModelEvent {

    constructor(
        private organizationId: OrganizationId,
    ) {
    }

    apply(model: Model) {
        const organization = model.nodes.organizations.get(this.organizationId)

        model.nodes.organizations.put({
            ...organization,
            isDeleted: true
        });
    }

    reversingEdit(): ModelEvent {
        return new UndeleteOrganization(this.organizationId)
    }

    toJson(): ModelEventJson {
        return {
            kind: 'structure.Organization.Delete',
            organizationId: this.organizationId
        }
    }

}

/** A model edit to rename an organization. */
export class RenameOrganization implements ModelEvent {

    #priorName?: Name

    constructor(
        private organizationId: OrganizationId,
        private name: Name
    ) {
    }

    apply(model: Model) {
        const node = model.nodes.organizations.get(this.organizationId)

        model.nodes.organizations.put({
            ...node,
            name: this.name
        })
    }

    reversingEdit(): ModelEvent {
        checkNonNull(this.#priorName, () => "Cannot reverse this organization rename edit until it has been applied.")

        return new RenameOrganization(this.organizationId, this.#priorName)
    }

    toJson(): ModelEventJson {
        return {
            kind: 'structure.Organization.Rename',
            organizationId: this.organizationId,
            name: this.name,
        }
    }

}

/** A model edit to reverse deletion of an organization. */
export class UndeleteOrganization implements ModelEvent {

    constructor(
        private organizationId: OrganizationId,
    ) {
    }

    apply(model: Model) {
        const organization = model.nodes.organizations.get(this.organizationId)

        model.nodes.organizations.put({
            ...organization,
            isDeleted: false
        });
    }

    reversingEdit(): ModelEvent {
        return new DeleteOrganization(this.organizationId)
    }

    toJson(): ModelEventJson {
        return {
            kind: 'structure.Organization.Undelete',
            organizationId: this.organizationId
        }
    }

}

export function organizationEventFromJson(eventJson: ModelEventJson): ModelEvent {
    switch (eventJson.kind[2]) {
        case 'Create':
            return new CreateOrganization(
                toOrganizationId(eventJson.organizationId),
                toName(eventJson.name)
            )
        case 'Delete':
            return new DeleteOrganization(
                toOrganizationId(eventJson.organizationId),
            )
        case 'Rename':
            return new RenameOrganization(
                toOrganizationId(eventJson.organizationId),
                toName(eventJson.name)
            )
        case 'Undelete':
            return new UndeleteOrganization(
                toOrganizationId(eventJson.organizationId)
            )
        default:
            throw new Error(`Unrecognized event kind: '${eventJson.kind}'.`)
    }
}