<template>
  <md-list-item
    class="add-group-prompt"
  >
    <!-- @click="$emit('add-new-group')" -->
    <md-dialog
      :md-active.sync="showDialog"
      class="add-group-prompt"
    >
      <md-dialog-title>Setup Group</md-dialog-title>
        <md-list>
    
          <md-list-item class="color-box">
            <span class="color-picker-wrapper">
              <input
                class=""
                type="color"
                v-model="group.color"
                placeholder="Color"
              />
            </span>
            <span class="label-value"> 
              {{group.color}}
            </span>
          </md-list-item>

          <md-list-item>
            <md-field>
              <label>
                Caption Name
              </label>
              <md-input v-model="group.name"></md-input>
            </md-field>
          </md-list-item>

          <md-list-item>

            <md-radio class="md-primary" v-model="group.queryType" :value="QUERY_TYPE_REGEX">Regex</md-radio>
            <md-radio class="md-primary" v-model="group.queryType" :value="QUERY_TYPE_NUMERIC">Numeric</md-radio>
          </md-list-item>

          <md-list-item class="info-text-holder" >
            <!-- <label>Query</label> -->
            <md-field :class="{'md-invalid': !queryIsValid}">
              <md-input class="query-chunk-input" v-model="group.queryString" ref="query-input"></md-input>
              <span class="md-error" v-html="queryFeedback"></span>
            </md-field>
            <div class="info-text md-caption" v-if="group.queryType == QUERY_TYPE_REGEX">
              <p> Execute REGEX queries across all the node names to highlight patterns. 
                <br/>
                For example, to select all nodes containing the words apple and pear: 
                <br/>
                <span class="code">
                  apple|pear
                </span>
              </p>                  
            </div>
            <div class="info-text md-caption" v-if="group.queryType == QUERY_TYPE_NUMERIC">
              <p> Column Reference (letter) <span class="code">+</span> Operation <span class="code">+</span> Numeric/String Value, 
                <br/>
                such as for example: 
                <br/>
                <span class="code">
                  D > 0.4
                </span>, 
                <span class="code">
                  F <= 0.5
                </span>,
                <span class="code">
                  D > 0.4 AND F <= 0.5
                </span> and
                <span class="code">
                  D > 0.4 OR F <= 0.5
                </span>
              </p>                  
            </div>
          </md-list-item>

          <md-list-item v-if="group.queryType == QUERY_TYPE_REGEX">
            <md-switch
              class="md-primary"
              v-model="group.caseSensitive"
            >
              <span class=""> 
                Case Sensitive
              </span>
            </md-switch>     
          </md-list-item>
        </md-list>
         
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        <md-button class="md-primary md-dense md-primary" @click="saveGroup">Save</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-button
      @click="addGroup()"
      class="left-aligned-btn md-dense md-raised md-primary"
    >
      <span class="btn-text"> 
        Add Group
      </span>
      <md-icon>add</md-icon>
    </md-button> 
  </md-list-item>
</template>

<script>

import {mapGetters} from 'vuex'
import Group from './../vo/Group'

