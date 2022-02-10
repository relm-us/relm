2022-02-09
- NEW: When sitting / standing, the video oculus eases to a correct height above the avatar.
- NEW (Build Mode): Model assets and other assets (eg. shape textures) can be uploaded directly.
- FIXED (Build Mode): Model assets can be changed
- FIXED (Build Mode): A few minor styling issues

2022-02-08
- NEW (Server API): Added a new API endpoint at `GET /relm/[relm]/variables` to retrieve all scripting variables (must have edit / build mode permission).
- FIXED: Clickable / TOGGLE was not working. Clarified in build mode that it is now only for toggling Html2d visibility.
- IMPROVED: Various styling of Add / Modified / Settings panels.

2022-02-07
- NEW (Build Mode): "Actions" tab for scripting actions. It's pretty barebones right now, but eventually we'll get a better UI on it.
- NEW (Build Mode): Clickable component can make Changes to variables. For instance, if a variable named "door" can have values "open" or "closed", Clickable can set these states.
- NEW: Remote portal shows sparkles when used.
- FIXED (Build Mode): Modify panel was preventing numbers from being entered as values.
- CHANGED (Build Mode): Add panel title is now "Add" instead of "Library"
- CHANGED (Build Mode): Add panel has prefab items listed at the bottom (e.g. Youtube TV, Box, Ball, etc.) Moved from "Modify" panel.
- CHANGED (Build Mode): Modify panel is cleaner; top no longer shows useless name; "Sleep" button has been removed. "Delete" button has been moved to bottom.

2022-02-06
- NEW (Build Mode): Clickable component has a "Cycle" type which can do advanced actions when a participant clicks the object, such as moving it around, changing the image/glb, or modifying other components. Currently requires advanced JSON knowledge.
- NEW (Build Mode): Clickable component option to open in current tab or another tab.
- CHANGED (Build Mode): Html2d component now defaults to the "Info" type since we are using Label less and less.
- CHANGED: Speech bubble "close" icon looks nicer.

2022-02-05
- NEW (Build Mode): The "Add" panel now shows a preview of the selected asset with name, description, & tags. Clicking the "Add [name]" button adds the asset to the relm.
- FIXED: An issue with WASM and browser caching. We should no longer see "physics engine unable to load" error messages.

2022-02-04
- NEW (Build Mode): Asset library! Admins can now add assets to the library via API calls, and creators can use the assets with one click to add to a relm.
- CHANGED: The build mode tabs have changed:
  "Collections" -> "Add"
  "Editor" -> "Modify"
  "Export" has moved to a sub-section in the Settings panel
  "Performance" has also moved to the Settings panel
- CHANGED (Build Mode): Upload button is now in Add Panel
- CHANGED (Build Mode): "Group" and "Ungroup" button now shows up only when 1 or more objects is selected
- CHANGED (Build Mode): "Entity Editor" has been renamed to "Modify"
- REMOVED (Build Mode): Reset Physics button has been removed

2022-02-03
- NEW: Sitting-on-ground animation happens when you press number key 2
- NEW: Raising-hand animation happens when you press number key 3
- FIXED: Remote portals! (I think they really work this time)
- FIXED: Video conference room is joined only if 2+ participants present (saves $$)
- FIXED: Vertical scroll in Settings panel when there are more settings than fit in the window
- CHANGED: Close speech bubble button is visible by default.
- CHANGED: Waving animation happens when you press number key 1
- Release version 3.1.0 to production

2022-02-02
- NEW (API): You can export a relm via the API '/relm/[relmname]/content`.

2022-02-01
- NEW: Shadow maps enabled by default, with better dynamic coverage as you zoom 
UPDATE: Disabled shadows again. Not quite good enough yet.

2022-01-31
- NEW: Re-center camera button. Appears when your camera is off-center by about 4 units.
- NEW: Sparkle effect on enter/exit local portal
- NEW: Brighter world with HemisphereLight
- NEW (Build Mode): Click on the mini-map to teleport anywhere there is ground.
- NEW (Build Mode): Settings panel now includes ambient, hemisphere, and directional light color options.
- NEW (Build Mode): Lighting Settings pane now includes Directional Light position. It must be entered as "x, y, z", e.g. "-5, 5, 2"
- NEW (Build Mode): Lighting Settings pane has a "Reset Lighting" button 
- FIXED (Build Mode): Non-interactive colliders ("collide-in-build-mode only" colliders) can now be selected while Shift key is held.
- FIXED: Chat history properly scrolls to bottom so you can see the newest message
- FIXED: Mouse Up event over text when controlling your avatar via mouse/touchpad no longer gets you stuck in "Avatar control mode" 
- FIXED: participants teleport (not lerp) when entering local portal
- FIXED: no more camera lurch/zoom on local portal entry
- CHANGED: TV prefab default to "tipped up" for viewability
- CHANGED: Camera starts zoomed out (overview) and zooms in gently.
- DEBUG: Added 'THREE' global to access three.js constructors etc.

