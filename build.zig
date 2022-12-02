const std = @import("std");

pub fn build(b: *std.build.Builder) void {
    const target = b.standardTargetOptions(.{ .default_target = .{ .abi = .gnu } });
    const mode = b.standardReleaseOptions();

    const exe = b.addExecutable("fre", "src/main.zig");
    exe.setTarget(target);
    exe.setBuildMode(mode);

    // init flex
    const c_args = [_][]const u8{
        "-std=c99",
    };

    exe.linkLibC();
    exe.addIncludePath("src/c/include");
    exe.addCSourceFile("src/c/myadd.c", &c_args);
    exe.addCSourceFile("src/c/flex.c", &c_args);
    exe.addCSourceFile("src/c/myflex.c", &c_args);

    // init sdl
    const sdl_path = "D:\\SDL2-2.0.14\\";
    exe.addIncludePath(sdl_path ++ "include");
    exe.addLibraryPath(sdl_path ++ "lib\\x64");
    b.installBinFile(sdl_path ++ "lib\\x64\\SDL2.dll", "SDL2.dll");
    exe.linkSystemLibrary("sdl2");
    exe.linkLibC();
    exe.install();

    const run_cmd = exe.run();
    run_cmd.step.dependOn(b.getInstallStep());
    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);

}