# 如何让CPU跑得更快

>根据著名的摩尔定律，CPU的性能每18个月就会翻一番，那么我们计算机的运行速度是否也会翻一番呢？
>
>答案是否定的，因为计算机性能受各个硬件影响，根据木桶效应，计算机的性能取决于“最短的那一块木板”

实际上CPU的性能主要受到存储器的限制，尽管内存的速度当然也会不断增长，但是增长的速度远小于 CPU，平均每年只增长 7% 左右

于是为了提升CPU速度的问题转变成了提升内存访问速度的问题，我们使用多级的Cache（高速缓存）来弥补CPU速度和内存访问速度的差距

但是CPU Cache 所使用的材料是 SRAM，价格比内存使用的 DRAM 高出很多，在当今每生产 1 MB 大小的 CPU Cache 需要 7 美金的成本，而内存只需要 0.015 美金的成本，成本方面相差了 466 倍，所以 CPU Cache 不像内存那样动辄以 GB 计算，它的大小是以 KB 或 MB 来计算的

::: tip Linux查看Cache大小
`$ cat /sys/devices/system/cpu/cpu0/cache/index0/size` # 查看L1 Cache大小
:::

我们只能预先将需要读取的数据放入Cache中才能提升访问速度，但是空间大小的差异使得不是每一次获取数据都能在Cache中命中，需要从内存读取，于是让CPU跑得更快的问题又转变为了提升Cache命中率的问题

Cache的读取大小可能包含多个字节的数据，所以如果读取在内存中连续的数据能大大提高Cache的命中率

::: tip Linux查看Cache数据块大小
`$ cat /sys/devices/system/cpu/cpu0/cache/index0/coherency_line_size` # 查看L1 Cache数据块大小
:::

L1 Cache 通常分为**数据缓存**和**指令缓存**，这是因为 CPU 会分别处理数据和指令

```c
for (int i = 0; i < N; i++)
{
	for(int j = 0; j < N; j++)
	{
		array[i][j] = 0;
	}
}
```

```c
for (int i = 0; i < N; i++)
{
	for(int j = 0; j < N; j++)
	{
		array[j][i] = 0;
	}
}
```

::: details 上面的两段代码哪一个运行速度快？
因为二维数组的元素在内存中是按行优先存储的，第一种访问顺序是按行顺序访问，所以符合了元素的存储顺序，假设Cache块大小为64B，array元素为4B，那么第一次访问`array[0][0]`时命中失败，将后面64B数据写入Cache，那么从`array[0][1]`到`array[0][15]`都在Cache命中，访问速度更快。反观第二种访问方式基本每读一个元素都要读内存，所以速度更慢
:::

**那么对于指令缓存怎么提升速度呢？**

如果有一个数组，存储了百以内的随机数，那么要去除掉小于50的元素并将它从小到大排列

::: details 先排序还是先去除？
CPU存在**分支预测器**，如果CPU能预测中下一步执行的是if还是else，那就可以提前将数据放入Cache，来提高命中率。此时元素是随机的，所以CPU无法预测后面的数据是否大于50，但如果先排序，CPU就能合理地预测后面的数据，从而提高Cache命中率
:::

::: tip C/C++提供了分支预测
`likely`和`unlikely`这两种宏能帮编译器预测代码，如果 `if` 条件为 `ture` 的概率大，则可以用 `likely` 宏把 `if` 里的表达式包裹起来，反之用 `unlikely` 宏

```c
if (likely(x > 50))
{
	// do something
}
else
{
	// do something else
}
```
:::

事实上，现在CPU大部分都是多核的，进程可能在不同的CPU核心上交替运行，虽然L3 Cache是多核心共享的，但是L1 Cache和L2 Cache却是每个核心独享的，来回的切换必定影响命中率

Linux提供了`sched_setaffinity`方法，来实现将进程绑定到某个CPU核心，这样在执行计算密集型进程的时候可以很大提升速度

```c
#include <sched.h>

/**
	* @param pid 进程ID
	* @param cpusetsize CPU集合大小
	* @param mask 位掩码，其中每个位代表一个 CPU
	* @retval 0表示成功，-1表示失败
	*/
int sched_setaffinity(pid_t pid, size_t cpusetsize, const cpu_set_t *mask);
```
