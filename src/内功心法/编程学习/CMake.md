# CMake

::: info CMake简介
CMake 本身不是构建工具，而是生成构建系统的工具，它生成的构建系统可以使用不同的编译器和工具链

* 跨平台支持： CMake 支持多种操作系统和编译器，使得同一份构建配置可以在不同的环境中使用
* 简化配置： 通过 CMakeLists.txt 文件，用户可以定义项目结构、依赖项、编译选项等，无需手动编写复杂的构建脚本
* 自动化构建： CMake 能够自动检测系统上的库和工具，减少手动配置的工作量
* 灵活性： 支持多种构建类型和配置（如 Debug、Release），并允许用户自定义构建选项和模块
:::

## 基本工作流程

1. 编写 CMakeLists.txt 文件： 定义项目的构建规则和依赖关系
2. 生成构建文件： 使用 CMake 生成适合当前平台的构建系统文件（例如 Makefile、Visual Studio 工程文件）
3. 执行构建： 使用生成的构建系统文件（如 make、ninja、msbuild）来编译项目

## 安装CMake

**windows系统：**

[下载安装程序](https://cmake.org/download/)

**Debian系Linux系统：**

使用包管理器安装：

```bash
sudo apt-get install cmake
```

## 编写CMakeLists.txt文件

* 指定最低CMake版本要求：
```cmake
cmake_minimum_required(VERSION 3.10)
```

* 定义项目名称和使用的编程语言：

```cmake
project(C_Project C)
```

* 指定要生成的可执行文件及其源文件：

```cmake
add_executable(C_Project main.c other_file.c)
```

* 创建一个库（静态or动态）并指定其源文件：

```cmake
add_library(my_lib STATIC my_lib.c)
```

* 链接目标文件和其它库：

```cmake
target_link_libraries(C_Project my_lib)
```

* 添加头文件搜索路径：

```cmake
include_directories(${PROJECT_SOURCE_DIR}/include)
```

* 设置变量的值：

```cmake
set(CMAKE_C_STANDRAD 11)
```

* 设置目标属性：

```cmake
target_include_directories(C_Project PUBLIC include)
```

* 条件语句：

```cmake
if(expression)
  # Commands
elseif(expression)
  # Commands
else()
  # Commands
endif()
```

* 自定义命令：

```cmake
add_custom_command(
   TARGET MyExecutable POST_BUILD
   COMMAND ${CMAKE_COMMAND} -E echo "Build completed."
)
```

