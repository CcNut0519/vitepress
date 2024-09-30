# C语言

## 进程

### 进程管理

**子进程创建：**

```c
#include <sys/types.h>
#include <unistd.h>

/**
  * @brief  创建子进程
  * @param  void
  * @retval 失败返回-1。成功返回两次，父进程返回子进程id，子进程返回0
  */
pid_t fork(void);

/**
  * @brief  获得当前进程id
  * @param  无
  * @retval 当前进程id
  */
pid_t getpid(void);

/**
  * @brief  获得当前进程的父进程id
  * @param  无
  * @retval 当前进程的父进程id
  */
pid_t getppid(void);
```

**查看进程状态：**

```bash
ps			# 显示当前进程的状态
-aux		# 显示包含其他使用者的进程
-ajx		# 显示有ppid，可以进行追溯
```

**给进程发送信号：**

```bash
kill		# 给进程发送信号
kill -9 pid # 彻底杀死pid号进程
pkill name	# 杀死所有name进程
```

**fork出来的子进程和父进程的异同点：**
* 相同：全局变量、代码段、数据的、栈、堆、环境变量、用户id、宿主目录、进程工作目录、信号处理方式…
* 不同：进程id，fork返回值、父进程id、进程运行时间、闹钟（定时器）、未决信号集

::: tip *父子进程遵循读时共享，写时复制的原则*
fork时子进程获得父进程用户空间的拷贝，所以变量地址（虚拟地址）一致。但linux采用写时复制，fork后两个虚拟地址指向相同的物理地址，当任何一个进程试图修改该虚拟地址的内容时，这两个虚拟地址才指向不同的物理空间

fork子进程完全复制父进程的栈空间，也复制了页表，但没有复制物理页面，所以这时虚拟地址相同，物理地址也相同，但是会把父子共享的页面标记为“只读”（类似mmap的private的方式），如果父子进程一直对这个页面是同一个页面，直到其中任何一个进程要对共享的页面“写操作”，这时内核会复制一个物理页面给这个进程使用，同时修改页表。而把原来的只读页面标记为“可写”，留给另外一个进程使用
:::

**孤儿进程&僵尸进程：**

::: info
孤儿进程：父进程死了，子进程被init进程领养

僵尸进程：子进程死了，父进程没有回收子进程的PCB
:::

```c
// 孤儿进程
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if(pid == 0) {
        printf("I am child, ppid = %d\n", getppid());
        sleep(2);
        printf("I am child, ppid = %d\n", getppid());
		while(1);
    }
    else if(pid > 0) {
        sleep(1);
        printf("parent killed\n");
    }
    return 0;
}
```

孤儿进程中父进程死了，子进程被 `init` 进程领养，如果子进程内存在死循环使用 `Ctrl+C` 无法结束，因为子进程此时属于 `init` 进程，必须使用 `kill` 命令杀死

```c
// 僵尸进程
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    if(pid == 0) {
        printf("I am child, pid = %d, ppid = %d\n", getpid(), getppid());
        sleep(1);
        printf("child killed\n");
    }
    else if(pid > 0) {
        while(1) {
            printf("I am parent, pid = %d\n", getpid());
            sleep(20);
        }
    }
    return 0;

	/*
	wangyin+   55672  0.0  0.0   2680  1536 pts/6    S+   09:25   0:00 ./c_process 3
	wangyin+   55673  0.0  0.0      0     0 pts/6    Z+   09:25   0:00 [c_process] <defunct>	表示是僵尸进程
	wangyin+   55706  0.0  0.0   9476  2304 pts/7    S+   09:25   0:00 grep --color=auto c_process
	*/
}
```

僵尸进程使用kill -9无法直接杀死，需杀死其父进程使其被init领养后回收

**wait函数：**

::: info
进程一旦调用了 `wait` ，就会立刻阻塞自己，由 `wait` 分析当前进程中的某个子进程是否已经退出了，如果让它找到这样一个已经变成僵尸进程的子进程， `wait` 会收集这个子进程的信息，并将它彻底销毁后返回；如果没有找到这样一个子进程， `wait` 会一直阻塞直到有一个出现
:::

