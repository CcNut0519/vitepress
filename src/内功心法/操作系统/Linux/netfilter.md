# Netfilter

## 内核网络收包过程

![](https://image-host.pages.dev/learn/2024_10_14_1000011113.png)

1. 当网卡上收到数据以后，Linux 中第一个工作的模块是网络驱动，网络驱动会以DMA的方式把网卡上收到的帧写到内存里，再向CPU发起一个中断，以通知CPU有数据到达

2. 当CPU收到中断请求后，会去调用网络驱动注册的中断处理函数。网卡的中断处理函数并不做过多工作，发出软中断请求，然后尽快释放CPU

3. `ksoftirqd` 检测到有软中断请求到达，调用 `poll` 开始轮询收包，收到后交由各级协议栈处理。对于UDP包来说，会通过 `udp_rcv()` 放到用户 socket 的接收队列中

::: details 为什么网络数据帧要存储在 Ring Buffer 里？
1. 环形缓冲区头尾相接，允许数据不断地写入和读取，不需要移动数据或调整内存结构
2. 不存在缓冲区满和溢出的风险
3. 特有的环形数据结构可以让读写按顺序进行，避免了复杂的锁机制
4. 环形缓冲区内存在逻辑上连续，适合连续读写的DMA操作
:::

## Netfilter简介

::: info
Netfilter 是 Linux 内核中的框架，用于处理数据包的过滤、修改、转发和网络地址转换（NAT），支持防火墙、NAT 和连接跟踪等网络功能
:::

1. 早期的Linux使用`ipfwadm`和`ipchains`工具来实现有限的包过滤，但是随着网络的发展以及IPV6的出现，`ipfwadm`和`ipchains`已经无法满足日益增长的需求。

2. 于是在1998年，Rusty Russell 发起 Netfilter 项目用于替代

3. 在2000年，Linux 2.4 内核版本中正式引入了 Netfilter 显著增强了网络包处理的能力

4. 在2003年的 Linux 2.6 内核版本中 Netfilter 集成了更强大的功能：连接跟踪（Connection Tracking）和状态检测（Stateful Inspection），使得 Linux 能够跟踪网络连接的状态（新建、已建立、相关等），大大增强了对复杂流量的管理能力

## Netfilter hooks

![](https://image-host.pages.dev/learn/2024_10_15_202410151438738.png)

由图所示在数据包的处理过程中，Netfilter 设置了五个 hook 点：

1. `NF_INET_PRE_ROUTING`: 这个 hook 在 IPv4 协议栈的 `ip_rcv()` 函数或 IPv6 协议栈的 `ipv6_rcv()` 函数中执行。是所有接收数据包到达的第一个 hook 触发点
2. `NF_INET_LOCAL_IN`: 这个 hook 在 IPv4 协议栈的 `ip_local_deliver()` 函数或 IPv6 协议栈的 `ip6_input()` 函数中执行。经过路由判断后，所有目标地址是本机的接收数据包到达此 hook 触发点。
3. `NF_INET_FORWARD`: 这个 hook 在 IPv4 协议栈的 `ip_forward()` 函数或 IPv6 协议栈的 `ip6_forward()` 函数中执行。经过路由判断后，所有目标地址不是本机的接收数据包到达此 hook 触发点。
4. `NF_INET_LOCAL_OUT`: 这个 hook 在 IPv4 协议栈的 `__ip_local_out()` 函数或 IPv6 协议栈的 `__ip6_local_out()` 函数中执行。所有本机产生的准备发出的数据包，在进入网络栈后首先到达此 hook 触发点。
5. `NF_INET_POST_ROUTING`: 这个 hook 在 IPv4 协议栈的 `ip_output()` 函数或 IPv6 协议栈的 `ip6_finish_output2()` 函数中执行。本机产生的准备发出的数据包或者转发的数据包，在经过路由判断之后， 将到达此 hook 触发点。

## NF_HOOK 宏和 netfilter 向量

所有的触发点位置统一调用 `NF_HOOK` 宏来触发 hook：

```c
static inline int NF_HOOK(uint8_t pf, unsigned int hook, struct sk_buff *skb, struct net_device *in, struct net_device *out, int (*okfn)(struct sk_buff *)) { return NF_HOOK_THRESH(pf, hook, skb, in, out, okfn, INT_MIN); }
```

`NF_HOOK` 接收六个参数：

* `pf`: 数据包的协议族，对 IPv4 来说是 `NFPROTO_IPV4`
* `hook`: 上图中所示的 netfilter hook 枚举对象，如 `NF_INET_PRE_ROUTING` 或 `NF_INET_LOCAL_OUT`
* `skb`: SKB 对象，表示正在被处理的数据包
* `in`: 数据包的输入网络设备
* `out`: 数据包的输出网络设备
* `okfn`: 一个指向函数的指针，该函数将在该 hook 即将终止时调用，通常传入数据包处理路径上的下一个处理函数

`NF_HOOK` 的返回值是以下具有特定含义的 netfilter 向量：

> 宏定义在 `include/linux/netfilter.h`

* `NF_ACCEPT`: 在处理路径上正常继续（实际上是在 NF-HOOK中最后执行传入的 okfn）。
* `NF_DROP`: 丢弃数据包，终止处理
* `NF_STOLEN`: 数据包已转交，终止处理
* `NF_QUEUE`: 将数据包入队后供其他处理
* `NF_REPEAT`: 重新调用当前 hook

## 回调函数和优先级

Netfilter 的另一个组成部分是 hook 回调函数，内核网络栈既使用 hook 来代表特定触发位置，也使用 hook （的整数值）作为数据索引来访问触发点对应的回调函数

同一个 hook 可以注册多个回调函数，注册 hook 的回调函数时，首先需要定义一个 nf_hook_ops 结构（或由多个该结构组成的数组）

```c
struct nf_hook_ops {
	struct list_head list;  /* User fills in from here down. */
	nf_hookfn *hook;
	struct module *owner;
	u_int8_t pf;
	unsigned int hooknum; /* Hooks are ordered in ascending priority. */
	int priority;
};
```

* `hook`: 将要注册的回调函数，函数参数定义与 `NF_HOOK` 类似，可通过 okfn参数嵌套其他函数。
* `hooknum`: 注册的目标 hook 枚举值。
* `priority`: 回调函数的优先级，较小的值优先执行

定义结构体后可通过 `int nf_register_hook(struct nf_hook_ops *reg)` 或 `int nf_register_hooks(struct nf_hook_ops *reg, unsigned int n);` 分别注册一个或多个回调函数。同一 netfilter hook 下所有的 `nf_hook_ops` 注册后以 `priority` 为顺序组成一个链表结构，注册过程会根据 `priority` 从链表中找到合适的位置，然后执行链表插入操作

在执行 `NF_HOOK` 宏触发指定位置的 hook 时，将调用 `nf_iterate` 函数迭代这个 hook 对应的 `nf_hook_ops` 链表，并依次调用每一个 `nf_hook_ops` 的注册函数成员 `hookfn`

![](https://image-host.pages.dev/learn/2024_10_15_v2-7ac4cd4553b9c40ee81c23da7010f426_r.jpg)

这种链式调用回调函数的工作方式，也让 netfilter hook 被称为链，如果 `nf_hook_ops` 的回调函数返回 `NF_ACCEPT，则nf_iterate` 将会继续调用下一个 `nf_hook_ops` 的回调函数，如果返回 `NF_DROP`，则中断遍历

## iptables功能配置

::: details NAT是在哪条链路上实现的（SNAT/DNAT）？
主要在PREROUTING和POSTROUTING链上实现：

	* DNAT（目标地址转换）：通常在PREROUTING链上进行。它在数据包到达目标之前修改目标地址，适用于入站流量

	* SNAT（源地址转换）：通常在POSTROUTING链上进行。它在数据包离开路由器之前修改源地址，适用于出站流量
:::

::: details MAC过滤是在哪条链路上实现的？
通过配置`mangle`表的`FORWARD`链

配置在gateway/rootfs/usr/bin/mac_filter脚本文件中

![](https://image-host.pages.dev/learn/2024_10_26_202410261720242.png)

定义`FORWARD`链路`-j`跳到自定义链路`service_blacklist_forword`链路上再跳转到`HI_LANHOST_MACFILTER_FORWARD`链路上，丢弃目标地址为设定MAC的数据包
:::

::: details 域名过滤（IP过滤）在哪里实现，怎么实现的？
在 `mangle` 表的 `FORWARD` 链和`INPUT`链上定义规则

配置在gateway/cml/odl/source/igdCmWanModulePub.c

使用`-m DOMAIN`: 使用DOMAIN扩展，允许基于域名进行匹配

![](https://image-host.pages.dev/learn/2024_10_26_202410261741491.png)

![](https://image-host.pages.dev/learn/2024_10_26_202410261725276.png)

使用STRING匹配包含指定字符串的域名，在`INPUT`链上丢弃包含指定字符串的DNS请求，以及定义`FORWARD`链规则，丢弃包含指定字符串的数据包
:::

::: details 端口转发怎么实现的？
通过 `DNAT` 来实现，在 `PREROUTING` 链上对目的地址和端口进行修改，将外部访问的流量转发到内部网络的特定服务器或端口上

将所有发送到任何地址的TCP流量，并且目标端口之间的流量，转换为发送到内部IP上的指定端口

![](https://image-host.pages.dev/learn/2024_10_26_202410261808874.png)

并在`filter`表的`FORWARD`链上对添加目的地址为设定内部IP和端口的数据包进行接受
:::

::: details 访客网络规则应该添加到哪里？
应该添加到 `filter` 表的 `INPUT` 链，禁止访问设备web和ICMP

配置在/home/wangyining/work/HiSmartHub/gateway/cml/odl/source/igdCmWlanModulePub.c

`INPUT`链新增跳转链路`vap2_wlan_input_filter`处理访客WLAN数据包

![](https://image-host.pages.dev/learn/2024_10_26_202410261757713.png)

在链路`vap2_wlan_input_filter`中定义规则，阻止所有通过vap2设备进入的TCP和ICMP流量

![](https://image-host.pages.dev/learn/2024_10_26_202410261804828.png)
:::

::: details iptables在路由器上怎么查，规则定义在哪里？
`iptables --table <tablename> --list`
:::