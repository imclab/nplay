
var NormalMode = {
  next: function(playlist) { return playlist.current+1; },
  prev: function(playlist) { return playlist.current-1; },
};

var RepeatMode = {
  next: function(playlist) { return playlist.current; },
  prev: function(playlist) { return playlist.current; }
};

var ShuffleMode = {
  _list: [],
  _index: 0,
  init: function(playlist) {
    // pregenerate list, this allows for next() and prev() to work properly
    ShuffleMode._list = [];
    ShuffleMode._index = 0;
    for(var i = 0; i < playlist.songs.length; i++) {
      ShuffleMode._list.push(i);
    }
    // Apply fisher-yates
    var tmp, current, top = ShuffleMode._list.length;

    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = ShuffleMode._list[current];
      ShuffleMode._list[current] = ShuffleMode._list[top];
      ShuffleMode._list[top] = tmp;
    }
  },
  next: function(playlist) {
    ShuffleMode._index = Math.max(0, Math.min(ShuffleMode._list.length-1, ShuffleMode._index + 1));
    return ShuffleMode._list[ShuffleMode._index];
  },
  prev: function(playlist) {
    ShuffleMode._index = Math.max(0, Math.min(ShuffleMode._list.length-1, ShuffleMode._index - 1));
    return ShuffleMode._list[ShuffleMode._index];
  }
};

var FilterMode = {
  _list: [],
  _index: 0,
  init: function(playlist) {
    // pregenerate list, this allows for next() and prev() to work properly
    FilterMode._list = [];
    FilterMode._index = 0;

    playlist.songs.forEach(function(song, index) {
      if(song.rating >= 3) {
        FilterMode._list.push(index);
      }
    });
  },
  next: function(playlist) {
    FilterMode._index = Math.max(0, Math.min(FilterMode._list.length-1, FilterMode._index + 1));
    return FilterMode._list[FilterMode._index];
  },
  prev: function(playlist) {
    FilterMode._index = Math.max(0, Math.min(FilterMode._list.length-1, FilterMode._index - 1));
    return FilterMode._list[FilterMode._index];
  }
};

var FilterShuffleMode = {
  _list: [],
  _index: 0,
  init: function(playlist) {
    // pregenerate list, this allows for next() and prev() to work properly
    FilterShuffleMode._list = [];
    FilterShuffleMode._index = 0;

    playlist.songs.forEach(function(song, index) {
      if(song.rating >= 3) {
        FilterShuffleMode._list.push(index);
      }
    });

    // Apply fisher-yates
    var tmp, current, top = FilterShuffleMode._list.length;

    if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = FilterShuffleMode._list[current];
      FilterShuffleMode._list[current] = FilterShuffleMode._list[top];
      FilterShuffleMode._list[top] = tmp;
    }

  },
  next: function(playlist) {
    FilterShuffleMode._index = Math.max(0, Math.min(FilterShuffleMode._list.length-1, FilterShuffleMode._index + 1));
    return FilterShuffleMode._list[FilterShuffleMode._index];
  },
  prev: function(playlist) {
    FilterShuffleMode._index = Math.max(0, Math.min(FilterShuffleMode._list.length-1, FilterShuffleMode._index - 1));
    return FilterShuffleMode._list[FilterShuffleMode._index];
  }
};

function Playlist() {
  this.songs = [];
  this.current = 0;
  this.mode = NormalMode;
}

Playlist.prototype.add = function(track) {
  this.songs.push(track);
};

Playlist.prototype.prev = function() {
  console.log('Previous');
  this.set(this.mode.prev(this));
};

Playlist.prototype.next = function() {
  console.log('Next');
  this.set(this.mode.next(this));
};

Playlist.prototype.shuffle = function() {
  console.log('Set shuffle', (this.mode != ShuffleMode));
  if(this.mode != ShuffleMode && this.mode != FilterShuffleMode) {
    if(this.mode == FilterMode) {
      FilterShuffleMode.init(this);
      this.mode = FilterShuffleMode;
      console.log('Set filter and shuffle mode true');
    } else {
      ShuffleMode.init(this);
      this.mode = ShuffleMode;
    }
  } else {
    this.mode = NormalMode;
  }
};

Playlist.prototype.filter = function() {
  console.log('Set filter', (this.mode != FilterMode));
  if(this.mode != FilterMode && this.mode != FilterShuffleMode) {
    if(this.mode == ShuffleMode) {
      FilterShuffleMode.init(this);
      this.mode = FilterShuffleMode;
      console.log('Set filter and shuffle mode true');
    } else {
      FilterMode.init(this);
      this.mode = FilterMode;
    }
  } else {
    this.mode = NormalMode;
  }
};

Playlist.prototype.set = function(index) {
  this.current = Math.max(0, Math.min(this.songs.length-1, index || 0));
};

Playlist.prototype.repeat = function() {
  console.log('Set repeat', (this.mode != RepeatMode));
  if(this.mode != RepeatMode) {
    this.mode = RepeatMode;
  } else {
    this.mode = NormalMode;
  }
};

Playlist.prototype.sort = function() {
  this.songs.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });
};

Playlist.prototype.search = function(line) {
  var results = [],
      search = line.split(" ").filter(function(element){return element.length > 0;});
  for(var i = 0; i < this.songs.length; i++) {
     var matches = [];
     for(var j = 0; j < search.length; j++) {
        var pos = this.songs[i].name.toLowerCase().indexOf(search[j]);
        if( pos > -1) {
          matches.push(pos);
        } else {
          break;
        }
     }
     if(matches.length == search.length) {
        results.push(i);
     } else {
        continue;
     }
  }

  return results;
};

module.exports = Playlist;
