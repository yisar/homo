const std = @import("std");
const sdl = @cImport({
    @cInclude("SDL.h");
});
const my = @cImport({
    @cInclude("my.h");
});
const qjs = @cImport({
    @cInclude("quickjs.h");
});

const print = std.debug.print;

pub fn main() anyerror!void {
    add();
    qjsAdd();
    runSDL();
}

fn add() void {
    const val = my.add(1, 2);
    print("result is {}\n", .{val});
}

fn qjsAdd() void {
    const runtime = qjs.JS_NewRuntime();
    const context = qjs.JS_NewContext(runtime);

    const str = "console.log(123);";

    var res: qjs.JSValue = qjs.JS_Eval(context, str, str.len, "", 0);

    // var global: qjs.JSValue = qjs.JS_GetGlobalObject(context);

    // var str2 = qjs.JS_ToCString(context, res);

    // qjs.JS_SetPropertyStr(context, global, "str", "");

    print("{}", .{res});
}

fn runSDL() void {
    _ = sdl.SDL_Init(sdl.SDL_INIT_VIDEO);
    defer sdl.SDL_Quit();

    var window = sdl.SDL_CreateWindow("hello Fre embed!", sdl.SDL_WINDOWPOS_CENTERED, sdl.SDL_WINDOWPOS_CENTERED, 640, 400, 0);
    defer sdl.SDL_DestroyWindow(window);

    var renderer = sdl.SDL_CreateRenderer(window, 0, sdl.SDL_RENDERER_PRESENTVSYNC);
    defer sdl.SDL_DestroyRenderer(renderer);

    var frame: usize = 0;
    mainloop: while (true) {
        var sdl_event: sdl.SDL_Event = undefined;
        while (sdl.SDL_PollEvent(&sdl_event) != 0) {
            switch (sdl_event.type) {
                sdl.SDL_QUIT => break :mainloop,
                else => {},
            }
        }

        _ = sdl.SDL_SetRenderDrawColor(renderer, 0xff, 0xff, 0xff, 0xff);
        _ = sdl.SDL_RenderClear(renderer);
        var rect = sdl.SDL_Rect{ .x = 0, .y = 0, .w = 60, .h = 60 };
        const a = 0.06 * @intToFloat(f32, frame);
        const t = 2 * std.math.pi / 3.0;
        const r = 100 * @cos(0.1 * a);
        rect.x = 290 + @floatToInt(i32, r * @cos(a));
        rect.y = 170 + @floatToInt(i32, r * @sin(a));
        _ = sdl.SDL_SetRenderDrawColor(renderer, 0xff, 0, 0, 0xff);
        _ = sdl.SDL_RenderFillRect(renderer, &rect);
        rect.x = 290 + @floatToInt(i32, r * @cos(a + t));
        rect.y = 170 + @floatToInt(i32, r * @sin(a + t));
        _ = sdl.SDL_SetRenderDrawColor(renderer, 0, 0xff, 0, 0xff);
        _ = sdl.SDL_RenderFillRect(renderer, &rect);
        rect.x = 290 + @floatToInt(i32, r * @cos(a + 2 * t));
        rect.y = 170 + @floatToInt(i32, r * @sin(a + 2 * t));
        _ = sdl.SDL_SetRenderDrawColor(renderer, 0, 0, 0xff, 0xff);
        _ = sdl.SDL_RenderFillRect(renderer, &rect);
        sdl.SDL_RenderPresent(renderer);
        frame += 1;
    }
}
