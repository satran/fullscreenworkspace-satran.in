const Gio = imports.gi.Gio;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Meta = imports.gi.Meta;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;


class Extension {
	constructor() {
		this._maximized = GObject.type_from_name('gboolean');
		this._handles = [];
		this._previousWorkspace = {};
	}

	maximize(act) {
		const win = act.meta_window;
		if (win.window_type !== Meta.WindowType.NORMAL)
			return;
		// If the current workspace doesn't have any other windows make it maximized here.
		if (global.workspace_manager.get_active_workspace().list_windows().length == 1)
			return;
		this._previousWorkspace[win.toString()] = global.workspace_manager.get_active_workspace_index();
		let lastworkspace = global.workspace_manager.n_workspaces;
		if (lastworkspace < 1)
			lastworkspace = 1;
		win.change_workspace_by_index(lastworkspace, 1);
		global.workspace_manager.get_workspace_by_index(lastworkspace).activate(global.get_current_time());
	}

	unmaximize(act) {
		const win = act.meta_window;
		if (win.window_type !== Meta.WindowType.NORMAL)
			return;
		let previous = this._previousWorkspace[win.toString()];
		if (previous == null || previous == undefined)
			return;
		delete this._previousWorkspace[win.toString()];
		win.change_workspace_by_index(previous, 1);
		let fullScreenWorkspace = global.workspace_manager.get_active_workspace();
		global.workspace_manager.get_workspace_by_index(previous).activate(global.get_current_time());
		global.workspaceManager.remove_workspace(fullScreenWorkspace);
	}

	enable() {
		log(`enabling ${Me.metadata.name}`);
		this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.fullscreenworkspace');

		this._handles.push(global.window_manager.connect('size-change', (_, act, change, from, to) => {
			let dis = global.get_display();
			if (dis.get_primary_monitor() != dis.get_monitor_index_for_rect(to)) return;

			if (this.settings.get_boolean('maximized-windows')) {
				if (change === Meta.SizeChange.MAXIMIZE) this.maximize(act);
				if (change === Meta.SizeChange.UNMAXIMIZE) this.unmaximize(act);
			}
			if (change === Meta.SizeChange.FULLSCREEN) this.maximize(act);
			if (change === Meta.SizeChange.UNFULLSCREEN) this.unmaximize(act);
		}));

		this._handles.push(global.window_manager.connect('destroy', (_, act, change) => {
			this.unmaximize(act)
		}));
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
		this._handles.splice(0).forEach(h => global.window_manager.disconnect(h));
	}
}


function init() {
	return new Extension();
}

