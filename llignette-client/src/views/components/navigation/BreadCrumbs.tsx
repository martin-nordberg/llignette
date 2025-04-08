import {Component, For, Show} from "solid-js";

import css from './BreadCrumbs.module.css';
import {Params, useParams} from "@solidjs/router";
import {isOrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {activeModelService} from "../../../model/activeModel";
import {isProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {Named} from "$shared/llignette/nodes/core/Named";
import EntityLink from "./EntityLink";
import uiState, {toggleEditing} from "../../state/UiState";

type Crumb = {
    text?: string
    entity?: Named
}

const makeLinkCrumb = (entity: Named | null) =>
    (entity ? {entity} : {text: "Unknown entity"})

const makeTextCrumb = (entity: Named | null) =>
    ({text: entity?.name ?? "Unknown entity"})

const makeCrumbs = (params: Params) =>
    () => {
        const {id} = params

        const result: Crumb[] = []

        if (id == null) {
            return result
        }

        if (isOrganizationId(id)) {
            const organizationId = toOrganizationId(id)
            const organization = activeModelService.findOrganizationById(organizationId);
            result.push(makeTextCrumb(organization))
        } else if (isProjectId(id)) {
            const projectId = toProjectId(id)
            const organization = activeModelService.findOrganizationByProjectId(projectId)
            result.push(makeLinkCrumb(organization))
            const project = activeModelService.findProjectById(projectId)
            result.push(makeTextCrumb(project))
        }

        return result
    }

const BreadCrumbs: Component = () => {

    const crumbs = makeCrumbs(useParams())

    return (
        <nav aria-label="breadcrumb" class={css.nav}>
            <ul>
                <li><a href="/">Llignette</a></li>

                <For each={crumbs()}>
                    {(crumb) => (
                        <>
                            <Show when={crumb.entity}>
                                <li><EntityLink entity={crumb.entity!} tooltipLocation="bottom"></EntityLink></li>
                            </Show>
                            <Show when={crumb.text}>
                                <li>{crumb.text}</li>
                            </Show>
                        </>
                    )}
                </For>

                <li>
                    <a class={css.editLink} classList={{[css.editLinkInverse]: uiState.editing}}
                       data-tooltip="Toggle edit mode (F2)" data-placement="bottom" onclick={toggleEditing}>
                        <i class={`fa-solid fa-pencil fa-sm`} classList={{["fa-inverse"]: uiState.editing}}></i>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default BreadCrumbs;
