export const loadJS = url => {
  return new Promise(accept => {
    let isResolved = false
    const resolveIfNeeded = () => {
      if (!isResolved) {
        accept()
      }
    }
    const scriptTag = document.createElement('script')
    scriptTag.src = url
    scriptTag.onload = resolveIfNeeded
    scriptTag.onreadystatechange = resolveIfNeeded
    document.head.appendChild(scriptTag)
  })
}
