# Git用法

## 配置用户名和邮箱

配置用户名和邮箱能让 Git 记录提交者信息，便于跟踪提交历史

```bash
$ git config --global user.name "your name"
$ git config --global user.email "your email"
```

## 创建版本库

示例如下：

```bash
$ mkdir learngit		# 创建版本库目录
$ cd learngit			# 进入版本库目录
$ git init			# 初始化版本库
```

如此则在 `learngit` 目录下生成 `.git` 目录，即为版本库，这是个隐藏目录，在linux下查看需要使用 `ls -a` 命令查看

![GIT本地版本库结构](https://image-host.pages.dev/learn/2024_09_24_202409240855144.png)

Git本地版本库结构如上，主要分为工作区、暂存区和仓库

## 提交版本

```bash
$ git add .		# 添加所有文件到暂存区
$ git commit -m "first commit"	# 提交暂存区到仓库，-m后面是提交信息，用于描述文件变更
```

::: tip
`$ git commit --amend`	用于修改最近一次提交，修改的是上一次提交，而不是创建新的提交
:::

## 版本管理

::: info
在实际开发中，我们应该按照几个基本原则进行分支管理：

1. 主分支`master`应当是非常稳定的，仅用于发布新版本，不能在上面直接提交代码
2. 平时提交代码应该在`dev`分支上进行，经过审查后才能合并到`master`分支
3. 我们每个开发者都应该在`dev`分支上创建自己的分支，随时向`dev`分支合并

![实际开发分支图](https://image-host.pages.dev/learn/2024_09_26_202409261810394.png)
:::

### 查看

```bash
$ git status				# 查看工作区和暂存区的状态
$ git rev-parse <name>	# 查看hash值，name可以是HEAD, master, HEAD^^(父父节点)==HEAD~2
$ git log					# 显示提交历史
$ git log --pretty=format:"%H %s"	# 自定义输出格式。%H 是提交哈希，%s 是提交信息
$ git log --graph --oneline --all --decorate -n 10	# 图形化方式展示log，展示10行
$ git reflog				# 查看 Git 仓库中的历史日志，用于恢复
$ git config --list		# 显示所有 Git 配置项
$ git remote -v			# 显示已配置的远程仓库及其 URL
$ git show [<commit>]		# 用于显示 Git 对象（如提交、标签、树等）详细信息
```

### 差异比较

```bash
$ git diff			# 查看工作区和暂存区之间的差异，新建文件无法比较
$ git diff --cached	# 暂存区和仓库
$ git diff --staged	# 暂存区和仓库
$ git diff HEAD		# 工作区和仓库
$ git diff <commit1> <commit2>	# 两个提交之间的差异
$ git diff <commit1> <commit2> <file>	# 两个提交之间的差异，指定文件
$ git diff <branch1> <branch2>	# 两个分支之间的差异
$ git diff <file>					# 指定特定文件查看差异，可结合上述命令
$ git cherry -v origin[/HEAD] test1		# 查看本地test1分支与远程仓库的差异，即commit是否push
```

### 回退版本

```bash
$ git checkout <c$ ommit_hash>		# 将HEAD指针指向commit_hash，但此时HEAD不指向任何分支
$ git reset --hard <commit-hash>	# 回退到commit-hash版本的已提交状态
$ git reset --soft <commit-hash>	# 回退到commit-hash版本之后的已添加、未提交状态
$ git reset --mixed <commit-hash>	# 回退到commit-hash版本之后的未添加、未提交状态
```

::: tip 穿越未来
如果你不小心使用 `git reset --hard` 命令回退版本，丢失了当前版本的数据，那么可以使用 `git reflog` 查看历史提交记录，再次使用 `git reset --hard <commit-hash>` 去到回退之前的版本
:::

### 分支操作

```bash
$ git branch 		# 查看分支
$ git branch -r	# 查看远程分支
$ git branch <branch>		# 创建分支
$ git branch -d <branch>	# 删除分支，-D强制删除
$ git switch <branch>		# 切换分支，且HEAD指针指向相应分支
$ git checkout <branch>	# 切换分支，且HEAD指针指向相应分支
```

合并分支即是将master指向dev分支，dev分支此时可以删除，因为和master分支内容一致：

```bash
$ git merge <branch>		# 将指定分支合并到当前分支
$ git merge --no-ff -m "message" <branch>	# 禁止Fast-Forward合并，这会生成一个新节点，所以需要提交信息
```

::: warning
但当两个分支包含的文件内容有冲突时，需要手动解决冲突，使用`git status`可以查看冲突的文件，手动修改冲突文件，解决完冲突后使用`git add`将修改的文件添加到暂存区，然后再次`git commit`提交
:::

## 远程仓库

### 生成SSH密钥

想要连接到远程仓库，需要与远程仓库之间建立SSH连接，这需要生成客户端的SSH公钥和私钥

```bash
$ ssh-keygen -t rsa -C "youremail@example.com"	# 生成SSH密钥
```

生成的SSH密钥默认保存在用户目录的 `.ssh` 目录下，文件名分别为私钥 `id_rsa` 和公钥 `id_rsa.pub`

### 上传公钥到远程仓库

在远程仓库的设置中找到SSH添加，粘贴 `id_rsa.pub` 内容并保存

### git添加远程仓库

```bash
$ git remote add origin git@example.com:username/repository.git	# 添加远程仓库
```

`origin` 是git中远程仓库的默认名称，可以改为其它的，但没必要

### 远程仓库操作

```bash
$ git clone git@example.com:username/repository.git	# 从远程仓库克隆
$ git push origin master	# 将本地master分支推送到远程仓库origin的master分支
$ git pull origin master	# 从远程仓库origin的master分支拉取
```

::: tip
`$ git pull --rebase`	使用--rebase选项可以将远程分支的提交应用到你当前分支的顶部，而不是进行合并
:::

## 工作情景

### BUG修复

::: info 概述
修复bug时，我们会通过创建新的bug分支进行修复，然后合并，最后删除；

当手头工作没有完成时，先把工作现场`git stash`一下，然后去修复bug，修复后，再`git stash pop`，回到工作现场；

在`master`分支上修复的bug，想要合并到当前`dev`分支，可以用`git cherry-pick <commit>`命令，把bug提交的修改“复制”到当前分支，避免重复劳动
:::

当我们接到一个编号为`#123`的紧急BUG，我们需要本地新建一个`issue-123`分支来修复，但是此时我们又正在完成一个`dev`上的任务还未提交，预计完成还要一周

这个时候我们可以使用`git stash`来将当前工作现场存储起来，此时工作区恢复到当前提交的状态，然后使用`git switch`切换到指定分支创建临时分支`issue-123`来修复BUG，修复完成后进行合并，最后删除临时分支`issue-123`

此时我们成功修复了BUG，使用`git switch dev`回到工作分支，但是工作现场此时在`git stash list`中，使用`git stash pop`恢复分支同时删除了`git stash list`中的内容

但是`dev`是由`master`分出来的，也存在这个BUG，可以使用`git cherry-pick <commit-hash>`复制指定的提交节点到当前分支

### 新功能开发

::: info 概述
新功能开发时，我们会通过创建新的功能分支进行开发，然后合并，最后`feature`分支
:::

::: warning
如果功能开发完毕准备合并时突然告知取消新功能，需要删除此时未合并的`feature`分支，必须使用`-D`参数来强制删除
:::

### 多人协作冲突

1. 在`push`前先使用`git pull`拉取最新代码

	::: warning
	如果`git pull`提示`no tracking information`，因为远程分支和本地分支之间没有建立链接，需要使用`git branch --set-upstream-to origin/<branch>`建立链接
	:::

2. 如果发现有冲突则解决冲突并在本地提交

	::: warning
	这个时候出现了一个问题，解决冲突实际是将`pull`下来的分支和本地分支合并，这个时候如果`pull`提交上去就会使远程分支结构十分丑陋，这个时候需要使用`git rebase`将远程分支变成线性结构，原理是将`pull`下来的分支作为当前分支的父节点
	:::

3. 再次使用`git pull`

### 标签管理

::: info
相比于冗长的`commit-id`，标签可以更直观的看到版本信息且容易记忆

一般在发布新版本的时候会打赏2版本号的标签，所以，标签是版本库的一个快照
:::

在git中打标签首先需要切换到打标签的分支上，然后使用`git tag <tagname>`命令打标签

对某一次提交打标签使用`git tag <tagname> <commit-id>`

还可以创建带说明的标签：`git tag -a <tagname> -m "说明信息"`

::: warning 注意
标签总是和commit-id绑定，如果一个commit同时在两个分支上，那么可以分别在这两个分支看到这个标签
:::

*常用命令：*

```bash
$ git tag 	# 查看所有标签
$ git show <tagname>	# 查看标签信息
$ git tag -d <tagname>	# 删除标签
$ git push origin <tagname>	# 推送标签到远程仓库
$ git push origin --tags	# 推送所有标签到远程仓库
$ git push origin :refs/tags/<tagname>	# 删除远程标签
```

## 自定义git

```bash
$ git config --global color.ui true	# 开启颜色显示（默认开启）
```

### gitignore

一般放在仓库根目录下，当然一个仓库也可以有多个`gitignore`文件，放在哪个目录就对哪个目录生效

```bash
# 排除所有.开头的隐藏文件:
.*
# 排除所有.class文件:
*.class

# 不排除.gitignore和App.class:
!.gitignore
!App.class
```

### alias（别名）

```bash
$ git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"	# 将后面一长串命令叫做lg
```

此时`git lg`输出的日志信息会带有颜色、分支图、提交信息等，方便查看

![git lg输出](https://image-host.pages.dev/learn/2024_09_28_202409281623592.png)