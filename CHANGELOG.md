2021-02-13
- NEW: Walls now have colliders!
- NEW: (Build Mode) Avatar does not collide with things when in build mode (except for the ground).
- NEW: (Build Mode) Colliders are visible! For example, even if the object has no Shape component, or if the Collider is a different kind or size than the Shape, you can see what where the collider is. Note: this makes it possible to remove a Shape component and still be able to click on an "invisible" object that has only a Collider.
- NEW: (Build Mode) Avatar becomes ghost-like (translucent) as a visual indicator that you can now "go through" things.
- CHANGED: (Build Mode) String, Asset URL, and Reference input types have 100% width.
- FIXED: Walls, avatar hands don't collide.
- FIXED: (Build Mode) You can no longer select the avatar; also, you can't accidentally create inactive avatar bodies.

2021-02-12
- NEW: (Build Mode) Walls! Create straight walls, or curved walls, using the Wall component. Walls can have convexity (e.g. bending in or out) and a number of segments. Currently, walls do not have images or colliders.
- FIXED: (Build Mode) Outline is cleaned up after shape or wall is modified
- FIXED: (Build Mode) Prefab objects should now mostly be "on the ground" (yOffset is configurable per-prefab-type).
- FIXED: (Build Mode) When dragging numbers as sliders in the Editor panel, changes are reflected immediately in-scene.
- CODE NOTES: Fixed StatsPane warnings in console; Removed unused ActionButton and createDemo.

