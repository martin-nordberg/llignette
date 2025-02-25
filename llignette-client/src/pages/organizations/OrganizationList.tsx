import type {Component} from "solid-js";
import {A} from "@solidjs/router";


const OrganizationList: Component = () => {
    return (
        <>
            <h1>Organizations</h1>
            <ul>
                <li><A href="./1">One</A></li>
                <li><A href="./2">Two</A></li>
            </ul>
        </>
    );
};

export default OrganizationList;
