import {Component, For} from "solid-js";
import {A, useParams} from "@solidjs/router";


import {activeModelService} from "../../../model/activeModel";
import {OrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import css from "./OrganizationsPage.module.css";  // TODO

const OrganizationPage: Component = () => {
    const organizationId = toOrganizationId(useParams().id)
    const organization = activeModelService.organizationsService.queryOrganizationById(organizationId);
    const projects = activeModelService.projectsService.queryProjectsByOrgId(organizationId)

    return (
        <>
            <h1>{organization?.name}</h1>
            <p>{organization?.summary}</p>

            <table>
                <tbody>
                <tr>
                    <th class={css.th}>Project</th>
                    <th class={css.th}>Summary</th>
                </tr>
                <For each={projects}
                     fallback={<tr><td colspan="2">(No projects in this organization.)</td></tr>}>
                    {(prj) =>
                        <tr>
                            <td><A href={`/${prj.id}`}>{prj.name}</A></td>
                            <td>{prj.summary}</td>
                        </tr>}
                </For>
                </tbody>
            </table>
        </>
    );
};

export default OrganizationPage;
