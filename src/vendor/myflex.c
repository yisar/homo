#include "flex.h"

static struct flex_item *
flex_item_with_size(float width, float height)
{
    struct flex_item *item = flex_item_new();
    flex_item_set_width(item, width);
    flex_item_set_height(item, height);
    return item;
}

void test_basis1(void)
{
    struct flex_item *root = flex_item_with_size(100, 100);

    struct flex_item *child1 = flex_item_new();
    flex_item_set_width(child1, 100);
    flex_item_set_basis(child1, 60);
    flex_item_add(root, child1);

    struct flex_item *child2 = flex_item_with_size(100, 40);
    flex_item_add(root, child2);

    flex_layout(root);

    // TEST_FRAME_EQUAL(child1, 0, 0, 100, 60);
    // TEST_FRAME_EQUAL(child2, 0, 60, 100, 40);

    flex_item_free(root);
}