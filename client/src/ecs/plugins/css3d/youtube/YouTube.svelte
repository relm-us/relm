<script context="module">
let youtubeInstances = 0
</script>

<script lang="ts">
    import { Vector2, Object3D } from "three";

    import { worldManager } from "~/world";
    import { PROXIMITY_AUDIO_INNER_RADIUS, PROXIMITY_AUDIO_OUTER_RADIUS } from "~/config/constants";

    import { worldUIMode } from "~/stores/worldUIMode";
    import { audioMode } from "~/stores/audioMode";
    import { Object3DRef } from "~/ecs/plugins/core";

    import PlayButtonIcon from "./PlayButtonIcon.svelte";

    export let size: Vector2;
    export let embedId: string;
    export let alwaysOn: boolean;
    export let visible: boolean;
    export let title = "YouTube Video";
    export let nativeControls = false;
    export let entity;

    let src;
    let iframe;
    let fullscreen = false;
    let state: "INIT" | "LOADING" | "LOADED" = "INIT";
    let frameMouseOver = false;
    let active = false;
    let overlayHovered = false;
    let restoreFocusTimeout;

    // Note: MUST be 1 or greater, since youtube treats id '0' as special
    const youtubeId = ++youtubeInstances;

    enum PlayerState {
        UNSTARTED = -1,
        ENDED = 0,
        PLAYING = 1,
        PAUSED = 2,
        BUFFERING = 3,
        VIDEO_CUED = 5,
    }

    let playerState = PlayerState.UNSTARTED;

    const setPlayerState = (newState: PlayerState) => {
        if (
            (playerState !== PlayerState.ENDED && newState === PlayerState.ENDED) ||
            (playerState !== PlayerState.PAUSED && newState === PlayerState.PAUSED) ||
            (playerState !== PlayerState.PLAYING && newState === PlayerState.PLAYING)
        ) {
            clearTimeout(restoreFocusTimeout);
            restoreFocusTimeout = setTimeout(restoreFocusToRelm, 100);

            // Restore initial video state after video ends
            if (newState === PlayerState.ENDED) active = false;
        }
        playerState = newState;
    };

    const HOST = "https://www.youtube.com";

    /**
     * Note: Firefox currently has a bug where it distorts pointer event coordinates
     *       within CSS3D transformed iframes. As a result, we must disable the
     *       YouTube controls for Firefox (as of FF 96.0).
     */
    $: src = `${HOST}/embed/${embedId}?enablejsapi=1&rel=0&controls=${nativeControls ? 1 : 0}`;

    $: if (alwaysOn) {
        active = true;
    }

    $: if ($worldUIMode === "build") pauseVideo();

    function ytCommand(func, args = []) {
        if (!iframe || !iframe.contentWindow) {
            console.warn("YouTube iframe.contentWindow missing; command ignored");
            return;
        }
        iframe.contentWindow.postMessage(
            JSON.stringify({
                event: "command",
                id: youtubeId,
                channel: "default",
                func,
                args,
            }),
            "*",
        );
    }

    function playVideo() {
        if (!iframe) return;
        ytCommand("playVideo");
        overlayHovered = false;
        worldManager.participants.setMic(false);
    }

    function pauseVideo() {
        if (!iframe) return;
        ytCommand("pauseVideo");
        overlayHovered = true;
        worldManager.participants.setMic(true);
    }

    function restoreFocusToRelm() {
        if (fullscreen) return;
        iframe?.blur();
        setTimeout(() => iframe?.blur(), 50);
    }

    function restoreFocus() {
        clearTimeout(restoreFocusTimeout);
        restoreFocusTimeout = setTimeout(restoreFocusToRelm, 5000);
    }

    // Return keyboard focus to Relm when user clicks on a youtube iframe
    function onWindowBlur() {
        if (frameMouseOver) restoreFocus();
    }

    function onFullscreen() {
        fullscreen = Boolean(document.fullscreenElement);

        // Also restore focus to Relm when user leaves fullscreen
        restoreFocus();
    }

    function onFrameMouseover() {
        frameMouseOver = true;
    }

    function onFrameMouseout() {
        frameMouseOver = false;
    }

    function onMessage(message) {
        if (message.origin === HOST) {
            const data = JSON.parse(message.data);
            if (data.id !== youtubeId) return;

            console.log("message", message);

            if (data.info && "playerState" in data.info) {
                if (playerState !== data.info.playerState) {
                    setPlayerState(data.info.playerState);
                }
            }

            if (data.event === "onReady") {
                state = "LOADED";

                if (!alwaysOn) {
                    playVideo();
                }
            }
        }
    }

    function onFrameLoaded() {
        state = "LOADING";
        const listenEvent = {
            event: "listening",
            id: youtubeId,
            channel: "default",
        };
        iframe.contentWindow.postMessage(JSON.stringify(listenEvent), "*");

        ytCommand("addEventListener", ["onReady"]);
    }

    function onClickPlay() {
        if ($worldUIMode === "play") {
            if (playerState === PlayerState.PLAYING) {
                pauseVideo();
            } else {
                if (alwaysOn || active) playVideo();
                else active = true;
            }
        }
    }

    const falloffStart = PROXIMITY_AUDIO_INNER_RADIUS;
    const falloffEnd = PROXIMITY_AUDIO_OUTER_RADIUS;

    let volume = 1;
    $: if (active && playerState === PlayerState.PLAYING) {
        ytCommand("setVolume", [volume * 100]);
    }

    let interval;
    $: if ($audioMode === "proximity") {
        if (interval) clearInterval(interval);
        interval = setInterval(() => {
            const object3d: Object3D = entity.get(Object3DRef)?.value;
            const avatar = worldManager.avatar;
            if (avatar && object3d) {
                const distance = avatar.position.distanceTo(object3d.position);
                if (distance >= 0 && distance < falloffStart) {
                    volume = 1;
                } else if (distance < falloffEnd) {
                    const delta = falloffEnd - falloffStart;
                    volume = (delta - (distance - falloffStart)) / delta;
                } else {
                    volume = 0;
                }
            }
        }, 100);
    } else if (interval) {
        clearInterval(interval);
        volume = 1;
    }

    // ignore warning about missing props
    $$props;
