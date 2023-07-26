[Prev](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/400_btc_transform.md) | [Next](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/410_btc_render_component.md)

---
title: "transformExpression"
---

# 現状のマスタッシュ構文の課題

マスタッシュ構文、つまりは InterpolationNode についてですが、  
現時点では content を string でもち、codegen する際は先頭に`_ctx.`を付与するという簡易的な実装になっています。

```ts
export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION;
  content: string;
}
```

```ts
function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  const { push } = context;
  push(`${CONSTANT.ctxIdent}.${node.content}`);
}
```

全くもってこれではいけません。それは容易に想像できるかと思います。

これでは、

```html
<p>{{ 1 + 2 * count }}</p>
```

や

```html
<p>{{ getMessage(count) }}</p>
```

などのコードをうまくコンパイルすることができていません。

# 実装方針

やりたいことを一言で言うなら、「ExpressionNode 上のあらゆる Identifier(の name の先頭)に対して`_ctx.`を付与したい」です。

少し噛み砕いて説明します。  
おさらいになりますが、プログラムというのはパースされることによって AST として表現されます。  
そして、プログラムを表す AST の Node には大きく分けて Expression と Statement の 2 種類がありました。
いわゆる式と文です。

```ts
1; // これは Expression
ident; // これは Expression
func(); // これは Expression
ident + func(); // これは Expression

let a; // これは Statement
if (!a) a = 1; // これは Statement
for (let i = 0; i < 10; i++) a++; // これは Statement
```

マスタッシュ構文で想定されるのは Expression (式)です。  
Expression にはさまざまな種類があります。Identifier というのはそのうちの一つで、識別子で表現された Expression です。  
(概ね変数名だと思ってもらえれば問題ないです)

ExpressionNode 上のあらゆる Identifier というのは、

```ts
1; // なし
ident; // ident --- (1)
func(); // func --- (2)
ident + func(); // ident, func --- (3)
```

のようなもので、(1)に関してはそれ単体が Identifier であり、(2)は CallExpression の callee が Identifier、  
(3)は BinaryExpression の left が Identifier、right が CallExpression でその callee が Identifier になっています。

AST は以下のサイトでプログラムを入力すれば容易に観察できるので、ぜひさまざまな Expression 上の Identifier を観測してみてください。  
https://astexplorer.net/#/gist/670a1bee71dbd50bec4e6cc176614ef8/9a9ff250b18ccd9000ed253b0b6970696607b774

やりたいことは分かったとして、どうやって実装していきましょうか。

とても難しそうな感じがしますが、実は単純で、estree-walker というライブラリを使います。  
https://github.com/Rich-Harris/estree-walker

babel で parse することによって得られた AST をこのライブラリを使って tree walk します。  
使い方は非常に簡単で、walk 関数に AST を渡してあげて、第二引数に各 Node の処理を記述してあげれば良いです。  
この walk 関数は AST Node 単位で walk していくのですが、その Node に到達した時点の処理で処理を行うのが enter というオプションです。  
他にも、その Node の去り際に処理をするための leave なども用意されています。今回はこの enter のみを扱います。

`compiler-core/babelUtils.ts`を新たに作成して Identifier に対して操作を行えるようなユーティル関数を実装します。

とりあえず estree-walker はインストールします。

```sh
pnpm i estree-walker

pnpm i -D @babel/types # これも
```

```ts
import { Identifier, Node } from "@babel/types";

import { walk } from "estree-walker";

export function walkIdentifiers(
  root: Node,
  onIdentifier: (node: Identifier) => void
) {
  (walk as any)(root, {
    enter(node: Node) {
      if (node.type === "Identifier") {
        onIdentifier(node);
      }
    },
  });
}
```

あと式の AST を生成し、この関すに渡して node を書き換えながら transform を行なっていけばいいです。

# transformExpression の実装

変換処理の本体である transformExpression を実装していきます。  
とりあえず transformExpression 自体は InterpolationNode を対象とするように実装してみます。

とりあえず、InterpolationNode は content として SimpleExpressionNode を持つように変更します。

```ts
export interface InterpolationNode extends Node {
  type: NodeTypes.INTERPOLATION;
  content: ExpressionNode;
}
```

それに伴って、parseInterpolation も修正です。

```ts
function parseInterpolation(
  context: ParserContext
): InterpolationNode | undefined {
  // .
  // .
  // .
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content,
      loc: getSelection(context, innerStart, innerEnd),
    },
    loc: getSelection(context, start),
  };
}
```

式の変換に関しては他の transformer でも扱いたいので、processExpression として関数化します。

```ts
export const transformExpression: NodeTransform = (node) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content as SimpleExpressionNode);
  }
};

export function processExpression(node: SimpleExpressionNode): ExpressionNode {
  // TODO:
}
```

続いて processExpression の実装の説明です。  
まず、processExpression の内部に Identifier を書き換えるための rewriteIdentifier という関数を実装します。  
node が単体の Identifier だった場合はそのままこの関数を適用しておしまいです。

```ts
export function processExpression(node: SimpleExpressionNode): ExpressionNode {
  const rawExp = node.content;

  const rewriteIdentifier = (raw: string) => {
    return `_ctx.${raw}`;
  };

  if (isSimpleIdentifier(rawExp)) {
    node.content = rewriteIdentifier(rawExp);
    return node;
  }

  // TODO:
}
```

問題はこの次で、SimpleExpressionNode (単純な Identifier ではない) をどのようにして node を transform していくかです。  
これからの話で少し注意して欲しい点が、Babel のパーサによって生成された JavaScript の AST と、我々が定義した chibivue の AST の２つを扱うことになるので、  
混乱を避けるために前者のことを estree、後者のことを AST とこのチャプターでは呼ぶことにします。