2022-01-30
- NEW (Build Mode): Relm now uses the system clipboard for copy/paste. This means you can copy/paste between browsers or tabs.
- NEW: "Continue" button in video-mirror screen now has focus so you can easily press "enter" to start
- NEW (Debugging): Added a 'noportal' debug option to make it possible to enter relms where portals are at the entryway
- FIXED: Issue with 'auto pause' in JS console; you may need to choose your auto pause preference again
- FIXED: When setting avatar name, it could include HTML spans and other tags
- FIXED: When opening chat pane, it now shows the most recent chat message at bottom of scroll list
- FIXED: When closing a speech bubble, the chat pane also closes 
- FIXED: Multiple tabs with different relms can be open
- FIXED: Remote portals are working again
- FIXED: Sticky arrow keys when exiting a portal (key states are now released)
- FIXED: Portal contact is now predictable rather than intermittent. (We thought the reason we sometimes couldn't enter a portal was because we needed to "run at" the portal, but this was not the case: it was randomly choosing to do it every once in a while. This is fixed.)
- FIXED: Copy/paste inside text input fields within build mode now behave as normal 
- FIXED: Neck movements are more natural; only follows active mouse movement
- FIXED: Local portals don't freeze motion
- Deployed everything above to production

2022-01-29
- NEW: Hover tooltips for main icons at bottom of screen.
- NEW: Debug pane shows x, y, z coords.
- CHANGED: Icon order is different. Icons are separated into 2 groups: video conferencing, other.
- FIXED: Sometimes loading stats were not properly re-computed on worlds, making loading take forever.
- FIXED: JWT permissions are now respected when set.
- FIXED: You can no longer go "full screen" on yourself 🙂
- FIXED: Context menu (right-click) no longer works in 3D world zones. (still works on text/html areas)
- FIXED: Permission issue preventing users with all-relms permits from entering build mode
- FIXED: Assets that failed to load due to an error were not counted in the loading screen, which sometimes resulted in 'forever loading'. 
- FIXED: Proximity audio works again when enabled via the "radio" button

2022-01-28
- NEW: Screen sharing (shows up inside oculus--in future, it will be shared in front of avatar)
- NEW: Click oculus when screen sharing to see full screen
- FIXED: Autopause wasn't actually pausing the world
- FIXED: Avatar name was being overwritten by undefined
- FIXED: Some redundant data signifying which participant isLocal. May be part of inconsistent participant location issue.
- FIXED: two tabs open at the same time causes animation and position mismatch issues. Only one tab open allowed (for now).
- FIXED: Avatar Builder pane was not working

2022-01-27
- FIXED: Avatars don't launch far away when spawning on top of each other
- FIXED: Speech bubble close icon is more visible
- FIXED: Oculus state is more reliable between reloads & between video-mirror config screens
- REMOVED: Speech bubble icons unrelated to speech

2022-01-24
- NEW: A notification when another participant joins the relm you're in
- FIXED: A bug that caused model/image uploads to throw an error
- FIXED: Non-default entryway URLs (e.g. /town/myhouse) work again
- tagged above fixes & improvements to release to prod

2022-01-23
- FIXED: Chat icon no longer resets "missed chat" indicator number every time  you load. 
- FIXED: For new participants, only ask them to choose an avatar once, assume the same on revisit.
- FIXED: Loading screen reliability issue.
- IMPROVED: Loading time is faster due to combining permits & metadata API calls into one.
- NOTE: Deploy directory has changed from public to dist in order to work with WebPack standard. This doesn't affect anyone except those re-distributing relm.

2022-01-22
- FIXED (Build Mode): Prefab items are now created "on the ground" wherever the avatar is located. Items no longer start halfway inside the ground 
- UPDATED: Rapier3D physics engine to 0.7.6.

2022-01-21
- NEW: Debug Mode (Ctrl+D) shows the connection status & world state info (more to come). This used to be accessible only when 'paused'.
- FIXED: Minimap size & positions were not updated in some cases.
- FIXED (Build Mode): Flying is working again.
- FIXED (Build Mode): Prefabs are working again (e.g. buttons to create ground etc.)
- FIXED: Connection status is accurately reflected in pause/debug mode.
- FIXED: Chat function has been restored
- FIXED: When sliding fog all the way to zero, it treated it as if no fog setting had been set
- CHANGED: "Upload" button has been set to build-only mode for now

2022-01-19
- NEW: JWT test page at /jwt-signin.html can be used to test the JWT integration (note: requires server to have JWTSECRET env variable set to match the test page).
- FIXED: JWT logins now support permissions, e.g. access, edit, invite, admin; depending on permissions, participant will experience different UI (e.g. build mode)
- FIXED (Build Mode): Objects could not be moved/rotated.
- FIXED: Presence bug!
- IMPROVED: Audio/video setup page results in more consistent outcomes when revisited to change preferences.
- IMPROVED: Server errors and client error messages.
- NOTES: Another big refactor, this time in the authentication/authorization/identity area of the code. Shouldn't affect anything, but there may be regressions.

2022-01-02
- NEW: Remote portals! Now you can set a Portal component to "Remote" with relm name and entryway, and participants can hop from one world to another without reloading the page.
- NEW: Pressing ESC when the game is paused will unpause it.
- NEW: Mini map! Shows where you are (yellow dot) and where others are relative to you. Click to disable (turns into a map button).
- NOTE: Added some debug info to try to track down the presence bug.
- FIXED (probably!): Sometimes participants could not see each other even though they were in the same relm.
- FIXED: Upload button has been restored for participants with edit permission.
- IMPROVED (Build Mode): Updated the file uploader to latest code (Uppy 2.x, 25% reduced size) and simplified the uploading flow. Upload now starts automatically once you've chosen a file, but you still get a chance to see the file upload response at the end. 

2022-01-01
- NEW: Relms can now be cloned! (admin only). The /relm/[relmName]/create API takes a seedRelmId or seedRelmName parameter that is used as the clone source.
- NEW: Newly created relms (that are not cloned) start from a basic template with grass and skybox, rather than an empty world with an invisible initial collider.
- CHANGED: No more invisible initial collider!
- CHANGED: Buttons are all at bottom center of screen (for now).
- CHANGED: Removed "gear icon". Video icon now goes to video setup screen.
- FIXED: Pause message was missing when game paused; it's back now.
- FIXED: After switching tabs or focusing on an iframe, sometimes the zoom / scroll wheel would behave strangely by accidentally allowing more of a 3D perspective. This is fixed.
- FIXED: When audio & video are not used, the camera and mic are turned off.
- FIXED: First-time visitors would see an error due to assuming a localStorage variable exists (preferredDeviceIds).

2021-12-31
- NEW (Build Mode): Settings -> Skybox now has 4 presets
- NEW (Build Mode): The Settings panel now has a "Set Default to Here" button to set the default entryway to your avatar's location.
- NEW (Build Mode): Your avatar's name is hidden in build mode so it doesn't get in the way of clicking/dragging.
- NEW: If a relm is slow to load, click 5 times on the loading image to skip.
- FIXED (Build Mode): Skybox preset images in chrome should look correct
- FIXED: When loading a relm that doesn't exist, the error message now indicates the problem
- FIXED: Loading screen is back! It's more reliable, too--in addition to models, it now counts objects such as skybox, textured shapes, and images. NOTE: If you are the first to load a relm since this change, the progress bar may not complete. Just refresh the page.
- FIXED: When a relm was configured to have the participant start at an entryway, the avatar sometimes did not heed the location and would start at origin instead (i.e. the 0,0,0 location).
- IMPROVED: Render speed should be faster due to a physics engine tweak.
- REMOVED (Build Mode): The "Migrate to CDN" button has been removed from the Settings panel.
- CHANGED: All relms are now required to have a default entryway configured! If not set, there will be a warning message.

2021-12-30
- FIXED: In public relms where a participant had permission above "access" level, the participant was still unable to use that permission (e.g. build mode)
- FIXED: When participant does not have "edit" permission, pressing "TAB" would still show some aspects of build mode (e.g. colliders)
- FIXED: Several issues around video / audio setup including:
  - cam/mic choices are stored and used to re-populate the dropdown
  - relm mute buttons (mic/cam) and mic/cam buttons in video / audio setup screen is are better synchronized
  - going back and forth between setup screen and relm world is more reliable
  - experimenting with choices in video / audio setup screen does not immediately affect what other people see / hear, until you click "Continue"
  - some cosmetic changes, e.g. a "checkmark" next to the currently selected device, dropdown boxes look better, there are some sliding and fading animations for settings

2021-12-28
- FIXED: Invitations were not working
- IMPROVED: Initial screen and error screen (if shown) include Relm logo and match color of video-mirror page

2021-12-23
- NOTE: Server backend had a big refactor; I don't expect anything to break, but keep an eye out for things like permissions not working or uploads failing.
- FIXED: Permissions issue on server side that prevented people from visiting private relms when more than 1 person had private access.

2021-12-22
- FIXED: Face Map Colors component was not working on some GLTFs whose facemap data was contained in a Group node.

2021-12-21
- NEW: There is a new Html2D type called "Info" that allows you to attach information including a link & expandable content to any object
- NEW: (Build Mode) There is now a "Clickable" component. When attached to an object, it can be configured to do one of the following when the object is clicked:
  (a) Open a URL in another tab
  (b) Toggle a property on one or more objects, such as the new visible property of the Html2d component.
- NEW: Html2d Info box can be set to editable: false.
- NEW: Html2d Info box can have an image in its content section. Just prefix an image URL with "image:" e.g. "image: https://website.com/image.png"
- NEW: (Build Mode) Diamond component now has a color picker.
- NEW: (Build Mode) Diamond component now has an Offset property. This allows you to add a Diamond to existing objects and move it away from the center of the object.
- NEW: When editing fields in the Info box, text is automatically saved (previously, it was saved only when ESC was pressed, or the down arrow icon was clicked)
- CHANGED: When toggling visibility of an Info box (e.g. via Clickable), everyone will see the Info box appear or disappear. State is also saved for when you visit next time.
- FIXED: Speech bubbles' visibility setting is now respected (e.g. when toggled with Clickable)
- FIXED: (Build Mode) Diamond prefab was showing up under the ground.
- FIXED: A couple of minor problems with the Info overlay, such as growing too big with very long text.

2021-12-19
- NEW: Twilio video integration! Yikes.
- NEW: Assets are now uploaded to a Content Delivery Network (CDN) making load time faster. The CDN asset server is now shared between staging and prod, so it's now possible to export a relm from staging and import to prod (or vice versa).
- NEW: There is a "Migrate to CDN" button in the Settings pane of the Build panel. Clicking this button will migrate all assets in the current world to the CDN server (Note: it does NOT upload to the server; however, I've manually copied all of our assets to the CDN as of yesterday, so it should be fine).
- FIXED: Image assets were not uploading to CDN correctly
- FIXED: Assets that were not found or were otherwise broken now report the URL and error code in JS console
- FIXED: Assets in CDN should now be shareable across staging/prod (We were seeing some cross origin request caching issues).

2021-09-01
- CHANGED: [Build Mode] Objects more accurately follow the mouse/pointer when dragging and dropping. Previously, the object sometimes drifted away from the pointer after some distance.
- FIXED: [Build Mode] Interactive HTML no longer interferes with drag-drop pointer movements. For example, if the side-panel or chat panels are open, or if you drag over top of a label or a button, these no longer block/pause the drag sequence. 
- FIXED: In-world video state now corresponds to state set during welcome screen (video-mirror).

2021-08-31
- FIXED: [Build Mode] Bottom 50 pixels of screen no longer prevent drag/drop from dropping objects when mouse release happens there.
- FIXED: [Build Mode] Shapes show textures when added, and changing the texture shows a result.

2021-08-30
- NEW: Diamonds are used when creating text "labels" from speech bubbles
- NEW: Diamonds have optional text "above" the diamond that can be edited. A note icon is shown when the text above is blank.
- NEW: [Build Mode]: Volumetric selection--a box now shows what you are selecting when selecting multiple objects. Use "Shift" key to increase height of box.
- NEW: [Build Mode] When copying and pasting a group of objects, the new group remains a group. (Note: groups are not yet saved between browser reloads)
- CHANGED: Pause screen now has a slate gray background (easier to read).

2021-07-28
- FIXED: Mute button shows correct state
- NEW: The paused-mode "Status" pane now shows 3 pieces of information regarding audio & video state: "desired" means the participant has indicated they want audio/video, "recording" means the mic/webcam is on, and "sending" indicates the data stream is being produced and sent to mediasoup.

2021-07-15
- NEW: Automatically pause when focus is not in window to save battery/CPU
- NEW: Press 'P' key to pause or unpause
- NEW: When in javascript console, you can use relm.start() to unpause programatically.

2021-07-12
- NEW: Clicking on a WebPage causes the camera to zoom in on it, and taking focus away will zoom back out.
- IMPROVED: Camera panning and zooming is smoother and more consistent. The zoom in/out centers on the current center (wherever you've panned to). There is currently no restriction on how far you can pan (this will probably be changed).
- CODE NOTES: All camera actions are now managed by CameraManager.

2021-07-11
- NEW: WebPage renderables have an "Always On" toggle which will keep them showing the content rather than switching off when unused. NOTE: This makes everyone's browser slower, so use with prudence.

2021-07-10
- IMPROVED: (Build Mode) Billboards and Web Pages (and all other CssPlane Renderables) are now easier to set width and height. The width and height used to be a combination of rectangleSize, width, height, and scale. Now it is just size and scale.
- NEW: Billboards have a border. Color can be set in editor.
- NEW: Billboards show a resize icon at left and right. NOTE: resizing doesn't work yet.

2021-07-08
- FIXED: Build mode: Website object could not be selected
- FIXED: Play mode: Labels can be dragged around again (Note: this does not affect Billboards).

2021-07-06 (v1.5.1)
- CHANGED: Updated to latest humanoid character set (Thanks Rey!)
    - improves 'long' hairstyle
    - waving animation doesn't alter leg posture
    - makes various morph targets and animations available (unused):
      - head size morph target
      - jumping, raising-hand-pose, screen-sharing, sit-to-stand-chair,
        sit-to-stand-ground, sitting-chair-pose, sitting-ground-pose,
        stand-to-sit-chair, stand-to-sit-ground (animations)
- FIXED: Build mode: No longer starts "waving" animation when flying
- FIXED: Chat box should be completely off-screen when closed
- FIXED: Mouse no longer gets "captured" after clicking on a website / CSS3D box

2021-06-15
- CHANGED: Zoom is smoother, and centers better so that the video oculus and avatar are balanced.
- CHANGED: User Interface buttons are circular, and organized more closely to the way we're headed with the overall UI design.
- CHANGED: ColorPicker is simpler.

2021-06-13 (Release v1.5.0)
- NEW: Oculus diameter now corresponds to proximity volume--when you walk away from someone else, their oculus will grow smaller.
- CHANGED: Buttons in upper-left corner (Share Screen, Video Setup, Avatar Builder, Upload) have been moved to center-bottom of the page.
- CHANGED: Audio mute button is now at bottom of screen, along with other buttons.

2021-06-12
- NEW: Avatar Builder settings are now stored properly and reflect current avatar appearance
- CHANGED: Video Oculus is now ~15% smaller. This makes the video diameter better correspond to the shoulder diameter of the avatar, so that people can approach each other more intimately.
- CHANGED: Video Oculus is centered when growing/shrinking, rather than pinned to bottom (near avatar's head)
- CHANGED: Proximity Audio's range is now slightly larger (6 world units instead of 5).
- FIXED: Regression where Avatar Builder was not showing on screen.
- CODE NOTES: We are no longer storing data in charColors and charMorphs; instead, we've unified the traits that affect the Avatar's look in a new "appearance" object.

2021-06-10
- NEW: Avatar builder has visually separated sections.
- NEW: Avatar Builder has shirt, pants, shoes, belt style and color pickers
- IMPROVED: Avatar Builder is full featured (NOTE: settings are still not saved)
- FIXED: Avatar builder is now on right-hand side & scrollable so mobile users can change avatars when in landscape mode.

2021-06-07
- FIXED: Participants on iOS devices can now see themselves

2021-06-04
- FIXED: Fullscreen mode for iOS (shows video in entire window, since fullscreen is not actually available)
- CODE NOTES: Updated to ThreeJS 0.129.0. This fixes a console error in iOS, among other improvements.

2021-06-03
- NEW: Avatar Builder lets you customize your avatar. Note: clothing choices not yet available, but coming soon; also note that choices are not yet saved.
(for now, click smiley icon to open Avatar Builder)

2021-06-01
- NEW: A "Choose Your Avatar" screen after the Media Setup screen. Options are simple for now: Male or female, with customization possibility mentioned.
- NEW: The Media Setup screen has a toggle that lets you skip the screen on subsequent visits. Note: still working out some kinks.
- CHANGED: "Request Permissions" button text changed to "Use Cam & Mic".
- CHANGED: Avatar randomizer button sends you to the Choose Your Avatar screen. Note: This will soon open an avatar customization panel instead.
- FIXED: When world fails to load, error message will show even if in Media Setup screen.
- FIXED: Error possible when getting transform before Avatar entity exists.

2021-05-28
- NEW: Screen sharing (Note: participant who shares screen can't see that they are sharing their own screen yet)
- FIXED: Race condition when disabling ability to edit avatar names (see 

2021-05-24
- NEW: More status information in "connection" panel (click down arrow to see more). If there is too much data to show (e.g. in the case of many participants showing) you can scroll to see more. Also, each participant's "last seen" timestamp is shown, along with their name, clientId, and playerId.
- FIXED: Media setup screen is shown when toggling video state from never having had video setup, to needing video setup.
- FIXED: When using the Media setup screen for 2nd+ time, your avatar is no longer placed back at the entryway of the world.
- FIXED: Several small issues that caused instability in the virtual world.

2021-05-20
- FIXED: Yet another attempt to fix the issue with presence. This one refactors some of the main code responsible for detecting when other participants are "active".

2021-05-12
- NEW: When out of audio range, video oculus becomes partially transparent & the mic goes away.
- FIXED: Audio falloff with distance.
- REMOVED: Build/Play mode buttons in center top. (Tab still works)

2021-05-09
- NEW: Avatars' head movements are now shared so that others can see what you're "looking at".

2021-05-07
- NEW: Avatar's head follows the mouse pointer. NOTE: Currently this is shown locally only (others can't see your head motion).

2021-05-06
- NEW: Repulsive force between participants. Makes it so you can't walk through each other; also improves "landings" when entering a subrelm--prevents participants from being exactly on top of each other.
- NEW: (Build Mode) Shape textures! This allows you to add a repeating image pattern to a shape--for example, the ground. Currently the UI is difficult--you must copy/paste an Asset URL from another object into the Shape component's 'Texture' field.

2021-05-05
- CHANGED: Hold down Spacebar to wave (temporary).
- FIXED: Foot slippage on walk/run animations. Avatar now more precisely faces the correct direction, making the animation more accurate.
- FIXED: Loading progress bar regression during last refactor.
- FIXED: Bounding box around player regression during last refactor.
- FIXED: Several javascript exceptions that could freeze the world.
- FIXED: "_mediasoupDevice" error is now a quieter warning

2021-05-03
- NEW: There is a "video/audio setup" button in the upper-left corner that allows you to go back to the video/audio setup screen once in the virtual world.
- CHANGED: When entering a relm with your own audio/video disabled, you can still hear/see others.
- CHANGED: Video setup screen doesn't show view of yourself when video is disabled.
- REMOVED: The pause/unpause and 'step' buttons have been removed.
- FIXED: Some conditions in which the world can stop working due to invalid entities.
- CODE NOTES: The VideoMirror now has i18n support. Pass a "tr" (translation) object in as an argument. Keys can be either short-form or full text, with the value as the text to use in your language of choice (e.g. French).
- CODE NOTES: avPermission is gone, and in its place we use audioRequested and videoRequested from video-mirror, as well as a new mediaSetupState. This simplifies the state we carry around regarding whether audio or video has been requested by the participant.

2021-04-27
- NEW: Emojis! You can type :heart:, :happy:, :sad: or :laughing: for now and the corresponding emoji will float up from your avatar.
- FIXED: Presence issues where some people can't see each other should be fixed now (attempt #3)

2021-04-26
- FIXED: Removed a race condition that may have solved the "participant disappears" issue (fingers crossed)
- FIXED: (Build Mode) Flying is back.

2021-04-25
- FIXED: Participant's avatar speed remains constant, even if render framerate changes. NOTE: This helps slower devices, but can't help in case device is "too slow" to handle 3D world at all.
- FIXED: Video setup screen can scroll, fits better on small/mobile screens.
- CHANGED: The origin of the touch control is now the center of the avatar (rather than the feet)

2021-04-24
- NEW: Touch controls! Mobile device users can now touch the avatar and drag to walk or run.
- NEW: Avatar can run! Use double-tap on keyboard, or when using touch controls, just drag farther away from the avatar.

2021-04-18
- NEW: (Build Mode) When clicking on ground, the ground cannot be selected unless Shift key is pressed.
- FIXED: If GLTF models have a null BufferGeometry attribute, it won't crash the world. Shows warning in Javascript console.
- CODE NOTES: The avatar's skinnedMesh now has a proper bounding box (created manually) so we can do regular frustum culling and detect mouse clicks on the avatar now.

2021-04-16
- NEW: BoundingHelper component allows you to see bounding box around an object.
- NEW: LineHelper component allows you to see a line from an object's origin to the world origin.
- NEW: (Build Mode) When "Shift" key is pressed, bounding boxes will be shown around all objects.
- NEW: (Build Mode) When the "Debug" button is pressed on a component, the component's entity will now be available in the javascript console (window.entity).
- FIXED: (Build Mode) The component names in the dropdown & in the panes now reflect the component's descriptive label (instead of its code class).

2021-04-13
- NEW: A surprise when you fly in build mode
- FIXED: dragging Html2d labels works again
- FIXED: gravity when falling in play mode
- FIXED: player not walking on ground in some cases

2021-04-11 (v1.0.0)
- NEW: (Play Mode) Holding spacebar waves the right hand back and forth.
- NEW: (Build Mode) Holding spacebar flies swiftly around.
- NEW: Choose a random avatar! Click the smiley-face button to choose a new you.
- NEW: Particle component & system. Uses Nebula (i.e. getnebula.app). Note that configuring particles through Nebula is not yet supported.
- FIXED: No more "air walking" when flying around.
- FIXED: Morph targets outside of [0, 1] are clamped.
- FIXED: Participant count in Stats panel is (probably) accurate.
- CHANGED: Status box (upper right-hand corner) shows more state: entryway, world status, media connect status, yjs connect status, yjs room, audio/video permissions, loading state counts, identities.
- FIXED: You can see other participant's animations (e.g. walking).
- FIXED: Oculus has a little more distance between circle & avatar's head.
- FIXED: Better presence detection (sometimes connecting would not show the other people).
- FIXED: Speech bubble shows up by avatar's head.
- FIXED: Avatar name was overwritten by chat messages.
- FIXED: Animations have a cross-fade, so stopping & starting walking is less jerky.
- CODE NOTES: A lot of refactoring going on in the background: the server is now written in Typescript; Updated Rapier Physics to 0.5.3 (might help with iOS). The server now needs to be compiled, and the file to run is in server/dist/src/server.js

2021-04-05
- NEW: Humanoid avatar! NOTE: your avatar's clothes, hair, & gender cannot yet be customized.
- CODE NOTES: Several things have been refactored into ECS plugins. We now have a TranslucentPlugin (replacing "ghost" toggle), an InteractionPlugin (replacing "InvisibleToMouse" component), and a ColliderVisibleSystem (replacing the hacky way we were making colliders visible in Build Mode).

2021-04-02
- NEW: (Build Mode) The "Animation" component allows you to animate 3D models. The name of the animation clip that you enter must match the exported name (e.g. in Blender)
- NEW: (Build Mode) The "Coloration" component allows you to choose colors for named face maps. As above, the face map names must match what was exported (e.g. in Blender). The format for specifying what colors to use is {"name":["#color", weight]} where "name" is the face map name, "#color" is a hex color such as "#ffffff" and "weight" is a number from 0 to 1, e.g. 0.9.
- NEW: (Build Mode) The "Morph" component allows you to modify a mesh based on a morph target built in to a 3D model. The morph target names must match what was exported (e.g. in Blender). The format for specifying what morph targets to use is {"name": weight} where "name" is the name of the morph target, and "weight" is a number from 0 to 1 (the influence).
- FIXED: Loading screen should be timed correctly now, and participants should always enter at the entryway location

2021-04-01
- NEW: Oculus has a "shine" to it, simulating a transparent glass ball
- CHANGED: Brightness/saturation has been adjusted
- FIXED: Better loading progress bar, due to improved estimation of number of assets to load
- FIXED: Sometimes the loading screen would incorrectly end before the world had loaded. NOTE: This MAY happen one more time, per world, as the server collects stats on how big each world is.
- FIXED: Server shouldn't crash due to memory leak any more.

2021-03-30
- NEW: Video can be turned off during video setup & it will carry forward into the world.
- NEW: You can toggle video on/off by clicking the Oculus above the avatar's head.

2021-03-28
- CHANGED: Oculus perimeter is now gray for all players (to maintain stylistic consistency).
- FIXED: Oculus video feed is now on top of other HTML such as 2d labels.
- FIXED: HTML page title was incorrectly used in production environment.
- FIXED: When you close your own speech bubble, it closes for others also.
- CODE NOTES: Several nginx configuration, deploy, and run scripts have been updated. We use these in our environment, and they can be used as a reference to show how a similar production environment can be set up.

2021-03-27
- NEW: Click & drag the ground in Play mode to pan the camera on XZ axis.

2021-03-26
- NEW: There is a microphone at the bottom of the avatar's video oculus. The mic shows audio volume in the background.
- NEW: You can mute/unmute yourself by clicking the microphone.
- NEW: You can mute/unmute others by clicking their microphones.
- CHANGED: Video Setup screen shows gentle fade-in effect.
- CHANGED: The avatar's oculus is now colored the same as the avatar's underline color.
- CHANGED: Shadows are turned off by default. This significantly boosts render speed on low-end hardware.
- FIXED: Oculus position is stabilized to integer values (no longer makes very tiny movements that cause jitter)
- FIXED: Video & audio quality has been significantly improved by using a better back-end server (DigitalOcean w/ 2 dedicated vCPUs).

2021-03-22
- NEW: The participants' names are sent to the Mediasoup server so video participants not in GatherEngine can see each others' names.
- FIXED: Video & audio is now separate for each world (a mediasoup room is created for each world).

2021-03-21
- NEW: Shared Video & Audio! Participants entering a world will see & hear each other via our dedicated mediasoup server. NOTE: Currently there is only one media room shared across all worlds, so this will cause some strange effects if more than one world is being used at a given time.

2021-03-15
- NEW: Video setup screen! You can set up your camera and microphone before entering GatherEngine.
- NEW: Local Oculus (video circle) above your avatar. NOTE: video/audio is not yet connected to anyone else and you won't see an Oculus above other participants.
- FIXED: Your avatar's name (and underline color) should be preserved across worlds now.
- CODE NOTES: The IdentityManager went through some refactoring so that there is now a localstorageSharedFields store. This store both reads and writes to localstorage, and can be used to override the avatar name (e.g. in server-controlled username scenarios).

2021-03-07
- NEW: WebPage components automatically use a screenshot of the website in place of their iframe, significantly speeding up CSS3D rendering of the "web page". When the user clicks on the web page screenshot, it turns into an interactive website iframe.
- NEW: YouTube components show a preview image in place of their iframe, also significantly speeding up CSS3D rendering of the "video" placeholder. When the user clicks on the youtube video preview, it loads the youtube video in an interactive iframe.
- CODE NOTES: The screenshot service is now integrated into the backend server, and uses puppeteer and chromium under the hood. This may require some setup to get working correctly on your server. See README.md.

2021-03-05
- NEW: (Build Mode) Walls have a new "Visible" setting. This allows you to create wall-shaped colliders without a visible wall.
- CHANGED: Renderer is back to "High performance" mode by default (may affect speed on some hardware)

2021-03-04
- NEW: Named Entryways! A world can now have a "default" start position (entryway) other than (0,0,0) and can additionally have other entryways. An entryway's name is used as an optional 2nd component of the name of the world; for example the "fairy" entryway of the "town" world would look like this: staging.gatherengine.org/town/fairy.
  - In Build Mode: Add or remove entryways via the "Settings" panel. Create an entryway named "default" at your avatar's current position to make that the default entryway for the world.
  - In Play Mode: Your avatar will automatically show up at the default entryway when you load the world, or another entryway if your URL includes it.
- NEW: Escape key: (a) if anything is selected, it will first deselect the selection; (b) if chat window is open, it will close chat; (c) if in build mode, it will enter play mode.

2021-03-03
- NEW: (Build Mode) You can now use rectangle selections to select a whole "area" of the screen. Note: there is currently no visible rectangle drawn, so it's hard to tell that it's actually happening. Also note: the drag currently MUST start with nothing selected.
- CHANGED: Going through a local portal puts participant on the other side of the destination. In other words, depending on the participant's direction when entering the portal, they will be placed 1 unit away from the destination in that same direction.
- FIXED: No more jank when moving through a local portal.

2021-02-25
- NEW: Head movements are shown over the network
- CHANGED: Avatars no longer collide (In future, they will push away from each other, which will feel like colliding a bit). This fixes the issue where avatars would get launched randomly into the sky or ground when touching each other.
- REMOVED: "Pile of Boxes" button.
- CODE NOTES: The collider interaction group bits changed from 2 groups (object, ground) to 4 groups (object, ground, avatar, avatar in build mode). This required re-assigning collider interaction group bitmasks on all existing objects.

2021-02-24
- NEW: You can edit your avatar's name (click to edit)
- NEW: Labels can be edited when "Editable" flag is set.
- FIXED: Avatars should disappear when someone disconnects/leaves.
- FIXED: Editor still said "Label" in one place that should have said "Billboard"


2021-02-23
- NEW: (Play Mode) Labels can be dragged around. Notes:
  a) Drag the text itself (not the little sphere)
  b) Existing labels will need to have their "Draggable" property switched to "On". New labels will be draggable by default.
- NEW: Performance panel now has a "Shadow" toggle to locally configure whether shadows are cast.
- CHANGED: Speech bubbles close when chat box closes.
- FIXED: Label size on hover in combination with being zoomed out should be better.
- FIXED: Avatar was drifting.

2021-02-22
- NEW: Players have a color and a name (so far, you can't choose them)
- NEW: Speech bubbles work! Whenever you say something in the chat box, your most recent message will appear as a speech bubble above your avatar's head.
- NEW: Context-sensitive speech bubble buttons. Click the speech bubble to show buttons:
  1. Close Button: closes the speech bubble (local only)
  2. Label Button: materializes what you said as a zoom-invariant label.
  3. Easel Button: materializes what you said as an easel (billboard, for now). Text in easel is editable.
- CHANGED: Chat history shows names
- FIXED: Labels (esp. avatar names) are hidden when loading screen is shown.
- FIXED: web pages could no longer get mouse events
- CODE NOTES: Big "Identity" related refactor! We have much better access to combined properties, regardless of their source--for example, shared properties like name and color, as well as physics-engine-related properties such as transform (position, rotation) for players.

2021-02-19
- NEW: Chat! Lower-right hand corner has a chat icon & clicking on it opens a chat history where you can type messages to each other.
- NEW: The count of unread chat messages shows up as a number in red above the chat icon.
- NEW: (Build Mode) Labels have a "max width" setting
- NEW: Labels shrink when zoomed out so they don't overlap as much
- NEW: (Build Mode) There is now a "Settings" tab on the side panel
- NEW: (Build Mode) Inside the Settings tab, a Skybox image can be uploaded
- CHANGED: Worlds no longer have a very large default rectangular ground. Instead, there is a small collider that prevents the character from falling, and a "Ground" button in the editor prefabs that you can use to add ground (circle, square).
- CHANGED: Labels only show one line of text (also avoids an odd rendering bug that smudges parts of text onto world canvas).
- CHANGED: Width of labels relative to screen size and "Max. Width" parameter updated to reflect actual world size.
- CHANGED: Hovering over a label makes its width grow temporarily so it looks reasonable when zoomed out.
- CHANGED: Very long labels show ellipsis (...), and can be hovered to show all
- FIXED: Long labels wrap at max width.
- FIXED: Labels no longer prevent scroll wheel zoom.
- FIXED: Labels won't show bits and pieces of 3rd line of hidden text on long content.
- FIXED: Clicking text of a label in Build Mode should select the accompanying object.
- FIXED: Shadow map resizes to zoom level, covering entire visible area.

2021-02-17
- NEW: Basic MULTIPLAYER is finally here! Presence only (no physics).
- NEW: Fire has a "Color Mix" value that provides more control over color of the flame (e.g. setting to "1.0" will make it saturate the color).
- NEW: Asset type in editor now shows file size in KB or MB.
- FIXED: Shape cache lookup was wrong when cubes' Y or Z size changed.
- FIXED: Invalid wall sizes now warn instead of throwing an error.

2021-02-16
- NEW: Chat icon in the lower right opens to text box that currently allows you to create a Label. NOTE: In future, this will be an actual chat box; for now, it is a shortcut to creating labels, similar to previous version.
- NEW: Pressing "Enter" or "Return" is a shortcut key that opens the Chat box.

2021-02-15
- NEW: Zoom-invariant labels! Transparent text labels over top of the world. Click create "Label" in editor when nothing is selected.
- NEW: Cylinder shape and collider.
- NEW: Campfire! New volumetric Fire component has Color, Speed, Octaves, and Blaze parameters.
- CHANGED: What used to be called a Label is now a "Billboard" (non-transparent background text)
- CHANGED: Buttons don't repeat "create" e.g. "Create Box" any more
- FIXED: Dropdown boxes use labels when available

2021-02-14
- CHANGED: Brighter lighting.
- FIXED: (Build Mode) High-precision numbers are kept when using text entry. (e.g. Rotation & Scale values of Transform component).
- FIXED: (Build Mode) Can't enter non-numeric values where you shouldn't. Fixes issue that could make entire world crash.
- FIXED: (Build Mode) Long text in Asset type will now wrap, e.g. URLs.
- FIXED: (Build Mode) Capsule-shaped Colliders weren't showing their radius/height parameters in the Collider component.

2021-02-13
- NEW: Walls now have colliders!
- NEW: (Build Mode) Avatar does not collide with things when in build mode (except for the ground).
- NEW: (Build Mode) Colliders are visible! For example, even if the object has no Shape component, or if the Collider is a different kind or size than the Shape, you can see what where the collider is. Note: this makes it possible to remove a Shape component and still be able to click on an "invisible" object that has only a Collider.
- NEW: (Build Mode) Colliders now have a "Collide in Build Mode" toggle. Useful for floors or other things that need to keep the Avatar from falling through things in Build Mode.
- NEW: (Build Mode) Avatar becomes ghost-like (translucent) as a visual indicator that you can now "go through" things.
- CHANGED: Colliders scale with the size of the object as specified by the Transform component's scale x/y/z.
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
- NEW: GatherEngine now shows a progress bar while loading.
- NEW: Local portals! Add a "Portal" component to anything with a collider, and that thing will become a portal. Currently "Local" mode is supported; "Remote" portals are probably buggy.
- NEW: (Build Mode) Clicking on an item in a collection will now add it to the world (same as drag-drop)
- CHANGED: (Build Mode) Components in Editor are now sorted alphabetically (except "Transform" which stays at the top).
- FIXED: When an error occurs while loading a world, an error message will be shown.
- FIXED: ImpactSystem was unnecessarily slowing things down (should see slight improvement in speed for worlds with many objects)
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
- NEW: (Build Mode) When importing objects into a world, they become selected after import.

2021-01-29
- NEW: (Build Mode) Delete/Backspace key will delete selected objects
- NEW: There is now an import/export panel that can be used to get the raw JSON encoding the state of a given world
- FIXED: Using scroll wheel inside the side panel would also zoom in/out of the game.
- FIXED: Shadows are now cast on image objects. Note that we had to use a slightly more pixelated-looking shadow algorithm to accomplish this, but it looks decent.
- FIXED: Keypresses inside text inputs should behave more consistently.
- FIXED: When entering 'play' mode, all objects are deselected

2021-01-26
- NEW: Images that have been uploaded to Collections can now be dragged into the world (Note: collections still "forget" what you uploaded after refreshing the page).

2021-01-24
- NEW: Upload images works! You can upload in image directly into a world by pressing the "upload to cloud" button

2021-01-17
- NEW: "My Favorites" section of Collections tab--you can upload images to your favorites (coming soon: GatherEngine will remember what you've uploaded when you refresh)

2020-12-29
- NEW: The server now accepts asset uploads.
- NEW: The server is permissioned (i.e. previously anyone could create new worlds, update them; now, however, only people with admin permission can create new worlds, and private worlds will prevent just anyone from entering).
- NEW: There is now an "Upload" button in the UI. Currently, this only uploads assets, it does NOT make them show up as objects in the world. Accepts jpg, png, webp, gltf, glb.
- NEW: The "Upload" dialog box allows you to crop/flip images (after selecting a file, click the "Edit file" pen icon, then click the "Edit file" button in upper-right corner).
- CHANGED: Faces default to white, rather than Chris.
- CHANGED: Default zoom level is set to 25% of zoom out.
- FIXED: Accept files with capitalized extensions (e.g. .JPG is valid)
- FIXED: CSS3D rendering issue on Firefox (incorrectly offset youtube, faces, etc.)
- FIXED: When granting admin permissions via /mkadmin API, the admin will have all permissions instead of just "create new world" permission.

2020-12-17
- NEW: Mouse or trackpad scrolling now zooms in/out
- CHANGED: Lighting and shadows are a bit more optimized--only one shadow map, and the shadow map tries to grow/shrink based on camera distance

2020-12-14
- CHANGED: Camera angle mimics previous version's angle

2020-12-02
- FIXED: Some properties (such as position) can now be undone/redone. NOTE: There are still some remaining issues with undo/redo.

2020-12-01
- NEW: Undo/redo in Build mode. Ctrl-Z/Ctrl-Y on Windows, Cmd-Z/Cmd-Shift-Z on Mac OS. NOTE: Not all properties are currently working (for example, position seems to not be able to be undone at this time).
- NEW: "Tab" key switches between Build mode and Play mode.
- NEW: Double-click the "pause/unpause" button to enter "never automatically pause" mode. (Useful for debugging; normally, the virtual world pauses automatically when it is not the focused window).
- CHANGED: Participants must now click on a WebPage to give it mouse focus. This keeps mouse movement information inside the virtual world even when hovering over web pages. It also fixes a bug where some web pages were unable to load properly (e.g. Google Docs).
- FIXED: Deleting anything in a world would open that area up to a subtle bug in which new things would overwrite old things. New entities are now created using a random ID to prevent collisions.
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
- NEW: URL can now specify the world, e.g. https://staging.gatherengine.org/demo
- NEW: Connection Pane in upper-right corner allows you to connect/disconnect AND change worlds without reloading the HTML page.
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
- NEW: Mixed HTML/WebGL mode. We can embed html, iframes, etc. in GatherEngine's 3D world. Demo shows a youtube video.
- FIXED: Sometimes the box would lose the ability to be controlled.

2020-10-29
Demo is up: https://staging.gatherengine.org/
There isn't much to look at, but it shows the progress I'm making with three.js and our new Entity-Component-System called HECS.

