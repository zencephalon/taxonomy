'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SELECT = 'SELECT';
var SORT = 'SORT';
var EDIT = 'EDIT';
var CREATE = 'CREATE';

var Taxonomy = function () {
  function Taxonomy() {
    var _this = this;

    _classCallCheck(this, Taxonomy);

    this.folderTitle = function (title) {
      return title === '' ? 'root' : title;
    };

    this.backShortcutHtml = function (f) {
      return f.parentId ? 'Backspace: go back up' : '';
    };

    this.bookmarkHtml = function (bm) {
      return bm ? '<a href="' + bm.url + '">' + bm.title + '</a>' : 'No more bookmarks';
    };

    this.isRoot = function () {
      return _this.folderId === '0';
    };

    this.selectFolder = function (id) {
      if (_this.state === SELECT) {
        _this.folderId = id;
        _this.saveState();
        _this.renderSelect();
      }
    };

    this.moveToFolder = function (bmId) {
      return function (fId) {
        chrome.bookmarks.move(bmId, { parentId: fId });
        _this.renderSort();
      };
    };

    this.getFolders = function (nodes) {
      return nodes.filter(function (n) {
        return !n.url;
      });
    };

    this.getBookmarks = function (nodes) {
      return nodes.filter(function (n) {
        return n.url;
      });
    };

    this.getShortcut = function (folderId) {
      return _this.shortcutsById[folderId];
    };

    this.state = localStorage.getItem('state') || SELECT;
    this.folderId = localStorage.getItem('folderId') || '0';
    this.$app = $('#app');
    this.shortcuts = {};
    this.shortcutsById = {};
  }

  _createClass(Taxonomy, [{
    key: 'saveState',
    value: function saveState() {
      localStorage.setItem('folderId', this.folderId);
      localStorage.setItem('state', this.state);
    }
  }, {
    key: 'setSorting',
    value: function setSorting() {
      this.state = SORT;
      this.saveState();
    }
  }, {
    key: 'setCreating',
    value: function setCreating() {
      this.state = CREATE;
      this.saveState();
    }
  }, {
    key: 'setSelecting',
    value: function setSelecting() {
      this.state = SELECT;
      this.saveState();
    }
  }, {
    key: 'renderSelect',
    value: function renderSelect() {
      var _this2 = this;

      chrome.bookmarks.getSubTree(this.folderId, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var f = _ref2[0];

        console.log(f);
        var fs = _this2.getFolders(f.children);
        _this2.resetShortcuts();
        _this2.addShortcuts(fs, _this2.selectFolder);
        _this2.addBackShortcut(f);
        _this2.addSortShortcut();
        _this2.renderHtml('<h2>current folder: ' + _this2.folderTitle(f.title) + '</h2>' + ('<ul>' + fs.map(function (tf) {
          return '<li><b>' + _this2.getShortcut(tf.id) + '</b>: ' + tf.title + '</li>';
        }).join('') + '</ul>') + (!_this2.isRoot() ? '<b>backspace</b>: go back<br/>' : '') + (!_this2.isRoot() ? '<b>ctrl+s</b>: sort this folder<br/>' : ''));
      });
    }
  }, {
    key: 'renderSort',
    value: function renderSort() {
      var _this3 = this;

      chrome.bookmarks.getSubTree(this.folderId, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 1);

        var f = _ref4[0];

        console.log('render sort');
        var bms = _this3.getBookmarks(f.children);
        var bm = bms[0];
        var fs = _this3.getFolders(f.children);
        _this3.resetShortcuts();
        var moveToFolder = bm ? _this3.moveToFolder(bm.id) : function () {};
        _this3.addShortcuts(fs, moveToFolder);
        _this3.addSelectShortcut();
        _this3.addCreateShortcut();
        _this3.renderHtml('<h2>organizing folder: ' + _this3.folderTitle(f.title) + '</h2>' + ('<h3>current bookmark: ' + _this3.bookmarkHtml(bm) + '</h3>') + ('<ul>' + fs.map(function (tf) {
          return '<li>' + _this3.getShortcut(tf.id) + ': ' + tf.title + '</li>';
        }).join('') + '</ul>') + '<b>ctrl+s</b>: stop sorting this folder<br/>' + '<b>ctrl+n</b>: create new folder<br/>');
      });
    }
  }, {
    key: 'renderCreate',
    value: function renderCreate() {
      var _this4 = this;

      chrome.bookmarks.getSubTree(this.folderId, function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 1);

        var f = _ref6[0];

        console.log('render create');
        _this4.resetShortcuts();
        _this4.renderHtml('<h2>creating new folder in: ' + _this4.folderTitle(f.title) + '</h2>' + 'folder name: <input id="newFolder" />');
        $('#newFolder').focus();
        $('#newFolder').keydown(function (e) {
          if (e.which === 13) {
            e.preventDefault();
            _this4.createFolder(e.target.value);
          }
        });
      });
    }
  }, {
    key: 'createFolder',
    value: function createFolder(title) {
      chrome.bookmarks.create({ parentId: this.folderId, title: title });
      this.setSorting();
      this.render();
    }
  }, {
    key: 'resetShortcuts',
    value: function resetShortcuts() {
      Mousetrap.reset();
      this.shortcuts = {};
      this.shortcutsById = {};
    }
  }, {
    key: 'addBackShortcut',
    value: function addBackShortcut(f) {
      var _this5 = this;

      if (f.parentId) {
        Mousetrap.bind('backspace', function () {
          return _this5.selectFolder(f.parentId);
        });
      }
    }
  }, {
    key: 'addSortShortcut',
    value: function addSortShortcut() {
      var _this6 = this;

      Mousetrap.bind('ctrl+s', function () {
        _this6.setSorting();
        _this6.render();
      });
    }
  }, {
    key: 'addCreateShortcut',
    value: function addCreateShortcut() {
      var _this7 = this;

      Mousetrap.bind('ctrl+n', function () {
        _this7.setCreating();
        _this7.render();
      });
    }
  }, {
    key: 'addSelectShortcut',
    value: function addSelectShortcut() {
      var _this8 = this;

      Mousetrap.bind('ctrl+s', function () {
        _this8.setSelecting();
        _this8.render();
      });
    }
  }, {
    key: 'addShortcuts',
    value: function addShortcuts(folders, selectFunc) {
      var _this9 = this;

      folders.forEach(function (folder) {
        var shortcut = _this9.shortestNonOverlappingShortcut(folder.title);
        var id = folder.id;

        _this9.shortcuts[shortcut] = id;
        _this9.shortcutsById[id] = shortcut;
        Mousetrap.bind(shortcut.split('').join(' ') + ' space', function () {
          return selectFunc(id);
        });
      });
    }
  }, {
    key: 'shortestNonOverlappingShortcut',
    value: function shortestNonOverlappingShortcut(t) {
      var letters = t.toLowerCase().split('');
      if (letters.length < 2) {
        letters.push('z');
      }
      var proposed = '' + letters.shift();
      while (true) {
        if (this.shortcuts[proposed]) {
          proposed = proposed.substr(0, proposed.length - 1);
        }

        if (letters.length === 0) {
          letters.push('z');
        }
        var next = letters.shift();
        proposed += next;

        if (!this.shortcuts[proposed]) {
          return proposed;
        }
      }
    }
  }, {
    key: 'renderHtml',
    value: function renderHtml(html) {
      this.$app.html(html);
    }
  }, {
    key: 'render',
    value: function render() {
      switch (this.state) {
        case SELECT:
          this.renderSelect();
          break;
        case SORT:
          this.renderSort();
          break;
        case CREATE:
          this.renderCreate();
          break;
        default:
          break;
      }
    }
  }]);

  return Taxonomy;
}();

document.addEventListener('DOMContentLoaded', function () {
  var taxonomy = new Taxonomy();
  taxonomy.render();

  // chrome.bookmarks.getSubTree('0', bookmarkTreeNode => console.log(bookmarkTreeNode))
  // chrome.bookmarks.getSubTree('1', bookmarkTreeNode => console.log(bookmarkTreeNode))
  // chrome.bookmarks.search('Lifehacking', (array) => { console.log(array) })
  // chrome.bookmarks.getTree((array) => { console.log(array) })
  Mousetrap.bind('space a a', function () {
    console.log('aa');
  });
  Mousetrap.bind('space a b', function () {
    console.log('ab');
  });
  localStorage.setItem('hello', 'cool');
  console.log(localStorage.getItem('hello'));
});