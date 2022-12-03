const std = @import("std");
const log = std.debug.print;

pub fn build(b: *std.build.Builder) void {
    const target = b.standardTargetOptions(.{});
    const mode = b.standardReleaseOptions();

    const quickjs = b.addStaticLibrary("quickjs", "src/dummy.zig");
    quickjs.addIncludePath("deps/quickjs");
    quickjs.disable_sanitize_c = true;
    quickjs.addCSourceFiles(&.{
        "deps/quickjs/cutils.c",
        "deps/quickjs/libbf.c",
        "deps/quickjs/libunicode.c",
        "deps/quickjs/quickjs-libc.c",
        "deps/quickjs/quickjs.c",
        "deps/quickjs/libregexp.c",
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
    exe.addIncludePath("deps/quickjs");
    exe.linkLibC();
    exe.linkLibrary(quickjs);
    exe.install();

    if (target.getOsTag() == .windows) {
        quickjs.addIncludePath("deps/mingw-w64-winpthreads/include");
        exe.addObjectFile("deps/mingw-w64-winpthreads/lib/libpthread.a");
    }

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
