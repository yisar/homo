const std = @import("std");

const print = std.debug.print;
const sdl = @import("./sdl.zig");

const qjs = @import("./qjs.zig");
const text = @import("./component/text.zig");
// pub var myEventType: i32 = sdl.SDL_RegisterEvents(1);

pub fn send(js_ctx: ?*qjs.JSContext, _: qjs.JSValue, _: c_int, args: [*c]qjs.JSValue) callconv(.C) qjs.JSValue {
    var j = qjs.JS_ToCString(js_ctx, args[0]);
    var jj = std.mem.span(j);
    print("{s}\n",.{jj});
    // const allocator = std.heap.page_allocator;
    // var parser = std.json.Parser.init(allocator, false);
    // defer parser.deinit();

    // var tree = parser.parse(jj) catch |err| {
    //     std.debug.print("error: {s}", .{@errorName(err)});
    //     return qjs.JS_NewInt64(js_ctx, 123);
    // };



    // if (myEventType != 0) {
    // var event:sdl.SDL_Event = undefined;
    // event.type = myEventType;
    // event.user.code = 1;
    // _=sdl.SDL_PushEvent(&event);
// }

    return qjs.JS_NewInt64(js_ctx, 123);
}