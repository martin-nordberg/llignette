import {Component, Show} from "solid-js";

import {activeModelService, updateActiveModelService} from "../../../model/activeModel";
import uiState from "../../state/UiState";
import {DescribedId} from "$shared/llignette/nodes/core/Described";
import {NamedId} from "$shared/llignette/nodes/core/Named";
import {DOMElement} from "solid-js/jsx-runtime";

const SummaryTextInput: Component<{ id: DescribedId, placeholder: string }> = (props) => {
    const summary = activeModelService.findSummary(props.id) ?? ""

    return (
        <>
            <Show when={uiState.editing}>
                <input placeholder={`${props.placeholder} summary`} type="text" value={summary}
                       onChange={[updateSummary, props.id]}/>
            </Show>
            <Show when={!uiState.editing}>
                <p>{summary}</p>
            </Show>
        </>
    )
}

export default SummaryTextInput

const updateSummary =
    (id: NamedId, event: Event & { currentTarget: HTMLInputElement; target: DOMElement; }) => {
        updateActiveModelService(activeModelService.updateSummary(id, event.currentTarget?.value))
    }