2021-02-11
- NEW: (Build Mode) There is now a "hamburger menu" on each component of the Editor. Opening it shows the Debug & Modified buttons (these are not used often).
- CHANGED: (Build Mode) Editor UI has been tidied up. Numbers keep their precision; panes are more compact; better justification of color picker and editable numbers; color picker hex value uses fixed-width font.
- CHANGED: (Build Mode) Removed "Thing" prefab from editor (it didn't do anything).
- FIXED: (Build Mode) Drag-to-move and editing the Transform component attributes wasn't working properly due to the physics engine overwriting changes to these values.
- FIXED: (Build Mode) Adding and removing components syncs with yjs doc and shows up in Editor panel.

2021-02-10
- FIXED: (Build Mode) Deleting any selected items would cause a JS error

2021-02-09
- UPDATED: IMPROVED PERFORMANCE! You should see a significant general speed-up, on the order of 4-5ms per frame in "complex" worlds such as /town. (For context: 60 frames-per-second is 16ms per frame).
- CODE NOTES: By reorganizing and combining the core and three plugins of the ECS system, we've reduced the number of transform calculations by about 3X. We rely on Three.js' values directly, rather than storing redundant data in Transform & WorldTransform components. (Every object in the world has both a Transform & a WorldTransform component).

2021-02-08
- CHANGED: (Build Mode) BetterImage component is now Image; BetterShape component is now Shape
- FIXED: (Build Mode) Collections panel would sometimes disappear
- FIXED: In some cases, deleting an object would fail due to undefined children (e.g. the avatar's "detached head" could get in this state)
- CODE NOTES: The ECS is now built-in (no longer a dependency)--this means we can experiment more, e.g. with optimizing the ECS. Added yarn workspaces, readme.

2021-02-07
- NEW: Relm now shows a progress bar while loading.
- NEW: Local portals! Add a "Portal" component to anything with a collider, and that thing will become a portal. Currently "Local" mode is supported; "Remote" portals are probably buggy.
- NEW: (Build Mode) Clicking on an item in a collection will now add it to the relm (same as drag-drop)
- CHANGED: (Build Mode) Components in Editor are now sorted alphabetically (except "Transform" which stays at the top).
- FIXED: When an error occurs while loading a relm, an error message will be shown.
- FIXED: ImpactSystem was unnecessarily slowing things down (should see slight improvement in speed for relms with many objects)
- CODE NOTES: Removed some unused code (TransferControlSystem). LibraryPanel renamed to CollectionsPanel. Other refactorings.

2021-02-06
- NEW: Upload 3D objects! GLB files are supported.
- CHANGED: Label font is now bold.
- UPDATED: Rapier3d Physics Engine updated to 0.3.0 (from 0.2.13)
- UPDATED: Several dependencies also updated (e.g. Uppy file uploader, Yjs)
- FIXED: HTML in editable labels is sanitized (prevents malicious code injection)
- FIXED: Prefabs are now placed at whatever height the character is at.

2021-02-05
- NEW: (Play Mode) Labels can be edited if their "editable" property is set to true
- CHANGED: (Play Mode) Grass color & lighting improvements

2021-02-04
- NEW: (Build Mode) Added a "Trees" collection
- FIXED (Windows): (Build Mode) Collections show two columns side-by-side (scroll bar is now hidden)

2021-02-02
- NEW: (Build Mode) Added "Signs" collection to built-in library of assets
- NEW: Added Labels, a way to add HTML-based text inside a rectangle.
- NEW: (Build Mode) There is now a "Stone" collection in the "Collections" tab. Drag into the game to add.
- CHANGED: (Play Mode) Character controls are a bit more natural (diagonals in particular).
- FIXED: (Build Mode) Collections with more than a few items scroll properly

2021-01-31
- NEW: (Build Mode) Hold down "Shift" key when dragging objects to switch to XY plane (default is XZ plane)
- NEW: (Build Mode) Drag-to-move selected items shows a grid so you can see which plane it's being dragged on.
- FIXED: (Build Mode) Drag-to-move selected items no longer "jumps" in some cases.
- FIXED: (Build Mode) Editor shows selected item, even without clicking ground first.
- FIXED: (Build Mode) When copy/pasting objects, the objects retain their distance to the ground.

2021-01-30
- NEW: (Build Mode) You can drag selected objects and move them around on the XZ plane! (Should work with multiple objects)
- NEW: (Build Mode) When importing objects into a relm, they become selected after import.

2021-01-29
- NEW: (Build Mode) Delete/Backspace key will delete selected objects
- NEW: There is now an import/export panel that can be used to get the raw JSON encoding the state of a given relm
- FIXED: Using scroll wheel inside the side panel would also zoom in/out of the game.
- FIXED: Shadows are now cast on image objects. Note that we had to use a slightly more pixelated-looking shadow algorithm to accomplish this, but it looks decent.
- FIXED: Keypresses inside text inputs should behave more consistently.
- FIXED: When entering 'play' mode, all objects are deselected

2021-01-26
- NEW: Images that have been uploaded to Collections can now be dragged into the relm (Note: collections still "forget" what you uploaded after refreshing the page).

2021-01-24
- NEW: Upload images works! You can upload in image directly into a relm by pressing the "upload to cloud" button

2021-01-17
- NEW: "My Favorites" section of Collections tab--you can upload images to your favorites (coming soon: relm will remember what you've uploaded when you refresh)

2020-12-29
- NEW: The server now accepts asset uploads.
- NEW: The server is permissioned (i.e. previously anyone could create new relms, update them; now, however, only people with admin permission can create new relms, and private relms will prevent just anyone from entering).
- NEW: There is now an "Upload" button in the UI. Currently, this only uploads assets, it does NOT make them show up as objects in the world. Accepts jpg, png, webp, gltf, glb.
- NEW: The "Upload" dialog box allows you to crop/flip images (after selecting a file, click the "Edit file" pen icon, then click the "Edit file" button in upper-right corner).
- CHANGED: Faces default to white, rather than Chris.
- CHANGED: Default zoom level is set to 25% of zoom out.
- FIXED: Accept files with capitalized extensions (e.g. .JPG is valid)
- FIXED: CSS3D rendering issue on Firefox (incorrectly offset youtube, faces, etc.)
- FIXED: When granting admin permissions via /mkadmin API, the admin will have all permissions instead of just "create new relm" permission.

2020-12-17
- NEW: Mouse or trackpad scrolling now zooms in/out
- CHANGED: Lighting and shadows are a bit more optimized--only one shadow map, and the shadow map tries to grow/shrink based on camera distance

2020-12-14
- CHANGED: Camera angle mimics relm v4 angle

2020-12-02
- FIXED: Some properties (such as position) can now be undone/redone. NOTE: There are still some remaining issues with undo/redo.

2020-12-01
- NEW: Undo/redo in Build mode. Ctrl-Z/Ctrl-Y on Windows, Cmd-Z/Cmd-Shift-Z on Mac OS. NOTE: Not all properties are currently working (for example, position seems to not be able to be undone at this time).
- NEW: "Tab" key switches between Build mode and Play mode.
- NEW: Double-click the "pause/unpause" button to enter "never automatically pause" mode. (Useful for debugging; normally, the virtual world pauses automatically when it is not the focused window).
- CHANGED: Participants must now click on a WebPage to give it mouse focus. This keeps mouse movement information inside the virtual world even when hovering over web pages. It also fixes a bug where some web pages were unable to load properly (e.g. Google Docs).
- FIXED: Deleting anything in a relm would open that relm up to a subtle bug in which new things would overwrite old things. New entities are now created using a random ID to prevent collisions.
- FIXED: Updated to rapier 0.2.11 which should fix missing/changed collider issues we've had.

2020-11-29
- NEW: Pauses game loop automatically when not focused (saves CPU).
- NEW: Show "Paused" message when game loop is paused.
- FIXED: When components' values are modified in the Entity Editor, changes can be seen by other participants (previously, only new/removed components were syncing properly).

2020-11-28
- NEW: Add any web page as a "screen". This includes shared docs like JoeDocs.
- NEW: Add new components to existing entities using drop-down menu in Entity Editor.
- CHANGED: "Deactivate" button is now "Delete", and deletes entities in Entity Editor.

2020-11-27
- NEW: URL can now specify the relm, e.g. https://staging.relm.us/demo
- NEW: Connection Pane in upper-right corner allows you to connect/disconnect AND change relms without reloading the HTML page.
- NEW: Added a Reset World button in Build Mode
- NEW: Asset URLs can be edited.
- NEW: When you edit coordinates (& other values in the Entity Editor), those values are now saved & synced to the server.
- CHANGED: Now connects automatically to Yjs server for syncing.
- CHANGED: Rotation properties in Entity Editor now use Euler (XYZ) instead of more confusing Quaternion (XYZW)
- CHANGED: Camera follows player on Y-axis as well as X-axis; gently lerps to final camera position.
- FIXED: Dragging number values could accidentally result in click-to-edit event when returned to center
- FIXED: Dragging number values could prevent cancel event, preventing resize back to normal.
- FIXED: Outline on selected entity would sometimes not be cleaned up in some cases.

2020-11-26
- NEW: YouTube videos can be selected in Build Mode
- NEW: String type values can be edited in the Entity Editor. This also means YouTube video Embed IDs can be edited, so you can change what's playing on a TV.
- NEW: Prefabs are dropped wherever the player is, rather than at world coords 0,0
- NEW: Touch control and mouse control. Touch/click the avatar and "drag" to move in a chosen
- NEW: Faces visible on avatar, click to cycle through.
- CHANGED: Newly created prefabs are no longer immediately selected.
- CHANGED: Improved Build-mode UI
    - Remove build mode for mobile screens
    - Left side panel has Tabs for editor, performance
    - Add "minimize" button to left side panel
    - Add EntityDetails pane with id, name
    - UI for entity to be activated/deactivated
    - UI for entity w/ physics to sleep/wake
    - Build/Play buttons are centered
- FIXED: Pointer events in side-panel were being ignored
direction. Works in Play Mode only.

2020-11-25
- NEW: Build Mode vs Play Mode
- NEW: Editor values are now click-to-edit.
- CHANGED: Moved panel buttons (performance, editor) to left-hand side.
- FIXED: Outline didn't change shape when entity's shape changed.
- FIXED: Text is no longer unintentionally selected while dragging editor values.
- FIXED: You can now change a collider's shape and it will behave correctly
- FIXED: Entities would lose their collider when unselecting, and fall through the ground.
- FIXED: Hands started off away from the body and snapped into place. They now start in the correct location next to the torso.

2020-11-24
- NEW: "Connect/Disconnect" button in upper-right corner connects to sync server
- NEW: Syncing between clients when "Connected"
- NEW: "Create Entity" button at top of Editor will create a red box that can be modified in the editor
- NEW: Collider in "Near" and "Far" planes prevent player from falling off edge of the world
- CHANGED: Empty world by default

2020-11-20
- CHANGED: Avatar's head is hollow, face is now "inset" slightly.
- CHANGED: Slight adjustments to avatar controls, collider.

2020-11-19
- NEW: Head mesh!
- NEW: Two new platforms
- NEW: Furnishings
- NEW: Mountains and Sun in the background
- NEW: Ramp added to platform to make it easier to return to start
- CHANGED: Lighting, shadows based on Rey's recommendations
- CHANGED: Jump/thrust has a maximum velocity.
- CHANGED: Sun is brighter; orange box is metalic.
- CHANGED: Ramp/slide is divided in two parts.
- CHANGED: Avatar's collider is now a "capsule" shape instead of "box" shape. This makes it easier to move on stairs, ramps, etc.
- CHANGED: Avatar always stays upright.
- FIXED: Jump/thrust no longer spins defectively.
- FIXED: Head doesn't swivel around when avatar is moving.
- FIXED: Mesh sizes were inconsistently normalized.

2020-11-17
- NEW: The mouse position controls the direction the avatar's head is facing.
- NEW: The editor now has on/off switches for boolean fields.
- NEW: The PointerPlane component's visibility can be switched on & off.
- NEW: Hands now have linear damping (a little less flailing); avatar has linear damping also.
- NEW: Avatar faces direction of motion before moving.
- NEW: Avatar gets up when knocked down.
- NEW: Avatar has maximum velocity.
- NEW: Rudimentary support for Q+E keys + mouse control of hands
- CHANGED: The physics engine has been updated to rapier3d version 0.2.8
- FIXED: Clicking on the player's avatar mesh no longer fills entire screen with white selected mesh.
- FIXED: Camera no longer bobs up and down

2020-11-15
- NEW: Avatar has a head! (default profile pic only)
- NEW: Avatar has hands
- NEW: YouTube video is inside a TV :)
- NEW: Clicking the avatar's head toggles between circle & "default profile" pic (for testing aesthetic)
- CHANGED: Avatar is floating slightly
- FIXED: CSS3D bug that made youtube videos and avatar's head invisible has been fixed!
- FIXED: Avatar's head was transparent when in front of other CSS3D like video.
- FIXED: Keyboard focus in game was lost when user clicked YouTube video with mouse (arrow keys would scrub video position rather than move avatar)
- FIXED: Demo wall shadows showed pixelated aliasing due to thinness of walls.

2020-11-14
- NEW: @Brendan O'Rourke 's new avatar mesh is the controllable avatar
- NEW: Shadow map follows avatar.
- NEW: There's a large field of "green grass" below the floating platform.
- NEW: Added a "step" button that steps through individual render frames. (Slow motion).
(Note: you can use space bar for "thruster" boost)
- NEW: AssetType in editor shows asset URLs (e.g. GLBs)
- NEW: Component panes in editor can be minimized
- NEW: Editor has color picker (e.g. to change color of cubes, ball)
- NEW: Editor has a selection picker (e.g. to change shape type, collider shape, etc.)
- NEW: There is now a "Debug" button in each component pane that will send debug info to the Javascript console. It also adds a "component" variable to the global scope for debugging.
- CHANGED: Performance panel has charts minimized by default (except FPS)
- CHANGED: Camera follows blue box, pans instead of rotates; camera is farther away.
- FIXED: CSS objects (e.g. youtube video) now casts shadow.

2020-11-13
- NEW: You can drag numeric values in the editor to change them. For example: click the "X" coordinate of the ComposableTransform component and drag it to make an entity move on the X axis.

2020-11-12
- NEW: Editor panel now shows components and internal data/types for each component. Read-only.
lol Chris, you have a dry sense of humor
- NEW: You can group and ungroup things with the Group/Ungroup button.
- NEW: When selecting a grouped entity, the whole group will be selected.
- NEW: You can shift+click to add to the selection.
- NEW: Clicking on blanks pace removes selection.

2020-11-11
- NEW: You can click to select things, and shift+click to multi-select
- NEW: Editor panel via "Editor" button. Currently shows what is hovered / selected.
- NEW: There's now a round ball to push around
- NEW: The "Action" button adds a pile of boxes
- NEW: Hovering mouse over a box (or chair) adds an outline and shake animation
- NEW: WASD keys work like arrow keys

2020-11-10
- NEW: Performance statistics panel on the left
- NEW: "Perf" button toggles performance panel
- IMPROVED: Speed improvements (3x faster in demo scene)
- CHANGED: Outline is heavier/easier to see

2020-11-09
- NEW: Outline effect (around blue box)
- NEW: Camera following (follows chair)
- NEW: Added some gray boxes for fun.
- NEW: Oscillating actions can end after a certain number of cycles. ("Action" button to test)
- NEW: "Jump" using spacebar (acts more like a thruster)
- CHANGED: Wider floor

2020-11-07
- NEW: Loading status of youtube video is shown (we can diagnose some issues this way)
- NEW: Svelte is wired in to CSS3DRenderer so we can create dynamic HTML inside the 3D world
- CHANGED: Demo video is now in front of chair

2020-11-06
- NEW: Youtube video and chair interact with physics world
- FIXED: CSS3D is no longer "behind" by 1 frame

2020-11-04
- NEW: Mixed HTML/WebGL mode. We can embed html, iframes, etc. in Relm's 3D world. Demo shows a youtube video.
- FIXED: Sometimes the box would lose the ability to be controlled.

2020-10-29
Demo is up: https://staging.relm.us/
There isn't much to look at, but it shows the progress I'm making with three.js and our new Entity-Component-System called HECS.

