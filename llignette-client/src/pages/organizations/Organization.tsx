import type {Component} from "solid-js";
import {useParams} from "@solidjs/router";



const Organization: Component = () => {
    const params = useParams();
    return (
        <h1>Organization #{params.organizationId}</h1>
    );
};

export default Organization;
