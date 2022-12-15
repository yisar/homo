//SPDX-License-Identifier: MIT

#ifdef NXDK
#include <assert.h>
#include <hal/video.h>
#include "lv_port_disp.h"
#include "lvgl.h"

static void *fb1, *fb2;
static lv_disp_drv_t disp_drv;
static lv_disp_draw_buf_t draw_buf;
static int DISPLAY_WIDTH;
static int DISPLAY_HEIGHT;

static void disp_flush(lv_disp_drv_t * disp_drv, const lv_area_t * area, lv_color_t * color_p)
{
    VIDEOREG(0x00600800) = (unsigned int)MmGetPhysicalAddress(color_p);
    XVideoFlushFB();
    lv_disp_flush_ready(disp_drv);
}

void lv_port_disp_init(int width, int height)
{
    DISPLAY_WIDTH = width;
    DISPLAY_HEIGHT = height;
    XVideoSetMode(DISPLAY_WIDTH, DISPLAY_HEIGHT, LV_COLOR_DEPTH, REFRESH_DEFAULT);

    fb1 = MmAllocateContiguousMemoryEx(DISPLAY_WIDTH * DISPLAY_HEIGHT * ((LV_COLOR_DEPTH + 7) / 8),
                                       0x00000000, 0x7FFFFFFF,
                                       0x1000,
                                       PAGE_READWRITE |
                                       PAGE_WRITECOMBINE);

    fb2 = MmAllocateContiguousMemoryEx(DISPLAY_WIDTH * DISPLAY_HEIGHT * ((LV_COLOR_DEPTH + 7) / 8),
                                       0x00000000, 0x7FFFFFFF,
                                       0x1000,
                                       PAGE_READWRITE |
                                       PAGE_WRITECOMBINE);

    assert(fb1 != NULL);
    assert(fb2 != NULL);

    RtlZeroMemory(fb1, DISPLAY_WIDTH * DISPLAY_HEIGHT * ((LV_COLOR_DEPTH + 7) / 8));
    RtlZeroMemory(fb2, DISPLAY_WIDTH * DISPLAY_HEIGHT * ((LV_COLOR_DEPTH + 7) / 8));
    VIDEOREG(0x00600800) = (unsigned int)MmGetPhysicalAddress(fb1);
    XVideoFlushFB();

    lv_disp_draw_buf_init(&draw_buf, fb1, fb2, DISPLAY_WIDTH * DISPLAY_HEIGHT);
    lv_disp_drv_init(&disp_drv);

    disp_drv.hor_res = DISPLAY_WIDTH;
    disp_drv.ver_res = DISPLAY_HEIGHT;
    disp_drv.flush_cb = disp_flush;
    disp_drv.draw_buf = &draw_buf;
    disp_drv.full_refresh = 1;
    lv_disp_drv_register(&disp_drv);
}

void lv_port_disp_deinit()
{
    MmFreeContiguousMemory(fb1);
    MmFreeContiguousMemory(fb2);
}

#endif
