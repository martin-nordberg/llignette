// import {toName} from "$shared/domain/llignette/nodes/core/Named";
import {toName} from "$shared/domain/llignette/nodes/core/Named";
import {Model} from "$shared/domain/llignette/model/Model";
import {CreateOrganization} from "$shared/domain/llignette/events/structure/OrganizationEvents";
import {newOrganizationId} from "$shared/domain/llignette/nodes/structure/Organization";
import {OrganizationsService} from "$shared/domain/llignette/services/structure/OrganizationsService";


export const activeModel = new Model()



new CreateOrganization(newOrganizationId(), toName("acme")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("beta")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("corp")).apply(activeModel)


export const orgsService = new OrganizationsService(activeModel)