方針としては 2 段階に分けます。

1. estree の node を置換しつつ、その node を収集していく
2. 収集された node をもとに AST を構築する

まずは 1 からやっていきます。  
こちらは簡単で、元の SimpleExpressionNode の内容(文字列)を Babel で parse し、  
estree を得ることができればあとはそれを先ほど作ったユーティリティ関数に通して rewriteIdentifier を噛ませます。  
この際に、ids という配列に収集していきます。

```ts
import { parse } from "@babel/parser";
import { Identifier } from "@babel/types";
import { walkIdentifiers } from "../babelUtils";

interface PrefixMeta {
  start: number;
  end: number;
}

export function processExpression(node: SimpleExpressionNode): ExpressionNode {
  // .
  // .
  // .
  const ast = parse(`(${rawExp})`).program; // ※ この ast は estree のことです。
  type QualifiedId = Identifier & PrefixMeta;
  const ids: QualifiedId[] = [];

  walkIdentifiers(ast, (node) => {
    node.name = rewriteIdentifier(node.name);
    ids.push(node as QualifiedId);
  });

  // TODO:
}
```

注意するべき点としては、ここまでではまだ estree を操作しただけで、ast の node は何も操作されていないという点です。

続いて 2 です。ここで新しい AST Node を定義します。`CompoundExpressionNode`というものです。  
Compound には「配合」「複合」といった意味が含まれます。  
この Node は children をもち、これらは少し特殊な値を撮ります。  
まずは AST の定義をご覧ください。

```ts
export interface CompoundExpressionNode extends Node {
  type: NodeTypes.COMPOUND_EXPRESSION;
  children: (
    | SimpleExpressionNode
    | CompoundExpressionNode
    | InterpolationNode
    | TextNode
    | string
  )[];
}
```

children は上記のような配列をとります。  
この Node の children が何を表しているのかは具体例を見た方がわかりやすいと思うので、具体例を挙げます。

以下のような式が以下のような CompoundExpressionNode に解析されます。

```ts
count * 2;
```

```json
{
  "type": 7,
  "children": [
    {
      "type": 4,
      "isStatic": false,
      "content": "_ctx.count"
    },
    " * 2"
  ]
}
```

結構ヘンテコな感じです。children が string の型をとっているのはこのような形になるためです。  
CompoundExpression では Vue のコンパイラが必要な粒度で分割し、部分的に文字列で表現したり、部分的に Node で表現したりするものです。  
具体的には今回のように Expression に存在する Identifier を書き換えたりする場合に Identifier の部分だけを  
別の SimpleExpressionNode として分割したりする感じです。

つまり、これからやることは、収集した estree の Identifier Node と source などをもとにこの CompoundExpression を生成することです。  
以下のコードがその実装になります。

```ts
export function processExpression(node: SimpleExpressionNode): ExpressionNode {
  // .
  // .
  // .
  const children: CompoundExpressionNode["children"] = [];
  ids.sort((a, b) => a.start - b.start);
  ids.forEach((id, i) => {
    const start = id.start - 1;
    const end = id.end - 1;
    const last = ids[i - 1];
    const leadingText = rawExp.slice(last ? last.end - 1 : 0, start);
    if (leadingText.length) {
      children.push(leadingText);
    }

    const source = rawExp.slice(start, end);
    children.push(
      createSimpleExpression(id.name, false, {
        source,
        start: advancePositionWithClone(node.loc.start, source, start),
        end: advancePositionWithClone(node.loc.start, source, end),
      })
    );
    if (i === ids.length - 1 && end < rawExp.length) {
      children.push(rawExp.slice(end));
    }
  });

  let ret;
  if (children.length) {
    ret = createCompoundExpression(children, node.loc);
  } else {
    ret = node;
  }

  return ret;
}
```

Babel によってパースされた Node は start と end (もと文字列のどこに当たるかのロケーション情報)を持っているのでそれをもとに rawExp から該当箇所を抜き出し、頑張って分割します。  
詳しくはソースコードをじっくり眺めてみてください。ここまでの方針が理解できれば読めるはずです。 (advancePositionWithClone などの実装も新規で行なっているのでその辺りも見てみてください。)

CompoundExpressionNode を生成することができるようになったので、Codegen の方でも対応します。

```ts
function genInterpolation(node: InterpolationNode, context: CodegenContext) {
  genNode(node.content, context);
}

function genCompoundExpression(
  node: CompoundExpressionNode,
  context: CodegenContext
) {
  for (let i = 0; i < node.children!.length; i++) {
    const child = node.children![i];
    if (isString(child)) {
      // string の場合にはそのまま push
      context.push(child);
    } else {
      // それ以外は Node を codegen する
      genNode(child, context);
    }
  }
}
```

(genInterpolation がただの genNode になってしまいましたがまぁ、一応残しておきます。)

さて、ここまで実装できたらコンパイラを完成させて動かしてみましょう！

```ts
// transformExpressionを追加する
export function getBaseTransformPreset(): TransformPreset {
  return [[transformExpression, transformElement], {}];
}
```

```ts
import { createApp, defineComponent, ref } from "chibivue";

const App = defineComponent({
  setup() {
    const count = ref(3);
    const getMsg = (count: number) => `Count: ${count}`;
    return { count, getMsg };
  },

  template: `
    <div class="container">
      <p> {{ 'Message is "' + getMsg(count) + '"'}} </p>
    </div>
  `,
});

const app = createApp(App);

app.mount("#app");
```

ここまでのソースコード:  
https://github.com/Ubugeeei/chibivue/tree/main/books/chapter_codes/405-btc-transform_expression


[Prev](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/400_btc_transform.md) | [Next](https://github.com/Ubugeeei/chibivue/blob/main/books/japanese/410_btc_render_component.md)