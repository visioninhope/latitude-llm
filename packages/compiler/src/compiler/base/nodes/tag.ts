import {
  isContentTag,
  isMessageTag,
  isRefTag,
  isToolCallTag,
} from '$compiler/compiler/utils'
import errors from '$compiler/error/errors'
import {
  ContentTag,
  ElementTag,
  MessageTag,
  ReferenceTag,
  ToolCallTag,
} from '$compiler/parser/interfaces'

import { CompileNodeContext } from '../types'
import { compile as resolveContent } from './tags/content'
import { compile as resolveMessage } from './tags/message'
import { compile as resolveRef } from './tags/ref'
import { compile as resolveToolCall } from './tags/toolCall'

async function resolveTagAttributes({
  node: tagNode,
  scope,
  resolveExpression,
}: CompileNodeContext<ElementTag>): Promise<Record<string, unknown>> {
  const attributeNodes = tagNode.attributes
  if (attributeNodes.length === 0) return {}

  const attributes: Record<string, unknown> = {}
  for (const attributeNode of attributeNodes) {
    const { name, value } = attributeNode
    if (value === true) {
      attributes[name] = true
      continue
    }

    let totalValue: string = ''
    for await (const node of value) {
      if (node.type === 'Text') {
        totalValue += node.data
        continue
      }

      if (node.type === 'MustacheTag') {
        const expression = node.expression
        const resolvedValue = await resolveExpression(expression, scope)
        if (resolvedValue === undefined) continue
        totalValue += String(resolvedValue)
        continue
      }
    }

    attributes[name] = totalValue
  }

  return attributes
}

export async function compile(props: CompileNodeContext<ElementTag>) {
  const {
    node,
    scope,
    isInsideContentTag,
    isInsideMessageTag,
    resolveBaseNode,
    baseNodeError,
    groupStrayText,
  } = props
  groupStrayText()

  const attributes = await resolveTagAttributes(props)

  if (isToolCallTag(node)) {
    await resolveToolCall(props as CompileNodeContext<ToolCallTag>, attributes)
    return
  }

  if (isContentTag(node)) {
    await resolveContent(props as CompileNodeContext<ContentTag>, attributes)
    return
  }

  if (isMessageTag(node)) {
    await resolveMessage(props as CompileNodeContext<MessageTag>, attributes)
    return
  }

  if (isRefTag(node)) {
    await resolveRef(props as CompileNodeContext<ReferenceTag>, attributes)
    return
  }

  baseNodeError(errors.unknownTag(node.name), node)

  for await (const childNode of node.children ?? []) {
    await resolveBaseNode({
      node: childNode,
      scope,
      isInsideMessageTag,
      isInsideContentTag,
    })
  }
}
