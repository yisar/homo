const std = @import("std");

const print = std.debug.print;
const sdl = @import("./sdl.zig");

const qjs = @import("./qjs.zig");
const text = @import("./component/text.zig");
const view = @import("./component/view.zig");
// pub var myEventType: i32 = sdl.SDL_RegisterEvents(1);

pub fn render(direct: []const u8) !void {
    const allocator = std.heap.page_allocator;
    var parser = std.json.Parser.init(allocator, false);
    defer parser.deinit();

    var tree = parser.parse(direct) catch |err| {
        std.debug.print("error: {s}", .{@errorName(err)});
        return;
    };

    var _type = tree.root.Object.get("type").?.String;
    var _x = tree.root.Object.get("x").?.String;
    var _y = tree.root.Object.get("y").?.String;
    var _w = tree.root.Object.get("w").?.String;
    var _h = tree.root.Object.get("h").?.String;

    const xx = try std.fmt.parseInt(i32, _x, 10);
    const yy = try std.fmt.parseInt(i32, _y, 10);
    const ww = try std.fmt.parseInt(i32, _w, 10);
    const hh = try std.fmt.parseInt(i32, _h, 10);

    if (std.mem.eql(u8, _type, "#text")) {
        var _data = tree.root.Object.get("data").?.String;
        const terminated = try allocator.dupeZ(u8, _data);
        defer allocator.free(terminated);
        text.drawFont(terminated[0..terminated.len], xx, yy);
    }

    if (std.mem.eql(u8, _type, "VIEW")) {
        view.drawView(xx, yy, ww, hh);
    }

    _ = sdl.SDL_RenderPresent(sdl.renderer);


    // print("{s}", .{_data});
}
