'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.fullscreenworkspace');

    let prefsWidget = new Gtk.Grid({
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });
    prefsWidget.set_margin_start(12);
    prefsWidget.set_margin_end(12);
    prefsWidget.set_margin_top(12);
    prefsWidget.set_margin_bottom(12);

    let title = new Gtk.Label({
        label: `<b>${Me.metadata.name} Preferences</b>`,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

    let toggleLabel = new Gtk.Label({
        label: 'Maximized windows on separate workspace',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(toggleLabel, 0, 1, 1, 1);

    let toggle = new Gtk.Switch({
        active: this.settings.get_boolean ('maximized-windows'),
        halign: Gtk.Align.END,
        visible: true
    });
    prefsWidget.attach(toggle, 1, 1, 1, 1);

    this.settings.bind(
        'maximized-windows',
        toggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

    return prefsWidget;
}
