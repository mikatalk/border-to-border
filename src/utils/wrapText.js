
export const wrapText = function (ctx, text, maxWidth) {
  let lines = []
  let words = text
    .replace(/\n\n/g, ' ` ')
    .replace(/(\n\s|\s\n)/g, '\r')
    .replace(/\s\s/g, ' ')
    .replace('`', ' ')
    .replace(/(\r|\n)/g, ' ' + ' ')
    .split(' ')
  const space = ctx.measureText(' ').width
  const len = words.length
  let width = 0
  let line = ''
  let word = ''
  let w = 0
  let i = 0
  for (i = 0; i < len; i += 1) {
    word = words[i]
    w = word ? ctx.measureText(word).width : 0
    if (w) {
      width = width + space + w
    }
    if (w > maxWidth) {
      const wordChunks = []
      const maxNumLetters = 10
      const numChunks = Math.ceil(word.length / maxNumLetters)
      for (let i = 0; i < numChunks; i+=1) {
        const chunk = word.substr(i * maxNumLetters, maxNumLetters) + (i < numChunks-1 ? '-' : '')
        wordChunks.push(chunk)
      }
      return wordChunks
    } else if (w && width < maxWidth) {
      line += (i ? ' ' : '') + word
    } else {
      !i || lines.push(line !== '' ? line.trim() : '')
      line = word
      width = w
    }
  }
  if (len !== i || line !== '') {
    lines.push(line)
  }
  return lines
}
