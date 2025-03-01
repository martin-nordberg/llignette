import {Component, For} from "solid-js";
import {A} from "@solidjs/router";

import {activeModelService} from "../../../model/activeModel";

import css from './OrganizationsPage.module.css';

const OrganizationsPage: Component = () => {
    return (
        <>
            <h1>Organizations</h1>
            <table>
                <tbody>
                <tr>
                    <th class={css.th}>Organization</th>
                    <th class={css.th}>Summary</th>
                </tr>
                <For each={activeModelService.organizationsService.queryAllOrganizations()}
                     fallback={<div>(No organizations found.)</div>}>
                    {(org) =>
                        <tr>
                            <td><A href={`./${org.id}`}>{org.name}</A></td>
                            <td>{org.summary}</td>
                        </tr>}
                </For>
                </tbody>
            </table>
        </>
    );
};

export default OrganizationsPage;
