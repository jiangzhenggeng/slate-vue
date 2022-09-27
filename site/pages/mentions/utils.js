import { Transforms } from 'slate'

export const withMentions = editor => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element)
  }

  return editor
}
export const CHARACTERS = [
  {
    label: '合同金额',
    code: 'htje'
  },
  {
    label: '变更金额',
    code: 'bgje'
  },
  {
    label: '签证金额',
    code: 'qzje'
  },
  {
    label: '索赔金额',
    code: 'spje'
  },
  {
    label: '已付款金额',
    code: 'yfkje'
  },
  {
    label: '审核金额',
    code: 'shje'
  }
]

export const insertMention = (editor, item) => {
  const mention = {
    type: 'mention',
    label: item.label,
    item,
    children: [
      {
        text: ''
      }
    ]
  }
  Transforms.insertNodes(editor, mention)
  Transforms.move(editor)
}
