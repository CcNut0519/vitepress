import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "CcNut`s Free Platform",
  description: "Share Serendipity and Knowledge for free",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: "deep",
    socialLinks: [{ icon: "github", link: "https://github.com/CcNut0519" }],
    nav: [
      { text: "Home", link: "/" },
      {
        text: "招式套路",
        items: [
          { text: "Markdown Examples", link: "/招式套路/markdown-examples" },
          { text: "Runtime API Examples", link: "/招式套路/api-examples" },
        ],
      },
    ],

    sidebar: [
      {
        text: "🎓内功心法",
        items: [
          {
            text: "编程学习",
            items: [
              { text: "C语言", items: [] },
              { text: "JavaScript", items: [] },
            ],
            collapsed: true,
          },
          {
            text: "计算机网络",
            items: [
              { text: "数据链路层", items: [] },
              { text: "网络层", items: [] },
              { text: "传输层", items: [] },
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
          },
          { text: "算法&数据结构", items: [] },
          { text: "为人处世", items: [] },
        ],
        link: "/内功心法",
      },
      {
        text: "🛠️招式套路",
        items: [
          { text: "Markdown Examples", link: "/招式套路/markdown-examples" },
          { text: "Runtime API Examples", link: "/招式套路/api-examples" },
        ],
        link: "/招式套路",
      },
      {
        text: "💻领域实践",
        items: [{ text: "工作", link: "/招式套路/markdown-examples" }],
        link: "/生活",
      },
      {
        text: "📷摄影",
        items: [
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