```c
#include <sys/types.h>
#include <sys/wait.h>

/* wstatus
WIFEXITED(wstatus)：正常死亡
WEXITSTATUS(wstatus)：正常死亡的情况下，获得退出状态，即return返回值，或exit返回值
WIFSIGNALED(wstatus)：非正常死亡
WTERMSIG(wstatus)：得到死亡原因，即kill -option 的option
*/
pid_t wait(int *wstatus);	// 传入参数wstatus用于收集子进程退出时的状态，返回值是子进程的id
pid_t waitpid(pid_t pid, int *wstatus, int options);	// 与wait功能类似，但可以指定子进程id以及提供了更多的选项
```

**exec函数族：**

* `execl`：其函数原型为 `int execl(const char *path, const char *arg0,..., (char *)0);`它接受一个文件路径和一系列以 `NULL` 结尾的参数，用于指定要执行的程序和传递给新程序的命令行参数

* `execlp`：`int execlp(const char *file, const char *arg0,..., (char *)0);`与 `execl` 类似，但它会在环境变量 `PATH` 中搜索可执行文件

* `execle`：`int execle(const char *path, const char *arg0,..., (char *)0, char *const envp[]);`除了指定程序路径和参数外，还可以传递一个环境变量数组

* `execv`：`int execv(const char *path, char *const argv[]);`接受一个文件路径和一个字符指针数组，数组中的每个元素对应一个命令行参数

* `execvp`：`int execvp(const char *file, char *const argv[]);`类似于 `execv`，但会在环境变量 `PATH` 中搜索可执行文件

* `execvpe`：`int execvpe(const char *file, char *const argv[], char *const envp[]);`结合了 `execvp` 和 `execle` 的功能，可以同时指定环境变量

### IPC（进程间通信）

::: info IPC通信的方式：

