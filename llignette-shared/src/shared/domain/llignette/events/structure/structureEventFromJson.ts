import {ModelEvent, ModelEventJson} from "../../model/ModelEvent";
import {organizationEventFromJson} from "./OrganizationEvents";
import {projectOwnershipEventFromJson} from "./ProjectOwnershipEvents";

export function structureEventFromJson(eventJson: ModelEventJson): ModelEvent {
    const kind = eventJson.kind[1]
    switch (kind) {
        case 'Organization':
            return organizationEventFromJson(eventJson);
        case 'ProjectOwnership':
            return projectOwnershipEventFromJson(eventJson);
        default:
            throw new Error(`Unrecognized event kind: '${eventJson.kind}'.`)
    }
}