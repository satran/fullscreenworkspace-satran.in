# Gnome Shell Extension Fullscreen to Workspace

I got inspired by a feature by Elementary OS (which comes from macOS). It moves a fullscreen application to a separate workspace. This extension does just that. A lot of the code ideas come from https://github.com/rliang/gnome-shell-extension-maximize-to-workspace.

# Installation from source
```
git clone https://github.com/satran/fullscreenworkspace-satran.in ~/.local/share/gnome-shell/extensions/fullscreenworkspace@satran.in
gnome-shell-extension-tool -e fullscreenworkspace@satran.in
```

# Caveats
* The latest version I have only GNOME 41, I'm not sure if this works with older systems.
- Works best with a single monitor, it does work with multiple monitors but is a bit wonky.
