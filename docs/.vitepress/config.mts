import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "ko-KR",
  title: "FE 학습",
  description: "프론트엔드 학습 노트",
  base: "/fe/",
  cleanUrls: true,
  outDir: "../fe",
  themeConfig: {
    nav: [{ text: "면접 준비", link: "/interview/" }],
    sidebar: {
      "/interview/": [
        {
          text: "JavaScript",
          items: [
            { text: "클로저", link: "/interview/javascript/closure" },
            { text: "이벤트 루프", link: "/interview/javascript/event-loop" },
          ],
        },
        {
          text: "React",
          items: [
            { text: "Virtual DOM", link: "/interview/react/virtual-dom" },
            { text: "Hooks 규칙", link: "/interview/react/hooks-rules" },
          ],
        },
        {
          text: "TypeScript",
          items: [
            { text: "제네릭", link: "/interview/typescript/generics" },
            { text: "유틸리티 타입", link: "/interview/typescript/utility-types" },
          ],
        },
        {
          text: "CS 기초",
          items: [{ text: "HTTP vs HTTPS", link: "/interview/cs/http-vs-https" }],
        },
      ],
    },
    socialLinks: [],
  },
});

