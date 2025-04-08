import type {Component} from "solid-js";
import type {RouteSectionProps} from "@solidjs/router/dist/types";
import TitleBar from "../components/navigation/TitleBar";

import css from './LlignetteLayout.module.css';

const LlignetteLayout: Component<RouteSectionProps> = (props) => {
    return (
        <>
            <TitleBar/>
            <main class={css.main}>
                {props.children}
            </main>
        </>
    );
};

export default LlignetteLayout
