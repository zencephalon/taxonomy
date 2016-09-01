const SELECT = 'SELECT'
const SORT = 'SORT'
const EDIT = 'EDIT'

class Taxonomy {
  constructor() {
    this.state = SELECT
    this.folderId = '0'
    this.$app = $('#app')
    this.shortcuts = {}
    this.shortcutsById = {}
  }

  folderTitle = title => (title === '' ? 'root' : title)

  backShortcutHtml = f => (f.parentId ? 'Backspace: go back up' : '')

  renderSelect() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      console.log(f)
      const fs = this.getFolders(f.children)
      this.resetShortcuts()
      this.addShortcuts(fs)
      this.addBackShortcut(f)
      this.renderHtml(
        `<h2>current folder: ${this.folderTitle(f.title)}</h2>` +
        `<ul>${fs.map(tf => `<li>${this.getShortcut(tf.id)}: ${tf.title}</li>`).join('')}</ul>` +
        this.backShortcutHtml(f)
      )
    })
  }

  selectFolder = (id) => {
    if (this.state === SELECT) {
      this.folderId = id
      this.renderSelect()
    }
  }

  resetShortcuts() {
    Mousetrap.reset()
    this.shortcuts = {}
    this.shortcutsById = {}
  }

  addBackShortcut(f) {
    if (f.parentId) {
      Mousetrap.bind('backspace', () => this.selectFolder(f.parentId))
    }
  }

  addShortcuts(folders) {
    folders.forEach(folder => {
      const shortcut = this.shortestRemainingShortcut(folder.title)
      const { id } = folder
      this.shortcuts[shortcut] = id
      this.shortcutsById[id] = shortcut
      Mousetrap.bind(`${shortcut.split('').join(' ')} space`, () => this.selectFolder(id))
    })
  }

  getFolders = (nodes) => nodes.filter(n => !n.url)

  getShortcut = (folderId) => this.shortcutsById[folderId]

  shortestRemainingShortcut(t) {
    const title = t.toLowerCase()
    for (let i = 2; i <= title.length; i++) {
      const proposed = title.slice(0, i)
      if (!this.shortcuts[proposed]) {
        return proposed
      }
    }
    return title
  }

  renderHtml(html) {
    this.$app.html(html)
  }

  render() {
    switch (this.state) {
      case SELECT:
        this.renderSelect()
        break
      default:
        break
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const taxonomy = new Taxonomy()
  taxonomy.render()

  // chrome.bookmarks.getSubTree('0', bookmarkTreeNode => console.log(bookmarkTreeNode))
  // chrome.bookmarks.getSubTree('1', bookmarkTreeNode => console.log(bookmarkTreeNode))
  // chrome.bookmarks.search('Lifehacking', (array) => { console.log(array) })
  // chrome.bookmarks.getTree((array) => { console.log(array) })
  Mousetrap.bind('space a a', () => { console.log('aa') })
  Mousetrap.bind('space a b', () => { console.log('ab') })
});
