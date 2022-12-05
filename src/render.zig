const std = @import("std");

const print = std.debug.print;
const sdl = @import("./sdl.zig");

const qjs = @import("./qjs.zig");
const text = @import("./component/text.zig");
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
    var _data = tree.root.Object.get("data").?.String;

    const terminated = try allocator.dupeZ(u8, _data); 
    defer allocator.free(terminated);

    if (std.mem.eql(u8, _type, "#text")) {
        text.drawFont(terminated[0..terminated.len], 30, 30);
    } else {}

    print("{s}", .{_data});
}
