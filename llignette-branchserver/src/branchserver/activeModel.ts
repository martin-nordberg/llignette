// import {toName} from "$shared/domain/llignette/nodes/core/Named";
import {toName} from "$shared/llignette/nodes/core/Named";
import {Model} from "$shared/llignette/model/Model";
import {CreateOrganization} from "$shared/llignette/events/structure/OrganizationEvents";
import {newOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {OrganizationsService} from "$shared/llignette/services/structure/OrganizationsService";
import {IModelService} from "$shared/llignette/services/ModelService";


export const activeModel = new Model()



new CreateOrganization(newOrganizationId(), toName("acme")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("beta")).apply(activeModel)
new CreateOrganization(newOrganizationId(), toName("corp")).apply(activeModel)


export const activeModelService: IModelService = {
    organizationsService: new OrganizationsService(activeModel)
}

