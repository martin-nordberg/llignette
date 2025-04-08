import {Component, Show} from "solid-js";

import {activeModelService, updateActiveModelService} from "../../../model/activeModel";
import uiState from "../../state/UiState";
import {NamedId} from "$shared/llignette/nodes/core/Named";
import {DOMElement} from "solid-js/jsx-runtime";

const NameTextInput: Component<{ id: NamedId, placeholder: string }> = (props) => {
    const name = activeModelService.findName(props.id) ?? ""

    return (
        <>
            <Show when={uiState.editing}>
                <input placeholder={`${props.placeholder} name`} type="text" value={name}
                       onChange={[updateName, props.id]}/>
            </Show>
            <Show when={!uiState.editing}>
                <h1>{name}</h1>
            </Show>
        </>
    )
}

export default NameTextInput

const updateName =
    (id: NamedId, event: Event & { currentTarget: HTMLInputElement; target: DOMElement; }) => {
        updateActiveModelService(activeModelService.updateName(id, event.currentTarget?.value))
    }

// TODO: https://software.codidact.com/posts/284097#:~:text=We%20use%20input%3Afocus%20and,%2C%20regardless%20of%20its%20focus).