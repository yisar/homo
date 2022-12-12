const std = @import("std");

const print = std.debug.print;
const sdl = @import("./sdl.zig");

const qjs = @import("./qjs.zig");
// pub var myEventType: i32 = sdl.SDL_RegisterEvents(1);

pub fn fetch(js_ctx: ?*qjs.JSContext, _: qjs.JSValue, _: c_int, args: [*c]qjs.JSValue) callconv(.C) qjs.JSValue {
    var url = qjs.JS_ToCString(js_ctx, args[0]);
    var urll = std.mem.span(urll);
    print("{s}\n",.{urll});


    return qjs.JS_NewInt64(js_ctx, 123);
}