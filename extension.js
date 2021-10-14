const Meta = imports.gi.Meta;

var _handles = [];
var _previousWorkspace = {};

function maximize(act) {
	const win = act.meta_window;
	if (win.window_type !== Meta.WindowType.NORMAL) return;

	let active = global.workspace_manager.get_active_workspace();
	if (win.get_workspace() != active) return;

	// If the current workspace doesn't have any other windows make it maximized here.
	if (active.list_windows().length == 1) return;

	_previousWorkspace[win] = active;

	let last = Math.max(1, global.workspace_manager.get_n_workspaces()-1);
	let ws = global.workspace_manager.get_workspace_by_index(last);
	win.change_workspace(ws);
	global.workspace_manager.reorder_workspace(ws, active.index()+1);
	ws.activate(global.get_current_time());
}

function unmaximize(act) {
	const win = act.meta_window;
	if (win.window_type !== Meta.WindowType.NORMAL) return;

	let previous = _previousWorkspace[win];
	if (!previous) return;

	win.change_workspace(previous);
	previous.activate(global.get_current_time());

	delete _previousWorkspace[win];
}

function close(act) {
	const win = act.meta_window;
	if (win.window_type !== Meta.WindowType.NORMAL) return;

	let previous = _previousWorkspace[win];
	if (!previous) return;

	previous.activate(global.get_current_time());

	delete _previousWorkspace[win];
}

function enable() {
	let wm = global.window_manager;

	_handles.push(wm.connect('size-change', (_, act, change) => {
		if (change === Meta.SizeChange.FULLSCREEN) maximize(act);
		if (change === Meta.SizeChange.UNFULLSCREEN) unmaximize(act);
	}));

	_handles.push(wm.connect('destroy', (_, act) => close(act)));
}

function disable() {
	_handles.forEach(h => global.window_manager.disconnect(h));
}
