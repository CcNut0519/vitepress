# shell 编程

## 编写&运行

```bash
$ touch hello.sh	# 新建一个shell脚本文件
```

编写hello.sh脚本文件：

```bash
#!/bin/bash	# 指定shell解释器为bash

echo "Hello, World!"
```

```bash
$ chmod +x hello.sh	# 给hello.sh脚本文件添加执行权限
$ ./hello.sh	# 运行hello.sh脚本文件
```

## 注释

```bash
# 单行注释

:<<EOF	# 多行注释
This is a multi-line comment
EOF
```

## 变量

定义变量：

```bash
name="John"
```

::: warning 注意
与常规的编程语言不同，shell脚本等号左右两边绝对不能有空格
:::

```bash
name="John"
readonly name	# 定义只读变量
unset name	# 删除变量
```

### 数组

```bash
array=(1 2 3 4 5)	#普通数组

echo "数组元素个数为：${#array[*]}"	# #号获取数组元素个数

declare -A associative_array	# declare -A 创建关联数组
associative_array[name]="John"
associative_array[age]=25

echo "数组的键为：${!associative_array[*]}"	# ！号获取关联数组的键
```

### 字符串

```bash
string='Hello, World!'	# 单引号包裹的字符串都会原样输出，变量在里面需要使用单引号包裹才有效
string="Hello, World! $name"	# 双引号包裹的字符串可以直接引用变量
```

获取字符串长度：

```bash
length=${#string}
```

## 传递参数

```bash
echo "Shell 传递参数实例！";
echo "执行的文件名：$0";
echo "第一个参数为：$1";
echo "第二个参数为：$2";
echo "第三个参数为：$3";
echo "参数个数为：$#";
```

```bash
./test.sh 1 2 3
第一个参数为：1
第二个参数为：2
第三个参数为：3
参数个数为：3
```

## 表达式计算

```bash
num1=10
num2=5

result=$((num1 + num2))	#((运算表达式))
result='expr $num1 + $num2'	#expr命令计算表达式
```

## 文件测试

文件测试运算符：

|操作符|描述|
|----|----|
|-b file|如果文件名file存在且是一个块设备文件，则为真|
|-c file|如果文件名file存在且是一个字符设备文件，则为真|
|-d file|如果文件名file存在且是一个目录，则为真|
|-f file|如果文件名file存在且是一个普通文件（既不是目录，也不是设备文件），则为真|
|-g file|如果文件名file存在且设置了SGID位，则为真|
|-k file|如果文件名file存在且设置了粘制位，则为真|
|-p file|如果文件名file存在且是一个命名管道，则为真|
|-u file|如果文件名file存在且设置了SUID位，则为真|
|-r file|如果文件名file存在且可读，则为真|
|-w file|如果文件名file存在且可写，则为真|
|-x file|如果文件名file存在且可执行，则为真|
|-s file|如果文件名file存在且不为空，则为真|
|-e file|如果文件名file存在，则为真|

例子：
```bash
file="/home/wangyining/shell/test.sh"

if [ -x $file ]
then
	echo "$file 可执行"
else
	echo "$file 不可执行"
fi
```

## I/O

```bash
read str	# 读取用户输入
echo "你输入的内容为：$str"	# 输出用户输入的内容
echo `ll`	# 反引号显示命令输出
printf "%s %s %s\n" a b c d e f g h i j	# printf命令也可以输出
```

### 输出重定向

使用`>`将输出覆盖到文件，使用`>>`将输出追加到文件：

```bash
who > users.txt	# 将当前登录用户信息输出到users.txt文件
```

```bash
$ cat users.txt
linwenxin pts/3        2024-09-27 18:29 (192.168.101.192)
yumeiyong pts/4        2024-09-28 16:33 (192.168.101.94)
jiangshengchen pts/6        2024-09-26 13:34 (192.168.101.137)
...
```

::: tip
`2>`、`2>>`表示标准错误文件重定向
:::

