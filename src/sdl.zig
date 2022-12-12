const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL.h");
    @cInclude("SDL_image.h");
    @cInclude("SDL_ttf.h");
});

const assert = @import("std").debug.assert;
const text = @import("./component/text.zig");
const print = std.debug.print;
const qjs = @import("./qjs.zig");
const r = @import("./render.zig");

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

    _ = sdl.SDL_SetRenderDrawColor(renderer, 0xFF, 0xFF, 0xFF, 0xFF);
    _ = sdl.SDL_RenderClear(renderer);

    eventloop: while (true) {
        var event: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&event) != 0) {
            switch (event.type) {
                sdl.SDL_QUIT => {
                    break :eventloop;
                },
                sdl.SDL_KEYDOWN => {},
                sdl.SDL_MOUSEBUTTONDOWN => {
                    var args = [_]qjs.JSValue{ qjs.JS_NewInt32(qjs.js_ctx, event.motion.x), qjs.JS_NewInt32(qjs.js_ctx, event.motion.y) };
                    _ = qjs.js_call("bubblingClick", 2, &args);
                },
                else => {},
            }
        }
        var args = [_]qjs.JSValue{};
        var direct = qjs.js_call("getRenderQueue", 0, &args);
        if (!std.mem.eql(u8, direct, "null")) {
            try r.render(direct);
        } else {}

        sdl.SDL_Delay(1000 / 60);
    }
}
