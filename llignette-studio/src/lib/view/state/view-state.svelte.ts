/** The levels of detail to show in the editing pane. */
export type TreeDepth =
    'Summaries' | 'Descriptions' | 'Details'

/** The information to track the current view state. */
export type ViewState = {
    modelId: string;
    treeDepth: TreeDepth;
}

/** The current view state. */
export let viewState: ViewState = $state.raw({
    modelId: '',
    treeDepth: 'Summaries'
})

/** Change the focused model element. */
export function setModelId(modelId: string): void {
    viewState = {...viewState, modelId}
}

/** Change the tree depth. */
export function setTreeDepth(treeDepth: TreeDepth): void {
    viewState = {...viewState, treeDepth}
}
