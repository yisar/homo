const std = @import("std");

const print = std.debug.print;

const qjs = @cImport(@cInclude("quickjs-libc.h"));

const MAX_FILE_SIZE: usize = 4*1024 * 1024;

const fs = std.fs;
const mem = std.mem;

fn set_int(context: *qjs.JSContext,_:qjs.JSValue,_:i32,_:[]*qjs.JSValue) callconv(.C) qjs.JSValue{
    const str = "console.log(123)";

    var jsval: qjs.JSValue = qjs.JS_Eval(context, str, str.len, "", 0);
    return jsval;
}


pub fn main() !void {
    const js_src = "const main = () => {console.log(\"hello world!\")};main();";
                           
    {
        const load_std =
            \\ import * as std from 'std';
            \\ import * as os from 'os';
            \\ globalThis.std = std;
            \\ globalThis.os = os;
        ;

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
    qjs.JS_SetPropertyStr(js_context, global, "test", qjs.JS_NewCFunction(js_context, set_int, "set_int", 0));
    var r:qjs.JSValue=qjs.JS_GetPropertyStr(js_context,global,"test");

    print("{}", .{r});


        const val = qjs.JS_Eval(js_context, load_std, load_std.len, "<input>", qjs.JS_EVAL_TYPE_MODULE);
        if (qjs.JS_IsException(val) > 0) {
            qjs.js_std_dump_error(js_context);
        }

        const val2 = qjs.JS_Eval(js_context, js_src, js_src.len - 1, "<file>", qjs.JS_EVAL_TYPE_GLOBAL);
        if (qjs.JS_IsException(val2) > 0) {
            qjs.js_std_dump_error(js_context);
        }

        qjs.js_std_loop(js_context);
    }
}
