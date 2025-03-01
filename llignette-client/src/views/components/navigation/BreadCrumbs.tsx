import {Component, For, Show} from "solid-js";

import css from './BreadCrumbs.module.css';
import {Params, useParams} from "@solidjs/router";
import {isOrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {activeModelService} from "../../../model/activeModel";
import {isProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {Named} from "$shared/llignette/nodes/core/Named";

type NamedLink = {
    url?: string | undefined,
    text: string,
}

const makeLink = (node: Named | null) =>
    ({url: `/${node?.id}`, text: node?.name ?? "Unknown Organization"})


const makeNonLink = (node: Named | null) =>
    ({text: node?.name ?? "Unknown Organization"})

const makeLinks = (params: Params) =>
    () => {
        const {id} = params

        const result: NamedLink[] = []

        if (id == null) {
            return result
        }

        if (isOrganizationId(id)) {
            const organizationId = toOrganizationId(id)
            const organization = activeModelService.organizationsService.queryOrganizationById(organizationId);
            result.push(makeNonLink(organization))
        } else if (isProjectId(id)) {
            const projectId = toProjectId(id)
            const organization = activeModelService.organizationsService.queryOrganizationByProjectId(projectId)
            result.push(makeLink(organization))
            const project = activeModelService.projectsService.queryProjectById(projectId)
            result.push(makeNonLink(project))
        }

        return result
    }

const BreadCrumbs: Component = () => {

    const links = makeLinks(useParams())

    return (
        <nav aria-label="breadcrumb" class={css.nav}>
            <ul>
                <li><a href="/">Llignette</a></li>

                <For each={links()}>
                    {(link) => (
                        <>
                            <Show when={link.url}>
                                <li><a href={link.url}>{link.text}</a></li>
                            </Show>
                            <Show when={!link.url}>
                                <li>{link.text}</li>
                            </Show>
                        </>
                    )}
                </For>
            </ul>
        </nav>
    )
}

export default BreadCrumbs;