::: tip
如果不希望显示输出结果，可以使用`command >/dev/null`将输出重定向到黑洞，`/dev/null` 是一个特殊的文件，写入到它的内容都会被丢弃
:::

### 输入重定向

```bash
wc -l < users.txt	# 统计users.txt文件行数
```

如果希望输入和输出重定向同时使用：

```bash
command <file1 >file2	# 输入重定向到file1，输出重定向到file2
```

### Here Document

shell支持使用Here Document来输入多行内容，语法为：

```bash
wc -l << EOF
aaaaaa
aaaaaa
aaaaaa
EOF
```

## test命令

例子：

```bash
result=$[a+b]
echo "result 为： $result"

if test $result -eq 11	# 多个条件可以用-a（与）、-o（或）、!（非）连接
then
	echo "a等于b"
fi
```

::: tip
- `[]`符号一般用于简单的算术运算，作为条件判断或者test，使用参数而不是运算符
- `(())`符号可以使用C风格的运算表达式，适合更为复杂的计算
:::

## 循环

### for

```bash
for loop in 1 2 3 4 5
do
    echo "The value is: $loop"
done

for (( ; ; ))	# 无限循环
```

### while

```bash
int=1
while(( $int<=5 ))
do
    echo $int
    let "int++"
done

while :	# 无限循环1
do
	command
done

while true	# 无限循环2
do
	command
done
```

::: details until循环
until与while正好相反，条件为真时退出循环，大部分情况下while循环优于until循环
:::

### break、continue

shell中同样也提供了`break`来结束循环，`continue`来跳过当前循环，继续下一次循环

## case ... esac

case 工作方式如下所示，取值后面必须为单词 `in`，每一模式必须以右括号结束。取值可以为变量或常数，匹配发现取值符合某一模式后，其间所有命令开始执行直至 `;;`

取值将检测匹配的每一个模式。一旦模式匹配，则执行完匹配模式相应命令后不再继续其他模式。如果无一匹配模式，使用星号 `*` 捕获该值，再执行后面的命令

```bash
echo '输入 1 到 4 之间的数字:'
echo '你输入的数字为:'
read aNum
case $aNum in
    1)  echo '你选择了 1'
    ;;
    2)  echo '你选择了 2'
    ;;
    3)  echo '你选择了 3'
    ;;
    4)  echo '你选择了 4'
    ;;
    *)  echo '你没有输入 1 到 4 之间的数字'
    ;;
esac
```

## 函数

例子：

```bash
funWithReturn(){
    echo "这个函数会对输入的两个数字进行相加运算..."
    echo "输入第一个数字: "
    read aNum
    echo "输入第二个数字: "
    read anotherNum
    echo "两个数字分别为 $aNum 和 $anotherNum !"
    return $(($aNum+$anotherNum))
}
funWithReturn
echo "输入的两个数字之和为 $? !"	# $? 代表上一个命令的返回值
```

::: warning 注意
`return`语句只能返回`0-255`之间的整数，可以直接使用`echo`输出而不是返回值
:::

### 函数参数

在函数体内通过`$1`、`$2`、`$3`等来获取参数，`$#`获取参数个数：

```bash
funWithParam(){
    echo "第一个参数为：$1"
    echo "第二个参数为：$2"
    echo "第三个参数为：$3"
    echo "参数个数为：$#"
}
funWithParam 1 2 3
```

::: warning 注意
`$10`不能获取第十个参数，需要使用`${10}`来获取
:::

|参数处理|说明|
|----|----|
|$#|传递到脚本的参数个数|
|$*|以一个单字符串显示所有向脚本传递的参数|
|$$|脚本的进程ID号|
|$!|后台运行的最后一个进程的ID号|
|$-|显示脚本的当前选项，例如，`bash`启动时，它显示`-i`|
|$?|显示最后命令的退出状态。0表示没有错误，其他任何值表明有错误|

## 外部引用

和其它编程语言类似，shell脚本也可以包含外部脚本来方便封装

调用外部脚本：

```bash
. ./lib.sh	# 调用lib.sh脚本
```
