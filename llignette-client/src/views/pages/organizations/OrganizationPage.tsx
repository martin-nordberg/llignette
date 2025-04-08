import {Component, For} from "solid-js";
import {useParams} from "@solidjs/router";


import {activeModelService} from "../../../model/activeModel";
import {toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import css from "./OrganizationPage.module.css";
import EntityLink from "../../components/navigation/EntityLink"; // TODO

const OrganizationPage: Component = () => {
    const organizationId = toOrganizationId(useParams().id)
    const organization = activeModelService.findOrganizationById(organizationId);
    const projects = activeModelService.findProjectsByOrganizationId(organizationId)

    return (
        <>
            <h1>{organization?.name}</h1>
            <p>{organization?.summary}</p>

            <table class={css.table}>
                <tbody>
                <tr>
                    <th class={css.th}>Project</th>
                    <th class={css.th}>Summary</th>
                </tr>
                <For each={projects}
                     fallback={<tr>
                         <td colspan="2">(No projects in this organization.)</td>
                     </tr>}>
                    {(prj) =>
                        <tr>
                            <td><EntityLink entity={prj}/></td>
                            <td>{prj.summary}</td>
                        </tr>}
                </For>
                <tr>
                    <td colspan="2">
                        <button class={css.addButton}>+</button>
                    </td>
                </tr>
                </tbody>
            </table>
        </>
    );
};

export default OrganizationPage;
