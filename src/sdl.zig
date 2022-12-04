const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL.h");
    @cInclude("SDL_image.h");
    @cInclude("SDL_mixer.h");
    @cInclude("SDL_ttf.h");
});

const assert = @import("std").debug.assert;

pub usingnamespace sdl;

pub fn runsdl() anyerror!void {
if (sdl.SDL_Init(sdl.SDL_INIT_VIDEO | sdl.SDL_INIT_AUDIO) != 0) {
        sdl.SDL_Log("Unable to initialize SDL: %s", sdl.SDL_GetError());
        return error.SDLInitializationFailed;
    }
    defer sdl.SDL_Quit();

    var window: ?*sdl.SDL_Window = null;
    var renderer: ?*sdl.SDL_Renderer = null;
    if (sdl.SDL_CreateWindowAndRenderer(
        640,
        480,
        sdl.SDL_WINDOW_RESIZABLE | sdl.SDL_WINDOW_ALLOW_HIGHDPI,
        &window,
        &renderer,
    ) != 0) {
        sdl.SDL_Log("Unable to create window and renderer: %s", sdl.SDL_GetError());
        return error.SDLInitializationFailed;
    }
    defer sdl.SDL_DestroyWindow(window);

    // const image_file = @embedFile("zero.png");
    // const rw = sdl.SDL_RWFromConstMem(
    //     @ptrCast(*const anyopaque, &image_file[0]),
    //     @intCast(c_int, image_file.len),
    // ) orelse {
    //     sdl.SDL_Log("Unable to get RWFromConstMem: %s", sdl.SDL_GetError());
    //     return error.SDLInitializationFailed;
    // };
    // defer std.debug.assert(sdl.SDL_RWclose(rw) == 0);

    // _ = sdl.IMG_Init(sdl.IMG_INIT_PNG);
    // defer sdl.IMG_Quit();

    // const texture = sdl.IMG_LoadTexture_RW(renderer, rw, 0) orelse {
    //     sdl.SDL_Log("Unable to load texture: %s", sdl.IMG_GetError());
    //     return error.SDLInitializationFailed;
    // };
    // defer sdl.SDL_DestroyTexture(texture);

    // var width: i32 = 0;
    // var height: i32 = 0;
    // _ = sdl.SDL_QueryTexture(texture, null, null, &width, &height);

    // var rect: sdl.SDL_Rect = .{ .w = width, .h = height, .x = 0, .y = 0 };

    if (sdl.TTF_Init() != 0) {
        sdl.SDL_Log("Unable to initialize SDL2_ttf: %s", sdl.TTF_GetError());
        return error.SDLInitializationFailed;
    }
    defer sdl.TTF_Quit();

    const font_file = @embedFile("Sans.ttf");
    const font_rw = sdl.SDL_RWFromConstMem(
        @ptrCast(*const anyopaque, &font_file[0]),
        @intCast(c_int, font_file.len),
    ) orelse {
        sdl.SDL_Log("Unable to get RWFromConstMem: %s", sdl.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer std.debug.assert(sdl.SDL_RWclose(font_rw) == 0);

    const font = sdl.TTF_OpenFontRW(font_rw, 0, 16) orelse {
        sdl.SDL_Log("Unable to load font: %s", sdl.TTF_GetError());
        return error.SDLInitializationFailed;
    };
    defer sdl.TTF_CloseFont(font);

    const font_surface = sdl.TTF_RenderUTF8_Blended(
        font,
        "Hello Fre.",
        sdl.SDL_Color{
            .r = 0xFF,
            .g = 0xFF,
            .b = 0xFF,
            .a = 0xFF,
        },
    ) orelse {
        sdl.SDL_Log("Unable to render text: %s", sdl.TTF_GetError());
        return error.SDLInitializationFailed;
    };
    defer sdl.SDL_FreeSurface(font_surface);

    const font_tex = sdl.SDL_CreateTextureFromSurface(renderer, font_surface) orelse {
        sdl.SDL_Log("Unable to create texture: %s", sdl.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer sdl.SDL_DestroyTexture(font_tex);

    var font_rect: sdl.SDL_Rect = .{
        .w = font_surface.*.w,
        .h = font_surface.*.h,
        .x = 0,
        .y = 0,
    };

    var before_key: bool = false;
    var current_key: bool = false;

    mainloop: while (true) {
        current_key = false;
        var event: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&event) != 0) {
            switch (event.type) {
                sdl.SDL_QUIT => {
                    break :mainloop;
                },
                sdl.SDL_KEYDOWN => {
                    if (event.key.keysym.sym == sdl.SDLK_RETURN) {
                        current_key = true;
                    }
                },
                else => {},
            }
        }

        _ = sdl.SDL_SetRenderDrawColor(renderer, 0x94, 0x6c, 0xe6, 0xFF);
        _ = sdl.SDL_RenderClear(renderer);

        {
            var w: c_int = 640;
            var h: c_int = 480;
            sdl.SDL_GetWindowSize(window, &w, &h);
            // rect.x = @divTrunc((w - rect.w), 2);
            // rect.y = @divTrunc((h - rect.h), 2) - @divTrunc(font_rect.h, 2) - 5;
            font_rect.x = @divTrunc((w - font_rect.w), 2);
            font_rect.y = @divTrunc((h - font_rect.h), 2) - @divTrunc(font_rect.h, 2);
        }
        // _ = sdl.SDL_RenderCopy(renderer, texture, null, &rect);
        _ = sdl.SDL_RenderCopy(renderer, font_tex, null, &font_rect);

        _ = sdl.SDL_RenderPresent(renderer);

        sdl.SDL_Delay(1000 / 60);
        before_key = current_key;
    }

    std.debug.print("May {s} be with you", .{"the SDL"});
}

