const std = @import("std");
const log = std.debug.print;

pub fn build(b: *std.build.Builder) void {
    const target = b.standardTargetOptions(.{});
    const mode = b.standardReleaseOptions();

    const quickjs = b.addStaticLibrary("quickjs", "src/dummy.zig");
    quickjs.addIncludePath("clib/quickjs");
    quickjs.disable_sanitize_c = true;
    quickjs.addCSourceFiles(&.{
        "clib/quickjs/cutils.c",
        "clib/quickjs/libbf.c",
        "clib/quickjs/libunicode.c",
        "clib/quickjs/quickjs-libc.c",
        "clib/quickjs/quickjs.c",
        "clib/quickjs/libregexp.c",
    }, &.{
        "-g",
        "-Wall",
        "-D_GNU_SOURCE",
        "-DCONFIG_VERSION=\"2021-03-27\"",
        "-DCONFIG_BIGNUM",
    });
    quickjs.linkLibC();
    quickjs.install();
    quickjs.setTarget(target);
    quickjs.setBuildMode(mode);

    const exe = b.addExecutable("fre", "src/main.zig");
    exe.setTarget(target);
    exe.setBuildMode(mode);
    exe.addIncludePath("clib/quickjs");
    exe.linkLibC();
    exe.linkLibrary(quickjs);
    exe.install();

    if (target.getOsTag() == .windows) {
        quickjs.addIncludePath("clib/mingw-w64-winpthreads/include");
        exe.addObjectFile("clib/mingw-w64-winpthreads/lib/libpthread.a");
    }

    // init sdl
    const sdl_path = "D:\\SDL2-2.0.14\\";
    exe.addIncludePath(sdl_path ++ "include");
    exe.addLibraryPath(sdl_path ++ "lib\\x64");
    b.installBinFile(sdl_path ++ "lib\\x64\\SDL2.dll", "SDL2.dll");
    b.installBinFile(sdl_path ++ "lib\\x64\\SDL2_image.dll", "SDL2_image.dll");
    b.installBinFile(sdl_path ++ "lib\\x64\\SDL2_ttf.dll", "SDL2_ttf.dll");
    b.installBinFile(sdl_path ++ "lib\\x64\\SDL2_mixer.dll", "SDL2_mixer.dll");
    exe.linkSystemLibrary("sdl2");
    exe.linkSystemLibrary("sdl2_image");
    exe.linkSystemLibrary("sdl2_ttf");
    exe.linkSystemLibrary("sdl2_mixer");
    exe.linkLibC();

    const run_cmd = exe.run();
    run_cmd.step.dependOn(b.getInstallStep());
    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    const run_step = b.step("run", "Run the app");
    run_step.dependOn(&run_cmd.step);

    const exe_tests = b.addTest("src/main.zig");
    exe_tests.setTarget(target);
    exe_tests.setBuildMode(mode);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&exe_tests.step);
}
