const std = @import("std");
const sdl = @import("../sdl.zig");

const print = std.debug.print;

pub fn drawFont(text: []const u8, x: i32, y: i32) void {
    var clearrect = sdl.SDL_Rect{ .x = 0, .y = 0, .w = 0, .h = 0 };
    clearrect.x = 0;
    clearrect.y = 0;
    clearrect.w = 100;
    clearrect.h = 100;

    _ = sdl.SDL_RenderFillRect(sdl.renderer, &clearrect);

    _ = sdl.TTF_Init();
    defer sdl.TTF_Quit();

    const font_file = @embedFile("../asset/Sans.ttf");
    const font_rw = sdl.SDL_RWFromConstMem(
        @ptrCast(*const anyopaque, &font_file[0]),
        @intCast(c_int, font_file.len),
    );
    defer std.debug.assert(sdl.SDL_RWclose(font_rw) == 0);

    const font = sdl.TTF_OpenFontRW(font_rw, 0, 16);
    defer sdl.TTF_CloseFont(font);

    const font_surface = sdl.TTF_RenderUTF8_Blended(
        font,
        text.ptr,
        sdl.SDL_Color{
            .r = 0xFF,
            .g = 0xFF,
            .b = 0xFF,
            .a = 0xFF,
        },
    );
    defer sdl.SDL_FreeSurface(font_surface);

    const font_tex = sdl.SDL_CreateTextureFromSurface(sdl.renderer, font_surface);
    defer sdl.SDL_DestroyTexture(font_tex);

    var font_rect: sdl.SDL_Rect = .{
        .w = font_surface.*.w,
        .h = font_surface.*.h,
        .x = 0,
        .y = 0,
    };

    font_rect.x = x;
    font_rect.y = y;

    _ = sdl.SDL_RenderCopy(sdl.renderer, font_tex, null, &font_rect);

}
