[Prev](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/001_about.md) | [Next](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/003_vue_core_components.md)

---
title: "Vue.jsとは"
---

# Vue.js についてのおさらい

早速本題に入っていきましょう。  
っとその前に改めて Vue.js についておさらいしておきます。

## Vue.js ってなんだっけ

Vue.js とは「Web ユーザーインタフェース構築のための、親しみやすく、パフォーマンスと汎用性の高いフレームワーク」です。  
これは[公式ドキュメントのトップページ](https://ja.vuejs.org/)に掲げられているものです。  
ここに関しては僕の解釈を入れるよりも公式の言葉をそのまま持ってくるのがわかりやすいと思うので以下に引用します。

> Vue (発音は /vjuː/、view と同様) は、ユーザーインタフェースの構築のための JavaScript フレームワークです。標準的な HTML、CSS、JavaScript を土台とする、コンポーネントベースの宣言的なプログラミングモデルを提供します。シンプルなものから複雑なものまで、ユーザーインタフェースの開発を効率的に支えるフレームワークです。

> 宣言的レンダリング: Vue では、標準的な HTML を拡張したテンプレート構文を使って、HTML の出力を宣言的に記述することができます。この出力は、JavaScript の状態に基づきます。

> リアクティビティー: Vue は JavaScript の状態の変化を自動的に追跡し、変化が起きると効率的に DOM を更新します。

> 最小限のサンプルは、次のようになります:
>
> ```ts
> import { createApp } from "vue";
>
> createApp({
>   data() {
>     return {
>       count: 0,
>     };
>   },
> }).mount("#app");
> ```
>
> ```html
> <div id="app">
>   <button @click="count++">Count is: {{ count }}</button>
> </div>
> ```

[引用元](https://ja.vuejs.org/guide/introduction.html#what-is-vue)

宣言的レンダリングやリアクティビティーに関してはそれを説明するチャプターで詳しくやるので、ここではほんとに概要レベルの理解で問題ないです。

また、ここで「フレームワーク」という言葉が出てきていますが、Vue.js は「プログレッシブフレームワーク」を謳っています。
それについてもドキュメントの以下の部部を参照するのが最も端的で正確でわかりやすいと思います。

https://ja.vuejs.org/guide/introduction.html#the-progressive-framework

# 公式ドキュメントとこの本の違い

公式ドキュメントの方では、この次は「どうやって Vue.js を使うか」という点についてフォーカスし、チュートリアルやガイドが豊富に展開されています。

しかし、この本では少し切り口を変えて「Vue.js はどうやって実装されているか」という点についてフォーカスし、実際にコードを書きながら小さな Vue.js を作っていきます。

また、この本は公式のものではなく完全なものではありません。もしかするとおかしな点がいくつか残っていることもあるとおもうので、随時ご指摘いただければと思います。


[Prev](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/001_about.md) | [Next](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/003_vue_core_components.md)