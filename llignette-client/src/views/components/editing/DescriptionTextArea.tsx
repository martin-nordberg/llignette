
import {Component, Show} from "solid-js";

import {activeModelService, updateActiveModelService} from "../../../model/activeModel";
import uiState from "../../state/UiState";
import {DescribedId} from "$shared/llignette/nodes/core/Described";
import {DOMElement} from "solid-js/jsx-runtime";

const DescriptionTextArea: Component<{id: DescribedId, placeholder: string}> = (props) => {
    const description = activeModelService.findDescription(props.id) ?? ""

    return (
        <>
            <Show when={uiState.editing}>
                <textarea placeholder={`${props.placeholder} description`} onChange={[updateDescription, props.id]}>
                    {description}
                </textarea>
            </Show>
            <Show when={!uiState.editing}>
                <p>{description}</p>
            </Show>
        </>
    )
}

export default DescriptionTextArea;

const updateDescription =
    (id: DescribedId, event: Event & { currentTarget: HTMLTextAreaElement; target: DOMElement; }) => {
        updateActiveModelService(activeModelService.updateDescription(id, event.currentTarget?.value))
    }