</script>

<svelte:window on:message={onMessage} on:blur={onWindowBlur} on:fullscreenchange={onFullscreen} />

{#if visible}
    {#if active}
        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
        <iframe
            class:invisible={state !== "LOADED"}
            bind:this={iframe}
            on:load={onFrameLoaded}
            on:mouseover={onFrameMouseover}
            on:mouseout={onFrameMouseout}
            {title}
            width={size.x}
            height={size.y}
            {src}
            frameborder="0"
            allowfullscreen
            allow="autoplay"
        />

        {#if $worldUIMode === "build"}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <r-overlay
                on:click={onClickPlay}
                on:pointerenter={() => (overlayHovered = true)}
                on:pointerleave={() => (overlayHovered = false)}
            >
                <img src="https://img.youtube.com/vi/{embedId}/hqdefault.jpg" alt={title} />
            </r-overlay>
        {:else if state !== "LOADED"}
            <r-overlay>
                <r-centered>
                    <div>Loading...</div>
                </r-centered>
            </r-overlay>
        {:else if !nativeControls}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <r-overlay
                on:click={onClickPlay}
                on:pointerenter={() => (overlayHovered = true)}
                on:pointerleave={() => (overlayHovered = false)}
            >
                {#if overlayHovered && playerState !== PlayerState.PLAYING}
                    <PlayButtonIcon active={overlayHovered} />
                {/if}
            </r-overlay>
        {/if}
    {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <r-overlay
            on:click={onClickPlay}
            on:pointerenter={() => (overlayHovered = true)}
            on:pointerleave={() => (overlayHovered = false)}
        >
            <img src="https://img.youtube.com/vi/{embedId}/hqdefault.jpg" alt={title} />

            <PlayButtonIcon active={overlayHovered} />
        </r-overlay>
    {/if}
{/if}

<style>
    iframe {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;

        pointer-events: auto;
    }

    r-overlay {
        display: flex;

        position: absolute;
        z-index: 2;

        left: 0;
        top: 0;

        width: 100%;
        height: 100%;
    }

    r-overlay img {
        width: 100%;
        object-fit: cover;
    }

    r-centered {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 100%;

        color: black;
        background-color: rgb(240, 240, 240, 0.7);

        font-size: 32px;
        font-weight: bold;
        /* box-shadow: inset 0px 0px 0px 6px #000000; */
    }

    .invisible {
        visibility: hidden;
    }
</style>
