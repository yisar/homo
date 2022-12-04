const image_file = @embedFile("zero.png");
    const rw = c.SDL_RWFromConstMem(
        @ptrCast(*const anyopaque, &image_file[0]),
        @intCast(c_int, image_file.len),
    ) orelse {
        c.SDL_Log("Unable to get RWFromConstMem: %s", c.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer std.debug.assert(c.SDL_RWclose(rw) == 0);

    _ = c.IMG_Init(c.IMG_INIT_PNG);
    defer c.IMG_Quit();

    const texture = c.IMG_LoadTexture_RW(renderer, rw, 0) orelse {
        c.SDL_Log("Unable to load texture: %s", c.IMG_GetError());
        return error.SDLInitializationFailed;
    };
    defer c.SDL_DestroyTexture(texture);

    var width: i32 = 0;
    var height: i32 = 0;
    _ = c.SDL_QueryTexture(texture, null, null, &width, &height);

    var rect: c.SDL_Rect = .{ .w = width, .h = height, .x = 0, .y = 0 };

    _ = c.Mix_Init(c.MIX_INIT_OGG);
    defer c.Mix_Quit();

    if (c.Mix_OpenAudio(
        c.MIX_DEFAULT_FREQUENCY,
        c.MIX_DEFAULT_FORMAT,
        c.MIX_DEFAULT_CHANNELS,
        1024,
    ) != 0) {
        c.SDL_Log("Unable to open audio: %s", c.Mix_GetError());
        return error.SDLInitializationFailed;
    }
    defer c.Mix_CloseAudio();

    const audio_file = @embedFile("laserSmall_000.ogg");
    const audio_rw = c.SDL_RWFromConstMem(
        @ptrCast(*const anyopaque, &audio_file[0]),
        @intCast(c_int, audio_file.len),
    ) orelse {
        c.SDL_Log("Unable to get RWFromConstMem: %s", c.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer std.debug.assert(c.SDL_RWclose(audio_rw) == 0);

    const audio = c.Mix_LoadWAV_RW(audio_rw, 0) orelse {
        c.SDL_Log("Unable to load audio: %s", c.Mix_GetError());
        return error.SDLInitializationFailed;
    };
    defer c.Mix_FreeChunk(audio);

    if (c.TTF_Init() != 0) {
        c.SDL_Log("Unable to initialize SDL2_ttf: %s", c.TTF_GetError());
        return error.SDLInitializationFailed;
    }
    defer c.TTF_Quit();

    const font_file = @embedFile("Kenney Future.ttf");
    const font_rw = c.SDL_RWFromConstMem(
        @ptrCast(*const anyopaque, &font_file[0]),
        @intCast(c_int, font_file.len),
    ) orelse {
        c.SDL_Log("Unable to get RWFromConstMem: %s", c.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer std.debug.assert(c.SDL_RWclose(font_rw) == 0);

    const font = c.TTF_OpenFontRW(font_rw, 0, 16) orelse {
        c.SDL_Log("Unable to load font: %s", c.TTF_GetError());
        return error.SDLInitializationFailed;
    };
    defer c.TTF_CloseFont(font);

    const font_surface = c.TTF_RenderUTF8_Solid(
        font,
        "All your codebase are belong to us.",
        c.SDL_Color{
            .r = 0xFF,
            .g = 0xFF,
            .b = 0xFF,
            .a = 0xFF,
        },
    ) orelse {
        c.SDL_Log("Unable to render text: %s", c.TTF_GetError());
        return error.SDLInitializationFailed;
    };
    defer c.SDL_FreeSurface(font_surface);

    const font_tex = c.SDL_CreateTextureFromSurface(renderer, font_surface) orelse {
        c.SDL_Log("Unable to create texture: %s", c.SDL_GetError());
        return error.SDLInitializationFailed;
    };
    defer c.SDL_DestroyTexture(font_tex);

    var font_rect: c.SDL_Rect = .{
        .w = font_surface.*.w,
        .h = font_surface.*.h,
        .x = 0,
        .y = 0,
    };

    var before_key: bool = false;
    var current_key: bool = false;

    mainloop: while (true) {
        current_key = false;
        var event: c.SDL_Event = undefined;
        while (c.SDL_PollEvent(&event) != 0) {
            switch (event.type) {
                c.SDL_QUIT => {
                    break :mainloop;
                },
                c.SDL_KEYDOWN => {
                    if (event.key.keysym.sym == c.SDLK_RETURN) {
                        current_key = true;
                    }
                },
                else => {},
            }
        }

        if (current_key and !before_key) {
            _ = c.Mix_PlayChannel(-1, audio, 0);
        }

        _ = c.SDL_SetRenderDrawColor(renderer, 0xFF, 0x7F, 0x00, 0xFF);
        _ = c.SDL_RenderClear(renderer);

        {
            var w: c_int = 640;
            var h: c_int = 480;
            c.SDL_GetWindowSize(window, &w, &h);
            rect.x = @divTrunc((w - rect.w), 2);
            rect.y = @divTrunc((h - rect.h), 2) - @divTrunc(font_rect.h, 2) - 5;
            font_rect.x = @divTrunc((w - font_rect.w), 2);
            font_rect.y = @divTrunc((h - font_rect.h), 2) + @divTrunc(rect.h, 2) + 5;
        }
        _ = c.SDL_RenderCopy(renderer, texture, null, &rect);
        _ = c.SDL_RenderCopy(renderer, font_tex, null, &font_rect);

        _ = c.SDL_RenderPresent(renderer);

        c.SDL_Delay(1000 / 60);
        before_key = current_key;
    }

    std.debug.print("May {s} be with you", .{"the SDL"});