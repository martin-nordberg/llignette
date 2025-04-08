import {Component} from "solid-js";

import css from './ActionIcon.module.css'

const ActionIcon: Component<{ iconName: string }> = (props) => {

    return (
        <a href="javascript:alert('xx')">
            <i class={`${css.icon} fa-solid fa-${props.iconName}`}></i>
        </a>
    )
}

export default ActionIcon;
