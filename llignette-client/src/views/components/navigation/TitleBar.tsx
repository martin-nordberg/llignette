import {Component} from "solid-js";

import css from './TitleBar.module.css';
import BreadCrumbs from "./BreadCrumbs";

const TitleBar: Component = () => {
    return (
        <nav class={css.titlebar}>
            <ul>
                <li>
                    <a href="/">
                        <img src="/src/assets/images/logo.png" height="24" width="24" alt="Llignette Logo"
                             class={css.logo}/>
                    </a>
                </li>
                <li><BreadCrumbs/></li>
            </ul>

            <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Services</a></li>
                <li><a href="#">Products</a></li>
            </ul>
        </nav>
    )
}

export default TitleBar;
