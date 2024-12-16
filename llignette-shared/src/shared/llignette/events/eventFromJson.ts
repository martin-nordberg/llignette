import {ModelEvent, ModelEventJson} from "../model/ModelEvent";
import {structureEventFromJson} from "./structure/structureEventFromJson";

export function eventFromJson(eventJson: ModelEventJson): ModelEvent {
    const kind = eventJson.kind[0];
    switch (kind) {
        case 'structure':
            return structureEventFromJson(eventJson);
        default:
            throw new Error(`Unrecognized event kind: '${eventJson.kind}'.`)
    }
}