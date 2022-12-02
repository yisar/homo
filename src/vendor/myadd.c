#include "my.h"

int add(int a, int b)
{
  char buf[32];
  getDateAndTime(buf);
  printf("[%s] calling c add with: a=%d, b=%d \n", buf, a, b);

  return a + b;
}
