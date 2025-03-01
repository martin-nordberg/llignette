import type {Component} from "solid-js";
import type {RouteSectionProps} from "@solidjs/router/dist/types";
import TitleBar from "../components/navigation/TitleBar";
import BreadCrumbs from "../components/navigation/BreadCrumbs";

const LlignetteLayout: Component<RouteSectionProps> = (props) => {
    return (
        <>
            <TitleBar/>
            {props.children}
        </>
    );
};

export default LlignetteLayout
