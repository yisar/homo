const std = @import("std");
const print = std.debug.print;

const withc = @cImport({
    @cInclude("my.h");
});

pub fn main() void {
    const val = zigAdd(1, 2);
    print("result is {}\n", .{val});
}

fn zigAdd(a: i32, b: i32) i32 {
    return withc.add(a, b);
}

test "zig with c test" {
    const t = std.testing;
    try t.expectEqual(@intCast(i32, 8), zigAdd(3, 5));
}
