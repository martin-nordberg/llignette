import {Component} from "solid-js";
import {Named} from "$shared/llignette/nodes/core/Named";
import {A} from "@solidjs/router";

export type TooltipLocation = 'none' | 'top' | 'right' | 'bottom' | 'left'

const EntityLink: Component<{ entity: Named, tooltipLocation?: TooltipLocation }> = (props) => {
    return (
        !props.tooltipLocation || props.tooltipLocation == 'none' ?
            (<A href={`/${props.entity.id}`}>{props.entity.name}</A>) :
            <A href={`/${props.entity.id}`} data-tooltip={props.entity?.summary ?? ""}
               data-placement={props.tooltipLocation}>{props.entity.name}</A>
    )
}

export default EntityLink;
