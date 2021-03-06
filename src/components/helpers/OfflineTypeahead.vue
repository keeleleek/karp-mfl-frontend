<template>
  <div class="dropdown">
    <input type="text" v-model="query"  :placeholder="placeholder" ref="inputField"
            autocomplete="off"
            @focus="showDropdown()" 
            @keydown.down="down"
            @keydown.up="up"
            @keydown.enter="hit"
            @keydown.esc="reset"
            @blur="reset"
            class="dropdown-toggle"
            />
    <div class="dropdown-menu" :class="{'show': dropdownOpen}">
      <div v-for="(elem, idx) in filteredView" @mousedown.prevent @click="selectElement(elem)" class="typeahead-elem" :class="{'active-typeahead': elemActive(idx)}">
        {{getLabel(elem)}}
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash'

export default {
  name: 'OfflineTypeahead',
  data () {
    return {
      query: this.value,
      dropdownOpen: false,
      activeElem: 0
    }
  },
  props: ['value', 'dataset', 'placeholder', 'anyVal'],
  computed: {
    filteredView () {
      if(this.query && this.query !== '') {
        return _.filter(this.dataset, (elem) => {
          if (elem.value) {
            return _.includes(elem.value, this.query)
          } else {
            return _.includes(elem, this.query)
          }
        })
      } else {
        return this.dataset
      }
    }
  },
  methods: {
    showDropdown () {
      this.query = this.value
      this.dropdownOpen = true
    },
    selectElement (elem) {
      this.query = elem.value || elem
      this.$refs.inputField.blur()
    },
    down () {
      if(this.activeElem + 1 < this.filteredView.length) {
        this.activeElem += 1
      }
    },
    up () {
      if (this.activeElem > 0) {
        this.activeElem -= 1
      }
    },
    hit () {
      const elem = this.filteredView[this.activeElem]
      this.selectElement(elem.value || elem)
    },
    reset () {
      this.activeElem = 0
      if(this.value !== this.query) {
        this.$emit('input', this.query)
      } else {
        this.$emit('blur')
      }
      this.dropdownOpen = false
    },
    elemActive (idx) {
      return this.activeElem == idx
    },
    getLabel (elem) {
      return elem.label || elem
    },
    focus () {
      this.$refs.inputField.focus()
    }
  }
}
</script>

<style scoped>
.active-typeahead {
  background-color: lightgrey;
}
.typeahead-elem {
  padding-left: 10px;
}
</style>
