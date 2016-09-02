const SELECT = 'SELECT'
const SORT = 'SORT'
const EDIT = 'EDIT'

class Taxonomy {
  constructor() {
    this.state = SELECT
    this.folderId = '0'
    this.bookmark = undefined
    this.$app = $('#app')
    this.shortcuts = {}
    this.shortcutsById = {}
  }

  folderTitle = title => (title === '' ? 'root' : title)

  backShortcutHtml = f => (f.parentId ? 'Backspace: go back up' : '')

  bookmarkHtml = bm => (bm ? `<a href="${bm.url}">${bm.title}</a>` : 'No more bookmarks')

  setSorting() {
    this.state = SORT
  }

  setSelecting() {
    this.state = SELECT
  }

  setBookmark(bm) {
    this.bookmark = bm
  }

  renderSelect() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      console.log(f)
      const fs = this.getFolders(f.children)
      this.resetShortcuts()
      this.addShortcuts(fs, this.selectFolder)
      this.addBackShortcut(f)
      this.addSortShortcut()
      this.renderHtml(
        `<h2>current folder: ${this.folderTitle(f.title)}</h2>` +
        `<ul>${fs.map(tf => `<li>${this.getShortcut(tf.id)}: ${tf.title}</li>`).join('')}</ul>` +
        this.backShortcutHtml(f) +
        '<p>ctrl+s: sort this folder</p>'
      )
    })
  }

  renderSort() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      console.log('render sort')
      const bms = this.getBookmarks(f.children)
      this.setBookmark(bms[0])
      const fs = this.getFolders(f.children)
      this.resetShortcuts()
      const moveToFolder = this.moveToFolder(bms[0].id)
      this.addShortcuts(fs, moveToFolder)
      this.addSelectShortcut()
      this.renderHtml(
        `<h2>organizing folder: ${this.folderTitle(f.title)}</h2>` +
        `<h3>current bookmark: ${this.bookmarkHtml(this.bookmark)}</h3>` +
        `<ul>${fs.map(tf => `<li>${this.getShortcut(tf.id)}: ${tf.title}</li>`).join('')}</ul>` +
        'ctrl+s: stop sorting this folder'
      )
    })
  }

  selectFolder = (id) => {
    if (this.state === SELECT) {
      this.folderId = id
      this.renderSelect()
    }
  }

  moveToFolder = (bmId) => (fId) => {
    chrome.bookmarks.move(bmId, { parentId: fId })
    this.renderSort()
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

  addSortShortcut() {
    Mousetrap.bind('ctrl+s', () => {
      this.setSorting()
      this.render()
    })
  }

  addSelectShortcut() {
    Mousetrap.bind('ctrl+s', () => {
      this.setSelecting()
      this.render()
    })
  }

  addShortcuts(folders, selectFunc) {
    folders.forEach(folder => {
      const shortcut = this.shortestNonOverlappingShortcut(folder.title)
      const { id } = folder
      this.shortcuts[shortcut] = id
      this.shortcutsById[id] = shortcut
      Mousetrap.bind(`${shortcut.split('').join(' ')} space`, () => selectFunc(id))
    })
  }

  getFolders = (nodes) => nodes.filter(n => !n.url)

  getBookmarks = (nodes) => nodes.filter(n => n.url)

  getShortcut = (folderId) => this.shortcutsById[folderId]

  shortestNonOverlappingShortcut(t) {
    const letters = t.toLowerCase().split('')
    if (letters.length < 2) {
      letters.push('z')
    }
    let proposed = `${letters.shift()}`
    while (true) {
      if (this.shortcuts[proposed]) {
        proposed = proposed.substr(0, proposed.length - 1)
      }

      if (letters.length === 0) {
        letters.push('z')
      }
      const next = letters.shift()
      proposed += next

      if (!this.shortcuts[proposed]) {
        return proposed
      }
    }
  }

  renderHtml(html) {
    this.$app.html(html)
  }

  render() {
    switch (this.state) {
      case SELECT:
        this.renderSelect()
        break
      case SORT:
        this.renderSort()
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
