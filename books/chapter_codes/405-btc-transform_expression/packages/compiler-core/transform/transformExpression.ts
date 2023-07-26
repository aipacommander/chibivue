import { parse } from "@babel/parser";
import { Identifier } from "@babel/types";

import { advancePositionWithClone, isSimpleIdentifier } from "../utils";
import { walkIdentifiers } from "../babelUtils";
import {
  CompoundExpressionNode,
  ExpressionNode,
  NodeTypes,
  SimpleExpressionNode,
  createCompoundExpression,
  createSimpleExpression,
} from "../ast";
import { NodeTransform } from "../transform";

export const transformExpression: NodeTransform = (node) => {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content as SimpleExpressionNode);
  }
};

interface PrefixMeta {
  start: number;
  end: number;
}

export function processExpression(node: SimpleExpressionNode): ExpressionNode {
  const rawExp = node.content;

  const rewriteIdentifier = (raw: string) => {
    return `_ctx.${raw}`;
  };

  if (isSimpleIdentifier(rawExp)) {
    node.content = rewriteIdentifier(rawExp);
    return node;
  }

  // find ids
  const ast = parse(`(${rawExp})`).program;
  type QualifiedId = Identifier & PrefixMeta;
  const ids: QualifiedId[] = [];

  walkIdentifiers(ast, (node) => {
    node.name = rewriteIdentifier(node.name);
    ids.push(node as QualifiedId);
  });

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
