const Meta = imports.gi.Meta;

function init() {
    
}
const _handles = [];

var _previousWorkspace = {};

function maximize(act) {
    const win = act.meta_window;
    //if (win.window_type !== Meta.WindowType.NORMAL)
    	//return;
    if (win.get_maximized() !== Meta.MaximizeFlags.BOTH)
	return;

    // If the current workspace doesn't have any other windows make it maximized here.
    if (global.workspace_manager.get_active_workspace().list_windows().length == 1)
	return;

    _previousWorkspace[win.toString()] = global.workspace_manager.get_active_workspace_index();
    let lastworkspace = global.workspace_manager.n_workspaces;
    if (lastworkspace<1)
	lastworkspace=1;
    win.change_workspace_by_index(lastworkspace,1);
    global.workspace_manager.get_workspace_by_index(lastworkspace).activate(global.get_current_time());
}

function unmaximize(act){
    const win = act.meta_window;
    // Meta.MaximizeFlags doesn't have anything for it not being set, 0 means it is not maximized
    if (win.get_maximized() !== 0)
	return;
    let previous = _previousWorkspace[win.toString()];
    if (previous == null || previous == undefined)
	return;
    win.change_workspace_by_index(previous, 1);
    global.workspace_manager.get_workspace_by_index(previous).activate(global.get_current_time());
}

function enable() {
    //global.get_window_actors().forEach(check);
    _handles.push(global.window_manager.connect('map', (_, act) => maximize(act)));
    _handles.push(global.window_manager.connect('size-change', (_, act, change) => {
	if (change === Meta.SizeChange.MAXIMIZE) maximize(act);
	if (change === Meta.SizeChange.UNMAXIMIZE) unmaximize(act);
    }));
}

function disable() {
    _handles.splice(0).forEach(h => global.window_manager.disconnect(h));
}
