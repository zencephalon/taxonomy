const SELECT = 'SELECT'
const SORT = 'SORT'
const EDIT = 'EDIT'

class Taxonomy {
  constructor() {
    this.state = SELECT
    this.folderId = '0'
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const taxonomy = new Taxonomy()
  taxonomy.init()

  chrome.bookmarks.getSubTree('0', bookmarkTreeNode => console.log(bookmarkTreeNode))
  chrome.bookmarks.getSubTree('1', bookmarkTreeNode => console.log(bookmarkTreeNode))
  chrome.bookmarks.search('Lifehacking', (array) => { console.log(array) })
  chrome.bookmarks.getTree((array) => { console.log(array) })
  Mousetrap.bind('space a a', () => { console.log('aa') })
  Mousetrap.bind('space a b', () => { console.log('ab') })
});
