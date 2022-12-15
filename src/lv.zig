const lv = @import("./lvgl.zig");

pub fn runLvgl() void {
    lv.lv_init();
    defer lv.lv_deinit();

    lv.lv_port_disp_init(640, 480);
    defer lv.lv_port_disp_deinit();

    lv.lv_port_indev_init(true);
    defer lv.lv_port_indev_deinit();
    _ = lv.lv_scr_act();
    lv.lv_obj_set_style_bg_color(lv.lv_scr_act(), lv.lv_color_hex(0x003a57), lv.LV_PART_MAIN);
    var label = lv.lv_label_create(lv.lv_scr_act());
    _ = lv.lv_label_set_text(label, "Hello world");
    _ = lv.lv_obj_set_style_text_color(lv.lv_scr_act(), lv.lv_color_hex(0xffffff), lv.LV_PART_MAIN);
    _ = lv.lv_obj_align(label, lv.LV_ALIGN_CENTER, 0, 0);

    // var lastTick: i64 = std.time.milliTimestamp();

}
