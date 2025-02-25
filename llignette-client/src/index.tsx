/* @refresh reload */
import {render} from 'solid-js/web';

import './index.css';
import App from './pages/app/App';
import {Route, Router} from "@solidjs/router";
import {lazy} from "solid-js";

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
    );
}

const Organization = lazy(() => import("./pages/organizations/Organization"));
const OrganizationList = lazy(() => import("./pages/organizations/OrganizationList"));


render(() => (
    <Router>
        <Route path="/" component={App}/>
        <Route path="/hello-world" component={() => <h1>Hello World!</h1>} />
        <Route path="organizations">
            <Route path="/" component={OrganizationList}/>
            <Route path="/:organizationId" component={Organization}/>
        </Route>
    </Router>
), root!)