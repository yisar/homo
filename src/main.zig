const std = @import("std");

const print = std.debug.print;
const sld = @import("./sdl.zig");

const qjs = @import("./qjs.zig");
const MAX_FILE_SIZE: usize = 1024 * 1024;

const fs = std.fs;
const mem = std.mem;

pub fn main() !void {
    const allocator = std.heap.c_allocator;
    var argIter = try std.process.argsWithAllocator(allocator);
    _ = argIter.next();
    const file = mem.span(argIter.next()) orelse return error.InvalidSource;
    const src = try fs.cwd().readFileAlloc(allocator, file, MAX_FILE_SIZE);
    defer allocator.free(src);

    try qjs.runMicrotask(allocator, src);
    try sld.runsdl();

}
