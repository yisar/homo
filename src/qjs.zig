const std = @import("std");
const jsapi = @import("./jsapi.zig");
const qjs = @This();

pub usingnamespace @cImport({
    @cInclude("quickjs-libc.h");
});

pub fn evalFile(allocator: std.mem.Allocator, src: []u8) ![]u8 {
    var js_src = std.ArrayList(u8).init(allocator);
    var js_wtr = js_src.writer();
    _ = try js_wtr.print("{s}\x00", .{src[0..src.len]});
    const srcs = js_src.toOwnedSlice();
    return srcs;
}

pub fn runMicrotask(allocator: std.mem.Allocator, src: []u8) !void {
    const js_src = try qjs.evalFile(allocator, src);

    const load_std = "import * as std from 'std';import * as os from 'os';globalThis.std = std;globalThis.os = os;";

    var js_runtime: *qjs.JSRuntime = qjs.JS_NewRuntime().?;
    defer qjs.JS_FreeRuntime(js_runtime);

    var js_context = qjs.JS_NewContext(js_runtime);
    defer qjs.JS_FreeContext(js_context);

    _ = qjs.js_init_module_std(js_context, "std");
    _ = qjs.js_init_module_os(js_context, "os");

    qjs.js_std_init_handlers(js_runtime);
    defer qjs.js_std_free_handlers(js_runtime);

    qjs.JS_SetModuleLoaderFunc(js_runtime, null, qjs.js_module_loader, null);

    qjs.js_std_add_helpers(js_context, 0, null);

    var global: qjs.JSValue = qjs.JS_GetGlobalObject(js_context);

    var sendfn: qjs.JSValue = qjs.JS_NewCFunction(js_context, jsapi.send, "send", 1);
    defer qjs.JS_FreeValue(js_context, global);
    _ = qjs.JS_SetPropertyStr(js_context, global, "send", sendfn);

    const val = qjs.JS_Eval(js_context, load_std, load_std.len, "<input>", qjs.JS_EVAL_TYPE_MODULE);
    if (qjs.JS_IsException(val) > 0) {
        qjs.js_std_dump_error(js_context);
    }

    const val2 = qjs.JS_Eval(js_context, js_src.ptr, js_src.len - 1, "<file>", qjs.JS_EVAL_TYPE_GLOBAL);
    if (qjs.JS_IsException(val2) > 0) {
        qjs.js_std_dump_error(js_context);
    }

    qjs.js_std_loop(js_context);
}
