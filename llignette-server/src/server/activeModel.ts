import {Model} from "../shared/domain/llignette/model/Model";
import {toName} from "../shared/domain/llignette/nodes/core/Named";
import {CreateOrganization} from "../shared/domain/llignette/events/structure/OrganizationEvents";
import {newOrganizationId} from "../shared/domain/llignette/nodes/structure/Organization";


export const activeModel = new Model()


new CreateOrganization(newOrganizationId(), toName("acme")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("beta")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("corp")).apply(activeModel)