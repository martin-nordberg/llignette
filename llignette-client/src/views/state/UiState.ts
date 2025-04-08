import {createStore} from "solid-js/store";


const [uiState, setUiState] = createStore({
    editing: false
});

export const toggleEditing = () => {
    setUiState('editing', (editing) => !editing)
}

export default uiState

