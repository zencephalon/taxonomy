'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SELECT = 'SELECT';
var SORT = 'SORT';
var EDIT = 'EDIT';

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

    this.selectFolder = function (id) {
      if (_this.state === SELECT) {
        _this.folderId = id;
        _this.renderSelect();
      }
    };

    this.getFolders = function (nodes) {
      return nodes.filter(function (n) {
        return !n.url;
      });
    };

    this.getShortcut = function (folderId) {
      return _this.shortcutsById[folderId];
    };

    this.state = SELECT;
    this.folderId = '0';
    this.$app = $('#app');
    this.shortcuts = {};
    this.shortcutsById = {};
  }

  _createClass(Taxonomy, [{
    key: 'renderSelect',
    value: function renderSelect() {
      var _this2 = this;

      chrome.bookmarks.getSubTree(this.folderId, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var f = _ref2[0];

        console.log(f);
        var fs = _this2.getFolders(f.children);
        _this2.resetShortcuts();
        _this2.addShortcuts(fs);
        _this2.addBackShortcut(f);
        _this2.renderHtml('<h2>current folder: ' + _this2.folderTitle(f.title) + '</h2>' + ('<ul>' + fs.map(function (tf) {
          return '<li>' + _this2.getShortcut(tf.id) + ': ' + tf.title + '</li>';
        }).join('') + '</ul>') + _this2.backShortcutHtml(f));
      });
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
      var _this3 = this;

      if (f.parentId) {
        Mousetrap.bind('backspace', function () {
          return _this3.selectFolder(f.parentId);
        });
      }
    }
  }, {
    key: 'addShortcuts',
    value: function addShortcuts(folders) {
      var _this4 = this;

      folders.forEach(function (folder) {
        var shortcut = _this4.shortestRemainingShortcut(folder.title);
        var id = folder.id;

        _this4.shortcuts[shortcut] = id;
        _this4.shortcutsById[id] = shortcut;
        Mousetrap.bind(shortcut.split('').join(' ') + ' space', function () {
          return _this4.selectFolder(id);
        });
      });
    }
  }, {
    key: 'shortestRemainingShortcut',
    value: function shortestRemainingShortcut(t) {
      var title = t.toLowerCase();
      for (var i = 2; i <= title.length; i++) {
        var proposed = title.slice(0, i);
        if (!this.shortcuts[proposed]) {
          return proposed;
        }
      }
      return title;
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
});