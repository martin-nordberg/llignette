/* @refresh reload */
import {render} from 'solid-js/web';

import './assets/css/pico.cyan.min.css';
import './index.css';

import {Route, Router} from "@solidjs/router";
import {lazy} from "solid-js";
import {isOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {isProjectId} from "$shared/llignette/nodes/structure/Project";
import LlignetteLayout from "./views/layouts/LlignetteLayout";

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    )
}

const OrganizationPage = lazy(() => import("./views/pages/organizations/OrganizationPage"))
const OrganizationsPage = lazy(() => import("./views/pages/organizations/OrganizationsPage"))
const ProjectPage = lazy(() => import("./views/pages/projects/ProjectPage"))


render(() => (
    <Router root={LlignetteLayout}>
        <Route path="/" component={OrganizationsPage}/>
        <Route path="/:id" component={OrganizationPage} matchFilters={{id:isOrganizationId}}/>
        <Route path="/:id" component={ProjectPage} matchFilters={{id:isProjectId}}/>
    </Router>
), root!)