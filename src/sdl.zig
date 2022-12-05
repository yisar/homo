const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL.h");
    @cInclude("SDL_image.h");
    @cInclude("SDL_mixer.h");
    @cInclude("SDL_ttf.h");
});

const assert = @import("std").debug.assert;

pub usingnamespace sdl;

pub var window: ?*sdl.SDL_Window = null;
pub var renderer: ?*sdl.SDL_Renderer = null;

pub fn runsdl() anyerror!void {
    _ = sdl.SDL_Init(sdl.SDL_INIT_VIDEO | sdl.SDL_INIT_AUDIO);
    defer sdl.SDL_Quit();

    _ = sdl.SDL_CreateWindowAndRenderer(
        640,
        480,
        sdl.SDL_WINDOW_RESIZABLE | sdl.SDL_WINDOW_ALLOW_HIGHDPI,
        &window,
        &renderer,
    );
    defer sdl.SDL_DestroyWindow(window);

    _ = sdl.TTF_Init();
    defer sdl.TTF_Quit();

    mainloop: while (true) {
        var event: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&event) != 0) {
            switch (event.type) {
                sdl.SDL_QUIT => {
                    break :mainloop;
                },
                sdl.SDL_KEYDOWN => {},
                else => {},
            }
        }

        _ = sdl.SDL_SetRenderDrawColor(renderer, 0x94, 0x6c, 0xe6, 0xFF);
        _ = sdl.SDL_RenderClear(renderer);

        sdl.SDL_Delay(1000 / 60);
    }
}
