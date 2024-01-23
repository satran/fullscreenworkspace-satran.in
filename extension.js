/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
// See: https://gjs.guide/extensions/topics/extension.html#extension
import Meta from "gi://Meta";
import Gio from "gi://Gio";
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class PlainExampleExtension extends Extension {
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

	unmaximize(act, destroyed) {
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
		if(false == destroyed)
		  global.workspaceManager.remove_workspace(fullScreenWorkspace, global.get_current_time());
	}

	enable() {
		console.log(`enabling ${this.metadata.name}`);
		this.settings = this.getSettings('org.gnome.shell.extensions.fullscreenworkspace');

		this._handles.push(global.window_manager.connect('size-change', (_, act, change, from, to) => {
			let dis = global.get_display();
			if (dis.get_primary_monitor() != dis.get_monitor_index_for_rect(to)) return;
			
			if (this.settings.get_boolean('maximized-windows')) {
				if (act.get_meta_window().get_maximized() === Meta.MaximizeFlags.BOTH) this.maximize(act);
				if (change === Meta.SizeChange.UNMAXIMIZE) this.unmaximize(act, false);
			}
			if (change === Meta.SizeChange.FULLSCREEN) this.maximize(act);
			if (change === Meta.SizeChange.UNFULLSCREEN) this.unmaximize(act, false);
		}));

		this._handles.push(global.window_manager.connect('destroy', (_, act, change) => {
			this.unmaximize(act, true)
		}));
	}

	disable() {
		this._handles.splice(0).forEach(h => global.window_manager.disconnect(h));
	}
}


function init() {
	return new Extension();
}

