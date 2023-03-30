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

    // init lvgl
    exe.linkLibC();

    exe.addIncludePath("./clib/lvgl");
    exe.addIncludePath("./clib/lvgl_drv");

    const cflags = [_][]const u8{
        // TODO:
        "-DLV_HOR_RES=800",
        "-DLV_VER_RES=480",

        "-DLV_CONF_INCLUDE_SIMPLE=1",
        "-fno-sanitize=all",
    };

    const lvgl_source_files = [_][]const u8{
        // core
        "clib/lvgl/src/core/lv_group.c",
        "clib/lvgl/src/core/lv_indev.c",
        "clib/lvgl/src/core/lv_indev_scroll.c",
        "clib/lvgl/src/core/lv_disp.c",
        "clib/lvgl/src/core/lv_theme.c",
        "clib/lvgl/src/core/lv_refr.c",
        "clib/lvgl/src/core/lv_obj.c",
        "clib/lvgl/src/core/lv_obj_class.c",
        "clib/lvgl/src/core/lv_obj_pos.c",
        "clib/lvgl/src/core/lv_obj_tree.c",
        "clib/lvgl/src/core/lv_obj_draw.c",
        "clib/lvgl/src/core/lv_obj_style.c",
        "clib/lvgl/src/core/lv_obj_style_gen.c",
        "clib/lvgl/src/core/lv_obj_scroll.c",
        "clib/lvgl/src/core/lv_event.c",
        //hal
        "clib/lvgl/src/hal/lv_hal_indev.c",
        "clib/lvgl/src/hal/lv_hal_tick.c",
        "clib/lvgl/src/hal/lv_hal_disp.c",
        //draw
        "clib/lvgl/src/draw/lv_draw.c",
        "clib/lvgl/src/draw/lv_draw_label.c",
        "clib/lvgl/src/draw/lv_draw_arc.c",
        "clib/lvgl/src/draw/lv_draw_rect.c",
        "clib/lvgl/src/draw/lv_draw_mask.c",
        "clib/lvgl/src/draw/lv_draw_line.c",
        "clib/lvgl/src/draw/lv_draw_img.c",

        "clib/lvgl/src/draw/sw/lv_draw_sw.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_blend.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_arc.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_rect.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_letter.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_img.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_line.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_polygon.c",
        "clib/lvgl/src/draw/sw/lv_draw_sw_gradient.c",

        "clib/lvgl/src/draw/lv_img_buf.c",
        "clib/lvgl/src/draw/lv_img_decoder.c",
        "clib/lvgl/src/draw/lv_img_cache.c",

        //misc
        "clib/lvgl/src/misc/lv_gc.c",
        "clib/lvgl/src/misc/lv_utils.c",
        "clib/lvgl/src/misc/lv_fs.c",
        "clib/lvgl/src/misc/lv_color.c",
        "clib/lvgl/src/misc/lv_async.c",
        "clib/lvgl/src/misc/lv_area.c",
        "clib/lvgl/src/misc/lv_anim.c",
        "clib/lvgl/src/misc/lv_txt.c",
        "clib/lvgl/src/misc/lv_tlsf.c",
        "clib/lvgl/src/misc/lv_timer.c",
        "clib/lvgl/src/misc/lv_style.c",
        "clib/lvgl/src/misc/lv_ll.c",
        "clib/lvgl/src/misc/lv_log.c",
        "clib/lvgl/src/misc/lv_printf.c",
        "clib/lvgl/src/misc/lv_mem.c",
        "clib/lvgl/src/misc/lv_math.c",
        "clib/lvgl/src/misc/lv_style_gen.c",
        // widgets
        "clib/lvgl/src/widgets/lv_arc.c",
        "clib/lvgl/src/widgets/lv_btn.c",
        "clib/lvgl/src/widgets/lv_btnmatrix.c",
        "clib/lvgl/src/widgets/lv_bar.c",
        "clib/lvgl/src/widgets/lv_dropdown.c",
        "clib/lvgl/src/widgets/lv_textarea.c",
        "clib/lvgl/src/widgets/lv_checkbox.c",
        "clib/lvgl/src/widgets/lv_switch.c",
        "clib/lvgl/src/widgets/lv_roller.c",
        "clib/lvgl/src/widgets/lv_slider.c",
        "clib/lvgl/src/widgets/lv_table.c",
        "clib/lvgl/src/widgets/lv_img.c",
        "clib/lvgl/src/widgets/lv_label.c",
        "clib/lvgl/src/widgets/lv_line.c",
        // extra
        "clib/lvgl/src/extra/lv_extra.c",
        "clib/lvgl/src/extra/widgets/tabview/lv_tabview.c",
        "clib/lvgl/src/extra/widgets/win/lv_win.c",
        "clib/lvgl/src/extra/widgets/msgbox/lv_msgbox.c",
        "clib/lvgl/src/extra/widgets/chart/lv_chart.c",
        "clib/lvgl/src/extra/widgets/spinner/lv_spinner.c",
        "clib/lvgl/src/extra/widgets/calendar/lv_calendar.c",
        "clib/lvgl/src/extra/widgets/calendar/lv_calendar_header_arrow.c",
        "clib/lvgl/src/extra/widgets/calendar/lv_calendar_header_dropdown.c",
        "clib/lvgl/src/extra/widgets/meter/lv_meter.c",
        "clib/lvgl/src/extra/widgets/keyboard/lv_keyboard.c",
        "clib/lvgl/src/extra/widgets/list/lv_list.c",
        "clib/lvgl/src/extra/widgets/menu/lv_menu.c",
        "clib/lvgl/src/extra/layouts/flex/lv_flex.c",
        "clib/lvgl/src/extra/themes/default/lv_theme_default.c",
        // font
        "clib/lvgl/src/font/lv_font.c",
        "clib/lvgl/src/font/lv_font_fmt_txt.c",
        "clib/lvgl/src/font/lv_font_montserrat_14.c",
        
        // lvgl_drv
        "clib/lvgl_drv/lv_sdl_disp.c",
        "clib/lvgl_drv/lv_port_indev.c",
        "clib/lvgl_drv/lv_xbox_disp.c",

    };
    exe.addCSourceFiles(&lvgl_source_files, &cflags);

    // init sdl


    if ( target.getOsTag() == .macos and
         target.getCpuArch().isAARCH64() ) {

        const homebrew_path = "/opt/homebrew";
        exe.addIncludePath(homebrew_path ++ "/include/SDL2");
        exe.addLibraryPath(homebrew_path ++ "/lib");

        exe.linkSystemLibrary("SDL2");
    }
    else {
        const sdl_path = "D:\\SDL2-2.0.14\\";
        exe.addIncludePath(sdl_path ++ "include");
        exe.addLibraryPath(sdl_path ++ "lib\\x64");
        b.installBinFile(sdl_path ++ "lib\\x64\\SDL2.dll", "SDL2.dll");
        b.installBinFile(sdl_path ++ "lib\\x64\\SDL2_image.dll", "SDL2_image.dll");
        b.installBinFile(sdl_path ++ "lib\\x64\\SDL2_ttf.dll", "SDL2_ttf.dll");
        exe.linkSystemLibrary("sdl2");
        exe.linkSystemLibrary("sdl2_image");
        exe.linkSystemLibrary("sdl2_ttf");
    }

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
