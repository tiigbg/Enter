// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

// Constructor
ForgePlugins.DelayedActions = function () {
  this._timeouts = [];
};

ForgePlugins.DelayedActions.prototype = {
  /**
   * Boot function
   */
  boot: function() {
    this.plugin.options.actions.forEach(function (a) {
      var timeout = setTimeout(function () { this.viewer.actions.get(a.actionUID).execute(); }, a.delay * 1000);
      this._timeouts.push(timeout);
    }.bind(this));
  },

  /**
   * Destroy function
   */
  destroy: function() {
    this._timeouts.forEach(function (t) {
      clearTimeout(t);
    });
  }

};
