import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "CcNut`s Free Platform",
	description: "Share Serendipity and Knowledge for free",
	cleanUrls: true,
	lastUpdated: true,
	themeConfig: {
		docFooter: {
			prev: "上一篇",
			next: "下一篇",
		},
		darkModeSwitchLabel: "外观",
		returnToTopLabel: "返回顶部",
		sidebarMenuLabel: "菜单",
		// https://vitepress.dev/reference/default-theme-config
		outline: { level: "deep", label: "本文目录" },
		logo: "https://image-host.pages.dev/learn/2024_09_20_dog.png",
		socialLinks: [{ icon: "github", link: "https://github.com/CcNut0519" }],
		nav: [
			{ text: "首页", link: "/" },
			{ text: "关于", link: "/Introduction" },
		],

		sidebar: [
			{
				text: "🎓内功心法",
				items: [
					{
						text: "简介", link: "/内功心法/简介"
					},
					{
						text: "编程学习",
						items: [
							{ text: "C语言", link: "/内功心法/编程学习/C语言" },
							{ text: "JavaScript", link: "/内功心法/编程学习/JavaScript" },
						],
						collapsed: true,
					},
					{
						text: "计算机网络",
						items: [
							{ text: "数据链路层", items: [] },
							{ text: "网络层", link: "/内功心法/计算机网络/网络层" },
							{
								text: "传输层",
								items: [
									{ text: "TCP", link: "/内功心法/计算机网络/传输层/TCP" },
									{ text: "UDP", link: "/内功心法/计算机网络/传输层/UDP" },
								],
								collapsed: true,
							},
							{ text: "应用层", items: [] },
						],
						collapsed: true,
					},
					{
						text: "操作系统",
						items: [
							{ text: "Linux", items: [], collapsed: true },
							{ text: "Windows", items: [], collapsed: true },
						],
						collapsed: true,
					},
					{ text: "算法&数据结构", items: [], collapsed: true },
					{ text: "软件测试", items: [], collapsed: true },
					{ text: "好问题", items: [] },
					{ text: "为人处世", items: [] },
				],
				collapsed: true,
			},
			{
				text: "🛠️招式套路",
				items: [
					{
						text: "简介", link: "/招式套路/简介"
					},
					{
						text: "编程", items: [
							{ text: "gcc", link: "/招式套路/编程/gcc" },
						]
					},
					{
						text: "工具", items:[
							{ text: "Git", link: "/招式套路/工具/Git" },
						]
					},
					{ text: "Markdown Examples", link: "/招式套路/markdown-examples" },
					{ text: "Runtime API Examples", link: "/招式套路/api-examples" },
				],
				collapsed: true,
			},
			{
				text: "💻领域实践",
				items: [
					{
						text: "简介", link: "/领域实践/简介"
					},
					{
						text: "2024",
						items: [
							{
								text: "20240829-深圳物联网展",
								link: "/领域实践/2024/20240829-深圳物联网展",
							},
							{
								text: "20240912-镜像交换机抓包",
								link: "/领域实践/2024/20240912-镜像交换机抓包",
							},
							{
								text: "20240914-串口（Serial）连接",
								link: "/领域实践/2024/20240914-串口（Serial）连接",
							},
							{ text: "10月", items: [] },
							{ text: "11月", items: [] },
							{ text: "12月", items: [] },
						],
					},
					{
						text: "C语言编码规范", link: "/领域实践/C语言编码规范"
					}
				],
				collapsed: true,
			},
			{
				text: "📷摄影",
				items: [
					{ text: "简介", link: "/摄影/简介" },
					{ text: "风景", link: "/摄影/风景" },
					{ text: "人文", link: "/摄影/生活" },
				],
				link: "/摄影",
			},
		],
		search: {
			provider: "local",
		},
		lastUpdated: {
			text: "最近更新于",
			formatOptions: {
				dateStyle: "full",
				timeStyle: "medium",
			},
		},
		footer: {
			message: "Released under the MIT License.",
			copyright: "Copyright © 2024 CcNut0519",
		},
	},
	srcDir: "./src",
});
