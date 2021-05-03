import uuid from 'uuid'

const QUERY_TYPE_REGEX = 'query-type-regex'
const QUERY_TYPE_NUMERIC = 'query-type-numeric'

export default class Group {
  
  static QUERY_TYPE_REGEX = QUERY_TYPE_REGEX
  static QUERY_TYPE_NUMERIC = QUERY_TYPE_NUMERIC
  
  constructor () {
    this.id = uuid.v4()
    this.visible = true
    this.name = ''
    this.color = '#' + Math.floor((Math.random()*0xAAAAAA) + 0x555555).toString(16)
    this.caseSensitive = false
    this.queryType = Group.QUERY_TYPE_REGEX
    this.queryString = ''
  }
}