* [pipe（匿名管道）](#pipe（匿名管道）)
* [FIFO（有名管道）](FIFO（有名管道）)
* [消息队列](#消息队列)
* [共享内存](#共享内存)
* [mmap（内存映射I/O）](#mmap（内存映射I/O）)
* [本地套接字](#本地套接字)
* [信号](#信号)
:::

#### pipe（匿名管道）

::: info
pipe是内核在内存中开辟的一个缓冲区，这个缓冲区与管道文件相关联，对管道文件的操作被内核转换成对这个缓冲区的操作，因为是匿名的，所以只能针对*有血缘关系的进程间通信*
:::

管道为**半双工通信**，所以为了协调双方的通信，需要以下三个机制：

* 互斥：当一个进程正在对pipe进行读/写操作时，另一个进程必须等待
* 同步：当写进程写完成便睡眠等待，直到读进程读完成，操作系统检测到pipe为空再将它唤醒；同样当读进程读到空pipe时也睡眠等待，直到写进程将数据写入管道，操作系统检测到pipe非空则将其唤醒
* 只有确定对方存在时才能进行通信

使用 `ulimit -a` 查看当前用户的各种资源限制

```c
#include <unistd.h>

/**
  * @brief  创建管道
  * @param  pipefd，其中pipefd[0]是读，pipefd[1]是写
  * @retval 失败返回-1。成功返回0
  */
int pipe(int pipefd[2]);
```

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    int fd[2];
    pipe(fd);
    pid_t pid = fork();
    if(pid == 0) {
        char buf[256];
        // 读，阻塞
        read(fd[0], buf, sizeof(buf));
        printf("read: %s\n", buf);
    }
    else if(pid > 0){
        sleep(1);
        char buf[256] = "hello world";
        printf("write: %s\n", buf);
        // 写
        write(fd[1], buf, sizeof(buf));
    }
    return 0;
}
```

::: warning 注意
父子进程之间的文件描述符不共享，需要在 `fork` 之前创建管道
:::

```c
#include <stdio.h>
#include <unistd.h>

int main(void) {
    int fd[2];
    pipe(fd);
    pid_t pid = fork();
    if(pid == 0) {
        // 关闭读端
        close(fd[0]);
        // 将标准输出重定向到写端
        dup2(fd[1], STDOUT_FILENO);
        execlp("ps", "ps", "-aux", NULL);
    }
    else if(pid > 0){
        // 关闭写端
        close(fd[1]);
        // 将标准输入重定向到读端
        dup2(fd[0], STDIN_FILENO);
        execlp("grep", "grep", "bash", NULL);
    }
    return 0;
}
```

使用 `dup2` 重定向I/O，分别将 `ps -aux` 的输出重定向到写端，将标准输入重定向到读端，子进程输入的 `ps -aux` 结果会被父进程的 `grep` 命令过滤

#### FIFO（有名管道）

::: info
匿名管道只能针对有血缘关系的进程之间的通信，为了解决这个问题，引入了命名的管道FIFO（因为数据是先进先出的），提供一个路径名与之关联，即使进程之间没有血缘关系，访问该路径就能通过这个有名管道相互通信
:::

shell命令 `mkfifo` 创建有名管道

```bash
mkfifo myfifo	# 创建名为myfifo的管道
```

```c
// 写进程
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int main(void) {
    printf("begin open---\n");
    int fd = open("myfifo", O_WRONLY);
    printf("end open---\n");
    write(fd, "hello\nhello1\n", 14);
    return 0;
}
```

```c
// 读进程
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void) {
    printf("begin open---\n");
    int fd = open("myfifo", O_RDONLY);
    printf("end open---\n");
    char buf[12]={0};
    int i = 0;
    while(1){
        memset(buf, 0x00, sizeof(buf));
        int ret = read(fd, buf, sizeof(buf));
        if (ret == 0) break;
        printf("%s", buf);
    }
    
    return 0;
}
```

#### 消息队列

#### 共享内存

#### mmap（内存映射I/O）

::: info
使一个磁盘文件和存储空间中的一个缓冲区相互映射。于是对缓冲区的操作就相当于对文件进行的操作，这样就可以在不使用 `read` 和 `write` 系统调用的情况下，直接使用指针完成I/O。
:::

```c
#include <sys/mman.h>

/**
  * @brief  创建映射区
  * @param  addr    指定映射的虚拟内存地址，一般传NULL，由内核自动选择合适的虚拟内存地址
  * @param	length	映射区长度
  * @param	prot	映射内存的保护模式，可选值如下
  					- PROT_EXEC		可被访问
  					- PROT_READ		可读
  					- PROT_WRITE 	可写
  					- PROT_NONE		不可访问
  * @param	flags	指定映射的类型，常用可选值如下
  					- MAP_SHARED	与其他所有映射到该文件的进程共享映射空间（用于IPC），写时立刻修改源文件
  					- MAP_PRIVATE	建立一个写时复制的私有映射空间，写时不修改源文件
  					- MAP_ANON		映射不需要依赖某个文件，忽略fd参数，fd参数必须为-1，且offset应为0，也可写为
  									MAP_ANONYMOUS
  * @param	fd		文件描述符
  * @param	offset	文件偏移量（从文件的何处开始映射）
  * @retval 成功返回可用的内存地址，失败返回MAP_FAILED
  */
void *mmap(void *addr, size_t length, int prot, int flags,
                  int fd, off_t offset);

/**
  * @brief  释放映射区
  * @param  addr    映射的虚拟内存地址，mmap的返回值
  * @param	length	创建的映射区长度
  * @retval 成功返回0，失败返回-1
  */
int munmap(void *addr, size_t length);
```

```c
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <fcntl.h>

int main(void) {
    int fd = open("mem.txt", O_RDWR | O_CREAT, 0666);
    int mmap_size = 128;
    // 获取文件状态，判断文件大小是否大于mmap需要的大小
    struct stat sb;
    fstat(fd, &sb);
    int file_size = sb.st_size;
    if(file_size < mmap_size){
        printf("文件大小小于映射区需要大小，扩展文件\n");
        // 扩展文件
        ftruncate(fd, mmap_size);
    }
    // 获取mmap映射地址，flags改为MAP_PRIVATE不会改变源文件
    char *mem = (char *)mmap(NULL, mmap_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if(mem == MAP_FAILED){
        perror("mmap err");
        return -1;
    }
    strcpy(mem, "hello\nworld\n");
    // 释放mmap
    munmap(mem, mmap_size);
    close(fd);
    return 0;
}
```

mmap实现父子进程通信：

```c
#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <fcntl.h>

int main(void) {
    // 将文件大小置为0，然后扩展文件到指定映射区大小
    int fd = open("mem.txt", O_RDWR | O_CREAT | O_TRUNC, 0666);
    int mmap_size = 128;
    ftruncate(fd, mmap_size);
    // 获取mmap映射地址
    int *mem = mmap(NULL, mmap_size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    if(mem == MAP_FAILED){
        perror("mmap err");
        return -1;
    }
    
    // 创建子进程
    pid_t pid = fork();
    if(pid == 0){
        // child
        mem[0] = 100;
        printf("child, mem[0] = %d\n", mem[0]);
        sleep(3);
        printf("child, mem[0] = %d\n", mem[0]);
    }
    else if(pid > 0){
        // parent
        sleep(1);
        printf("parent, mem[0] = %d\n", mem[0]);
        mem[0] = 1001;
        printf("parent, mem[0] = %d\n", mem[0]);
        wait(NULL);
    }

    // 释放mmap
    munmap(mem, mmap_size);
    close(fd);
    return 0;
}
```

::: warning 常见问题
1. 修改了`mem`变量的地址（如：`mem++`），使用`munmap`释放映射区会报错，*`Invalid argument`*

2. 对`mem`进行越界操作，即写入的字符大于`mmap`映射区的长度时，只截取文件大小的字符。如果文件大小为`0`，则报错。所以最好`mmap`映射区小于文件大小，且写入的字符也小于`mmap`映射区

3. `mmap`时`offset`不能随便填一个数，否则创建映射区失败。`offset`必须是4K的整数倍，最小IO块为4K

4. 如果文件描述符先关闭，对`mmap`映射没有影响。映射完之后文件就没有用处了

5. `open`的时候可以新建一个文件吗？可以，但需要对文件大小进行扩展

6. `open`的时候不可以选择`WR_ONLY`，`mmap`过程中会 *`Permission denied`*。因为`mmap`映射过程中需要读操作。同理，当`mmap`中`flags`选择`MAP_SHARED`，且`prot`选择`PROT_WRITE`时，也没有权限。所以open的时候文件权限要大于mmap时的权限
:::

**匿名映射：**

::: info
每次创建映射区的时候总得依赖某个文件，有没有一种方法可以不依赖文件，而是在内存中创建映射区呢？答案是有的，就是匿名映射。
:::

将文件操作符参数设置为 `-1` 即可

```c
int *mem = mmap(NULL, mmap_size, PROT_READ | PROT_WRITE, MAP_SHARED | MAP_ANONYMOUS, -1, 0);
```

#### 本地套接字

#### 信号

::: info
信号可以看作是一个软件中断，可以使用 `kill -l` 命令查看信号的种类
:::

**信号的产生：**

* 按键触发：中断`Ctrl+C`、暂停`Ctrl+Z`、`Ctrl+\`
* 系统调用函数：`kill`、`killpg`、`abort`、`raise`
* 定时器：`alarm`、`setitimer`
* 硬件中断：段异常、浮点型错误等等

**信号的状态：**

* 产生
* 递达：信号到达且被处理完
* 未决：信号被阻塞

**信号的默认处理方式：**

* 忽略
* 执行默认动作
* 捕获（调用用户函数），其中`9（SIGKILL）`，`19（SIGSTOP）`信号不能捕获、不能忽略，也不能阻塞

**信号的四要素：**

* 编号
* 事件
* 名称
* 默认处理动作：忽略、终止、终止且产生core、暂停、继续

**阻塞信号集(信号屏蔽字)**：将某些信号加入集合，对他们设置屏蔽，当屏蔽x信号后，再收到该信号，该信号的处理将推后(解除屏蔽后)

**未决信号集：**

1. 信号产生，未决信号集中描述该信号的位立刻置1，表示信号处于未决状态，当信号处理后置0
2. 信号产生后由于某些原因（主要是阻塞）不能抵达。这类信号的集合称之为未决信号集。在屏蔽解除前，信号一直处于未决状态

**信号捕捉：**

1. 进程正常运行时，默认PCB存在一个信号屏蔽字，假设为A，它决定了进程自动屏蔽哪些信号。当注册了某个信号捕捉函数，捕捉到该信号后，要调用该函数。而该函数执行时间可能很长，这期间所屏蔽的信号不由A决定，而是sa_mask所指定。该函数执行完后，再恢复为A
2. xxx信号捕捉函数执行期间，xxx信号被自动屏蔽
3. 阻塞的常规信号不支持排队，产生多次信号也只记录一次（后32个实时信号支持排队）

*Linux信号一览表：*

|信号编号|信号名称|含义|
|----|----|----|
|1|SIGHUP|终端挂起或者控制进程终止|
|2|SIGINT|中断信号，通常由用户按下Ctrl+C产生|
|3|SIGQUIT|退出信号，通常由用户按下Ctrl+\产生|
|4|SIGILL|非法指令信号|
|5|SIGTRAP|跟踪/断点陷阱信号|
|6|SIGABRT|异常终止信号，通常由调用abort函数产生|
|7|SIGBUS|总线错误信号|
|8|SIGFPE|浮点异常信号|
|9|SIGKILL|强制终止信号，无法被捕获或忽略|
|10|SIGUSR1|用户定义的信号1|
|11|SIGSEGV|段错误信号|
|12|SIGUSR2|用户定义的信号2|
|13|SIGPIPE|向没有读端的管道写入数据时产生的信号|
|14|SIGALRM|闹钟信号，由alarm或setitimer函数设置的定时器到期时产生|
|15|SIGTERM|终止信号，可以被进程捕获并处理，以实现优雅退出|
|16|SIGSTKFLT|协处理器栈错误信号|
|17|SIGCHLD|子进程状态改变信号|
|18|SIGCONT|使暂停的进程继续执行的信号|
|19|SIGSTOP|停止信号，无法被捕获或忽略|
|20|SIGTSTP|终端停止信号，通常由用户按下Ctrl+Z产生|
|21|SIGTTIN|后台进程从终端读取数据时收到的信号|
|22|SIGTTOU|后台进程向终端写入数据时收到的信号|
|23|SIGURG|紧急数据到达套接字时产生的信号|
|24|SIGXCPU|超过CPU时间限制信号|
|25|SIGXFSZ|超过文件大小限制信号|
|26|SIGVTALRM|虚拟定时器到期信号|
|27|SIGPROF|性能分析定时器到期信号|
|28|SIGWINCH|窗口大小改变信号|
|29|SIGIO|异步I/O信号|
|30|SIGPWR|电源故障信号|
|31|SIGSYS|系统调用错误信号|
|32-64|SIGRTMIN-SIGRTMAX|LINUX的实时信号，它们没有固定的含义（可以由用户自定义）。所有的实时信号的默认动作都为终止进程|

**系统调用函数产生信号：**

`kill` ：

```c
#include <sys/types.h>
#include <signal.h>

/**
  * @brief  给指定进程发送信号
  * @param  pid	信号发送的进程
  			pid > 0		pid指定的进程
  			pid = 0 	调用进程的进程组内的每个进程
  			pid = -1	调用进程有权限发送信号的每个进程，但不包括init进程（进程1）
  			pid < -1	进程组ID为-pid内的每个进程
  * @param  sig	发送的信号，可以用man 7 signal查看
  * @retval 失败返回-1。成功返回0
  */
int kill(pid_t pid, int sig);
```

`raise` ：

```c
#include <signal.h>

/**
  * @brief  给调用进程或线程发送信号，等同于 kill(getpid(), sig) 或 pthread_kill(pthread_self(), sig)
  * @param  sig	发送的信号，可以用man 7 signal查看
  * @retval 失败返非零值。成功返回0
  */
int raise(int sig);
```

**定时器产生信号：**

`alarm` ：

```c
#include <unistd.h>

/**
  * @brief  在 seconds 秒后将一个 SIGALRM(14) 信号发送给调用进程，设置一个定时器，且取消之前的定时器（一个进程只有一个定时器）
  * @param  seconds
  			seconds > 0	发送的时间
  			seconds = 0	取消先前设置的定时器
  * @retval 返回先前设定的定时器触发的剩余秒数，如果之前没有计划的定时器，则返回零。
  */
unsigned int alarm(unsigned int seconds);
```

`setitimer` ：

```c
#include <sys/time.h>

struct itimerval {
    struct timeval it_interval; /* 周期定时器的间隔。如果it_interval两个字段都为0，说明这是一个单次定时器（即它在到期时过期） */
    struct timeval it_value;    /* 距离下一次到期的时间。定时器到期后重置为it_interval。如果it_value两个字段都为0，说明定时器当前处于非活动状态 */
};

struct timeval {
    time_t      tv_sec;         /* 秒 */
    suseconds_t tv_usec;        /* 微秒 */
};

/**
  * @brief  获取指定的定时器的当前值，存放在curr_value中
  * @param  which	选择定时器类型，可选值如下：
  			ITIMER_REAL		真实时间作为倒计时，到期产生SIGALRM信号
  			ITIMER_VIRTUAL	用户空间下进程消耗的CPU时间作为倒计时，到期产生SIGVTALRM信号
  			ITIMER_PROF		进程消耗的总CPU时间（用户和内核）作为倒计时，到期产生SIGPROF信号
  * @retval 成功返回0，失败返回-1且设置errno
  */
int getitimer(int which, struct itimerval *curr_value);

/**
  * @brief  设置定时器
  * @param  which		选择定时器类型，可选值如下：
  			ITIMER_REAL		真实时间作为倒计时，到期产生SIGALRM(14)信号
  			ITIMER_VIRTUAL	用户空间下进程消耗的CPU时间作为倒计时，到期产生SIGVTALRM(26)信号
  			ITIMER_PROF		进程消耗的总CPU时间（用户和系统）作为倒计时，到期产生SIGPROF(27)信号
  *	@param  new_value	设置定时器的新值，可以启动或解除which指定的定时器，参考itimerval
  * @param  old_value	非空获取定时器的旧值，即与getitimer相同。一般设置为NULL
  * @retval 成功返回0，失败返回-1且设置errno
  */
int setitimer(int which, const struct itimerval *new_value,
              struct itimerval *old_value);
```

**信号集处理函数：**

```c
#include <signal.h>

/**
  * @brief  将给定的信号集set初始化为空，将所有信号从集合中排除
  *	@param  set 信号集，sigset_t 类型的对象在传递给 sigaddset()、sigdelset() 和 sigismember() 函数或其他一些额外的函数之前，必须通过调用 sigemptyset() 或 sigfillset() 进行初始化。如果没有进行初始化，则行为是未定义的
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigemptyset(sigset_t *set);

/**
  * @brief  将set初始化为全集，包括所有信号
  *	@param  set 信号集
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigfillset(sigset_t *set);

/**
  * @brief  向set中添加信号signum
  *	@param  set 	信号集
  * @param	signum	信号
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigaddset(sigset_t *set, int signum);

/**
  * @brief  向set中删除信号signum
  *	@param  set 	信号集
  * @param	signum	信号
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigdelset(sigset_t *set, int signum);

/**
  * @brief  检查signum是否是set的成员
  *	@param  set 	信号集
  * @param	signum	信号
  * @retval 如果signum是set的成员，则返回1，如果signum不是成员，则返回0，出错时返回-1，设置errno
  */
int sigismember(const sigset_t *set, int signum);

/**
  * @brief  设置阻塞或者解除阻塞信号集
  *	@param  how 	信号集，可选值如下
  			SIG_BLOCK	设置set阻塞
  			SIG_UNBLOCK	解除set阻塞
  			SIG_SETMASK	设置set为新的阻塞信号集
  *	@param  set		信号集
  * @param	oldset	旧的信号集，可以用来恢复原来状态
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigprocmask(int how, const sigset_t *set, sigset_t *oldset);

/**
  * @brief  获取未决信号集
  *	@param  set	当前的未决信号集
  * @retval 成功时返回0，失败时返回-1，且设置errno
  */
int sigpending(sigset_t *set);
```

**捕获信号函数：**

```c
#include <signal.h>

// 这行代码是一个类型定义（typedef），它定义了一个名为 sighandler_t 的新类型，该类型是一个指向接受一个整数参数并返回 void 类型的函数指针。
typedef void (*sighandler_t)(int);

/**
  * @brief  将信号 signum 的处理方式设置为 handler
  *	@param  signum	信号
  * @param  handler	信号处理方式，可选值如下
  			SIG_IGN			忽略信号
  			SIG_DFL			执行与信号相关的默认操作
  			用户函数地址		执行用户函数
  * @retval 返回信号处理程序的先前值，或者在出错时返回SIG_ERR，且设置errno
  */
sighandler_t signal(int signum, sighandler_t handler);

struct sigaction {
    void     (*sa_handler)(int);	// 捕捉信号后执行的程序
    void     (*sa_sigaction)(int, siginfo_t *, void *);	// 捕捉信号后执行的程序，携带附加信息siginfo_t
    sigset_t   sa_mask;				// 执行捕捉函数期间，临时屏蔽的信号集
    int        sa_flags;			// 一般置0，使用sa_handler，置SA_SIGINFO时使用sa_sigaction
    void     (*sa_restorer)(void);	// 无效参数
};

/**
  * @brief  用于更改进程在接收到特定信号时所采取的操作
  *	@param  signum	信号
  * @param  act		从act安装信号signum的新操作。
  * @param  oldact	如果oldact非空，则将之前的操作保存在oldact
  * @retval 成功返回0，失败返回-1，设置errno
  */
int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
```

## 标准库

`ctype.h` 用于测试字符类型以及字符大小写转换

![](https://image-host.pages.dev/learn/2024_09_20_202409201146440.png)

`assert.h` 帮助前期开发调试

![](https://image-host.pages.dev/learn/2024_09_20_202409201147121.png)
