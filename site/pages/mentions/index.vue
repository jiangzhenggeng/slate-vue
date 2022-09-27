<style scoped lang="less">
.mentions {
  top: -9999px;
  left: -9999px;
  position: absolute;
  z-index: 1;
  padding: 3px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, .2);

  &__item {
    padding: 1px 3px;
    border-radius: 3px;
  }
}

.var-box {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
  margin-bottom: 10px;

  &__btn {
    padding: 3px 5px;
    border: 1px solid #f7f7f7;
    cursor: pointer;

    & + & {
      margin-left: 10px;
    }

    &:hover {
      border: 1px solid #f0f0f0;
    }
  }
}
</style>
<template>
  <div>
    <Slate
      :value="JSON.stringify(initialValue)"
      @onChange="onChange"
    >
      <div class="var-box">
        <div
          v-for="item in CHARACTERS"
          :key="item.code + item.label"
          class="var-box__btn"
          @click="insertVar(item)"
        >
          <span>{{ item.label }}</span>
        </div>
      </div>
      <Editable
        :renderElement="renderElement"
        placeholder="请输入变量表达式"
        :onKeyDown="onKeyDown"
      />
      <div style="color: red">{{ tips }} {{ chars.length }}</div>
    </Slate>
    <fragment>
      <div
        class="mentions"
        v-if="target && chars.length > 0"
        :ref="ref.id"
      >
        <div
          class="mentions__item"
          v-for="(char, i) in chars"
          :key="char.code + char.label"
          :style="[{background: i === index ? '#B4D5FF' : 'transparent'}]"
          @click="insertVar(char)"
        >
          <span>{{ char.label }}</span>
        </div>
      </div>
    </fragment>
  </div>
</template>
<script>
import { Slate, Editable, useEffect, useRef, VueEditor, Transforms, fragment } from 'slate-vue'
import { renderElement } from './render'

import { Editor, Range } from 'slate'
import { CHARACTERS, insertMention, withMentions } from './utils'

// this value is for editor
let initialValue = [
  {
    children: [
      { text: '(' },
      {
        type: 'mention',
        label: '合同金额',
        item: {
          label: '合同金额',
          code: 'htje'
        },
        children: [{ text: '' }]
      },
      { text: '+' },
      {
        type: 'mention',
        label: '索赔金额',
        item: {
          label: '索赔金额',
          code: 'spje'
        },
        children: [{ text: '' }],
        isVoid: () => true
      },
      { text: ')' }
    ]
  }
]
export default {
  name: 'mentions',
  components: {
    Slate,
    Editable,
    fragment
  },
  hooks () {
    let ref = this.ref = useRef(null)
    let { target, index, search, chars } = this
    let editor = this.$editor
    useEffect(() => {
      if (target && chars.length > 0) {
        let el = ref.current
        let domRange = VueEditor.toDOMRange(editor, target)
        let rect = domRange.getBoundingClientRect()
        el.style.top = `${rect.top + window.pageYOffset + 24}px`
        el.style.left = `${rect.left + window.pageXOffset}px`
      }
    }, [chars.length, editor, index, search, target])
  },
  data () {
    return {
      target: null,
      tips: '',
      search: '',
      index: 0,
      renderElement,
      CHARACTERS,
      initialValue
    }
  },
  computed: {
    chars () {
      let list = CHARACTERS.filter(item => {
        let label = item.label
        return label.toLowerCase().startsWith(this.search.toLowerCase()) || !this.search
      }).slice(0)
      return list
    }
  },
  methods: {
    onKeyDown (event) {
      let editor = this.$editor
      let { chars, index } = this
      if (this.target) {
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            let prevIndex = index >= chars.length - 1 ? 0 : index + 1
            this.index = prevIndex
            break
          case 'ArrowUp':
            event.preventDefault()
            let nextIndex = index <= 0 ? chars.length - 1 : index - 1
            this.index = nextIndex
            break
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            Transforms.select(editor, this.target)
            insertMention(editor, chars[index])
            this.target = null
            break
          case 'Escape':
            event.preventDefault()
            this.target = null
            break
        }
      } else {
        if (event.key == 'Enter') {
          event.preventDefault()
        }
      }
    },
    async onChange () {
      let editor = this.$editor
      let { selection } = editor

      if (selection && Range.isCollapsed(selection)) {
        let [start] = Range.edges(selection)
        let wordBefore = Editor.before(editor, start, { unit: 'word' })
        let before = wordBefore && Editor.before(editor, wordBefore)
        let beforeRange = before && Editor.range(editor, before, start)
        let beforeText = beforeRange && Editor.string(editor, beforeRange)
        let beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
        let after = Editor.after(editor, start)
        let afterRange = Editor.range(editor, start, after)
        let afterText = Editor.string(editor, afterRange)
        let afterMatch = afterText.match(/^(\s|$)/)

        if (beforeMatch && afterMatch) {
          this.target = beforeRange
          this.search = beforeMatch[1]
          this.index = 0
          return
        } else {
          let wordBefore = Editor.before(editor, start, { unit: 'offset' })
          let before = wordBefore && Editor.before(editor, wordBefore)
          let beforeRange = before && Editor.range(editor, before, start)
          let beforeText = beforeRange && Editor.string(editor, beforeRange)
          if (/^.?@$/.test(beforeText)) {
            this.target = beforeRange
            this.search = ''
            this.index = 0
            return
          }
        }
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 220)
      })
      this.target = null

      let validator = []
      let strs = []
      let loop = (state) => {
        state.forEach((item) => {
          if (item.type == 'mention') {
            validator.push(`if(!allVarMap.hasOwnProperty('${item.item.code}')){`)
            validator.push(`return {msg:"变量${item.item.label}不存在[${item.item.code}]"}`)
            validator.push(`};\n`)
            strs.push(`parseFloat(allVarMap.${item.item.code}||0)`)
          } else if (item.text) {
            strs.push(item.text)
          }
          if (Array.isArray(item.children)) {
            loop(item.children)
          }
        })
      }
      // console.log(JSON.stringify(editor._state, null, 2))
      loop(editor._state)
      let allVarMap = {}
      CHARACTERS.forEach((item) => {
        allVarMap[item.code] = 0
      })
      this.tips = ''
      try {
        let compted = new Function('allVarMap', `${validator.join('')};return ${strs.join('')}`)
        // console.log(compted.toString())
        let result = compted(allVarMap)
        if (typeof result === 'object') {
          throw Error(result.msg)
        }
      } catch (e) {
        this.tips = e.message || ''
      }
    },
    insertVar (item) {
      // Transforms.insertText(this.$editor, 'some words', {
      //   at: [0, 0]
      // })
      console.log('5')
      insertMention(this.$editor, item)

      for (const [node, path] of Editor.nodes(this.$editor)) {
        console.log(node, path)
      }
    }
  },
  beforeCreate () {
    withMentions(this.$editor)
  }
}
</script>
