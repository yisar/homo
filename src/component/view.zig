const std = @import("std");
const sdl = @import("../sdl.zig");

const print = std.debug.print;

pub fn drawView(x: i32, y: i32, w:i32, h:i32) void {
    var rect = sdl.SDL_Rect{ .x = 0, .y = 0, .w = 0, .h = 0 };

    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;

    _ = sdl.SDL_SetRenderDrawColor(sdl.renderer, 0xff, 0, 0, 0x10);
    _ = sdl.SDL_RenderFillRect(sdl.renderer, &rect);
}