export default {
  name: 'AddGroupPrompt',
  data: () => ({
    QUERY_TYPE_REGEX: Group.QUERY_TYPE_REGEX,
    QUERY_TYPE_NUMERIC: Group.QUERY_TYPE_NUMERIC,
    showDialog: false,
    queryFeedback: '',
    group: new Group()
  }),
  methods: {
    addGroup () {
      this.$store.dispatch('addGroup').then(id => {
        this.openGroupById(id)
      }) 
    },
    openGroupById (id) {
      const index = this.groups.map(g => g.id).indexOf(id)
      if (index > -1) {
        const {id, visible, name, color, caseSensitive, queryType, queryString} = this.groups[index]
        this.$set(this.group, 'id', id)
        this.$set(this.group, 'visible', visible)
        this.$set(this.group, 'name', name)
        this.$set(this.group, 'color', color)
        this.$set(this.group, 'caseSensitive', caseSensitive)
        this.$set(this.group, 'queryType', queryType)
        this.$set(this.group, 'queryString', queryString)        
      } else {
        throw(new Error('group mismatch error'))
      }
      this.showDialog = true
    },
    saveGroup () {
      // console.log('QUERY IS VALID;', this.queryIsValid, this.group)
      if (this.queryIsValid) {
        this.showDialog = false
        this.$store.dispatch('updateGroup', Object.assign({}, this.group))
      }
    }
  },
  computed: {
    ...mapGetters([
      'groups'
    ]),
    queryIsValid () {
      this.queryFeedback = ''
      const feedback = value => `<span class="color-feedback">${value}</span>`
      const error = value => `<span class="color-error">${value}</span>`
      let isValid = false
      if (this.group.queryType == this.QUERY_TYPE_REGEX) {
        if (this.group.queryString.trim().length == 0) {
          this.queryFeedback = feedback(`Query must not be empty`)
          isValid = false
        } else {
          isValid = true
        }
      } else if (this.group.queryType == this.QUERY_TYPE_NUMERIC) {

        const allowedComparators = ['<', '<=', '==', '>=', '>']
        const allowedOperators = ['and', 'or']
        // const allowedColumnsLetters = 'abcdefghijklmnopqrstuvwxyz'.split()
        const endsWithSpace = /\s$/.test(this.group.queryString)
        if (this.queryFeedback == '') {
          const [columnLetter1, comparator1, sampleValue1, operator, columnLetter2, comparator2, sampleValue2] = this.group.queryString.split(' ').map(e => e.trim())
          if (!columnLetter1) {
            this.queryFeedback = feedback(`Start by writting down a column letter reference`)
            isValid = false
          } else if (columnLetter1.length != 1 && allowedComparators.indexOf(columnLetter1.toLowerCase()) == -1) {
            this.queryFeedback = error(`Query part (<b>${columnLetter1}) is not a valid column letter reference`)
            isValid = false
          } else if (!comparator1) {
            this.queryFeedback = feedback(`Next add a comparator such a s'<=' or '==' or '>'`)
            isValid = false
          } else if (allowedComparators.indexOf(comparator1.toLowerCase()) == -1) {
            this.queryFeedback = error(`Query comparator #1 (<b>${comparator1}</b>) is invalid`)
            isValid = false
          } else if (!sampleValue1 && endsWithSpace) {
            this.queryFeedback = feedback(`Next write down the sample value`)
            isValid = false
          } else if (sampleValue1 && isNaN(parseFloat(sampleValue1.replace(/\./g, '').replace(',', '.')))) {
            this.queryFeedback = error(`Query part (<b>${sampleValue1}) is not a number`)
            isValid = false
          } else if (sampleValue1 && !operator) {
            this.queryFeedback = feedback(`Query is now valid, you may extend it using <b>OR</b> / <b>AND</b> operators`)
            isValid = true
          } else if (operator && allowedOperators.indexOf(operator.toLowerCase()) == -1) {
            this.queryFeedback = error(`Query operator (<b>${operator}</b>) is invalid`)
            isValid = false
          } else if (!columnLetter2) {
            this.queryFeedback = feedback(`Next write down a column letter reference`)
            isValid = false
          } else if (columnLetter2.length != 1 && allowedComparators.indexOf(columnLetter2.toLowerCase()) == -1) {
            this.queryFeedback = error(`Query part (<b>${columnLetter2}) is not a valid column letter reference`)
            isValid = false
          } else if (!comparator2) {
            this.queryFeedback = feedback(`Next add a comparator such a s'<=' or '==' or '>'`)
          } else if (allowedComparators.indexOf(comparator2.toLowerCase()) == -1) {
            isValid = false
            this.queryFeedback = error(`Query comparator #2 (<b>${comparator2}</b>) is invalid`)
          } else if (!sampleValue2 && endsWithSpace) {
            this.queryFeedback = feedback(`Next write down the sample value`)
            isValid = false
          } else if (sampleValue2 && endsWithSpace && isNaN(parseFloat(sampleValue2.replace(/\./g, '').replace(',', '.')))) {
            this.queryFeedback = error(`Query part (<b>${sampleValue2}) is not a number`)
            isValid = false
          } else if (sampleValue2) {
            this.queryFeedback = feedback(`Query seems ready!`)
            isValid = true
          }
          let cursorPosition = this.$refs['query-input'] ? this.$refs['query-input'].$el.selectionStart : 0
          this.group.queryString = [
            (columnLetter1 || '').toUpperCase(), comparator1, parseFloat((sampleValue1||'').replace(/\,/g, '.')), 
            (operator || '').toUpperCase(), 
            (columnLetter2 || '').toUpperCase(), comparator2, parseFloat((sampleValue2||'').replace(/\,/g, '.'))
          ].reduce((cumul, el) => {
            if (el) {
              cumul.push(el)
            } 
            return cumul
          }, []).join(' ')
          if (endsWithSpace) {
            this.group.queryString += ' '
            cursorPosition += 1
          }
          if (this.$refs['query-input']) {
            this.$refs['query-input'].$el.setSelectionRange(cursorPosition + 1, cursorPosition + 1)
          }
        }
      }
      return isValid
    }
  }
}
</script>

<style lang="scss">
@import "./../scss/variables";

.add-group-prompt {
  .md-list {
    min-height: 380px;
    .md-list-item {

      
      
      // &.input-with-side-color {
        // background: green;
        // .md-field {
        //   width: calc(100% - 80px);

        // }
      &.color-box {
        // margin-left: 20px;
        // background: red;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .color-picker-wrapper {
          overflow: hidden;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          margin: 5px;
          input[type="color"] {
            margin-left: -10px;
            margin-top: -10px;
            border-radius: 5px;
            width: 50px;
            height: 50px;
          }
        }
        .label-value {
          font-size: smaller; 
        }
      }
      
      .md-list-item-content {
        justify-content: flex-start;
  
        .md-field {
          span.color-feedback {
            color: $color-primary;
          }
          span.color-error {
            color: $color-secondary;
          }
        }
      }
    }
  }
  .md-radio {
    display: flex;
    justify-content: flex-start;
  }

  .info-text-holder,
  .info-text-holder .md-list-item-content {
    flex-wrap: wrap;
    // position: relative;
    .query-chunk-input {
      margin: 0 1px;
    }
    .info-text {
      // position: absolute;
      // top: 0;
      width: 100%;
      // background: red;
      margin: 0px auto 0;
      padding: 0px;
      P {
        margin: 0;
      }
      .code {
        padding: 0 5px;
        border-radius: 3px;
        background: #111;
        color: #fff;
        display: inline-flex;    
      }
    }
  }
}
.md-field.md-theme-default.md-focused label {
  color: $color-secondary;
}
</style>
