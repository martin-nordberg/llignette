import {Component, For} from "solid-js";

import {activeModelService} from "../../../model/activeModel";

import css from './OrganizationsPage.module.css';
import EntityLink from "../../components/navigation/EntityLink";

const OrganizationsPage: Component = () => {
    return (
        <>
            <h1>Organizations</h1>
            <table class={css.table}>
                <tbody>
                <tr>
                    <th class={css.th}>Organization</th>
                    <th class={css.th}>Summary</th>
                </tr>
                <For each={activeModelService.findOrganizationsAll()}
                     fallback={<div>(No organizations found.)</div>}>
                    {(org) =>
                        <tr>
                            <td><EntityLink entity={org}/></td>
                            <td>{org.summary}</td>
                        </tr>}
                </For>
                </tbody>
            </table>
        </>
    );
};

export default OrganizationsPage;
