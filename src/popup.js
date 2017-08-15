const SELECT = 'SELECT'
const SORT = 'SORT'
const EDIT = 'EDIT'
const CREATE = 'CREATE'

class Taxonomy {
  constructor() {
    this.state = localStorage.getItem('state') || SELECT
    this.folderId = localStorage.getItem('folderId') || '0'
    this.$app = $('#app')
    this.shortcuts = {}
    this.shortcutsById = {}
  }

  saveState() {
    localStorage.setItem('folderId', this.folderId)
    localStorage.setItem('state', this.state)
  }

  folderTitle = title => (title === '' ? 'root' : title)

  backShortcutHtml = f => (f.parentId ? 'Backspace: go back up' : '')

  bookmarkHtml = bm => (bm ? `<a href="${bm.url}">${bm.title}</a>` : 'No more bookmarks')

  setSorting() {
    this.state = SORT
    this.saveState()
  }

  setCreating() {
    this.state = CREATE
    this.saveState()
  }

  setSelecting() {
    this.state = SELECT
    this.saveState()
  }

  isRoot = () => this.folderId === '0'

  renderSelect() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      const fs = this.getFolders(f.children)
      this.resetShortcuts()
      this.addShortcuts(fs, this.selectFolder)
      this.addBackShortcut(f)
      this.addSortShortcut()
      this.renderHtml(
        `<h2>current folder: ${this.folderTitle(f.title)}</h2>` +
        `<ul>${fs.map(tf => `<li><b>${this.getShortcut(tf.id)}</b>: ${tf.title}</li>`).join('')}</ul>` +
        (!this.isRoot() ? '<b>backspace</b>: go back<br/>' : '') +
        (!this.isRoot() ? '<b>ctrl+s</b>: sort this folder<br/>' : '')
      )
    })
  }

  renderSort() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      const bms = this.getBookmarks(f.children)
      const bm = bms[0]
      const fs = this.getFolders(f.children)
      this.resetShortcuts()
      const moveToFolder = bm ? this.moveToFolder(bm.id) : () => {}
      this.addShortcuts(fs, moveToFolder)
      this.addSelectShortcut()
      this.addCreateShortcut()
      if (bm) {
        this.addOpenShortcut(bm.url)
        chrome.tabs.query({ currentWindow: true, active: true }, tab => {
              chrome.tabs.update(tab.id, { url: bm.url })
        })
      }
      this.renderHtml(
        `<h2>organizing folder: ${this.folderTitle(f.title)}</h2>` +
        `<h3>current bookmark: ${this.bookmarkHtml(bm)}</h3>` +
        `<ul>${fs.map(tf => `<li><b>${this.getShortcut(tf.id)}</b>: ${tf.title}</li>`).join('')}</ul>` +
        '<b>ctrl+s</b>: stop sorting this folder<br/>' +
        '<b>ctrl+o</b>: open this bookmark<br/>' +
        '<b>ctrl+n</b>: create new folder<br/>'
      )
    })
  }

  renderCreate() {
    chrome.bookmarks.getSubTree(this.folderId, ([f]) => {
      this.resetShortcuts()
      this.renderHtml(
        `<h2>creating new folder in: ${this.folderTitle(f.title)}</h2>` +
        'folder name: <input id="newFolder" />'
      )
      $('#newFolder').focus()
      $('#newFolder').keydown(e => {
        if (e.which === 13) {
          e.preventDefault()
          this.createFolder(e.target.value)
        }
      })
    })
  }

  createFolder(title) {
    chrome.bookmarks.create({ parentId: this.folderId, title })
    this.setSorting()
    this.render()
  }

  selectFolder = (id) => {
    if (this.state === SELECT) {
      this.folderId = id
      this.saveState()
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

  addCreateShortcut() {
    Mousetrap.bind('ctrl+n', () => {
      this.setCreating()
      this.render()
    })
  }

  addOpenShortcut(url) {
    Mousetrap.bind('ctrl+o', () => {
      chrome.tabs.create({ url, active: true })
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
      Mousetrap.bind(`${shortcut.split('').join(' ')}`, () => selectFunc(id))
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
      case CREATE:
        this.renderCreate()
        break
      default:
        break
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const taxonomy = new Taxonomy()
  taxonomy.render()
})
