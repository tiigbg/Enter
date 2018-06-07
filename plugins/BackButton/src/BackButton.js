// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

// Constructor
ForgePlugins.BackButton = function () {
  // The button, a FORGE.Button instance
  this._btn = null;
  this._UIDs = [];
};

ForgePlugins.BackButton.prototype =
  {
    /**
     * Boot function
     */
    boot: function () {
      this.createButton();
      this._btn.hide();
      this.viewer.story.onSceneLoadComplete.add(this.sceneLoadHandler, this); 
      this.sceneLoadHandler();
    },

    /**
     * Destroy function
     */
    destroy: function () {
      this.viewer.story.onSceneLoadRequest.remove(this.sceneLoadHandler, this);
    },

    sceneLoadHandler: function () {
      if (this._UIDs.length === 0) {
        this._btn.hide();
      } else {
        this._btn.show();
      }
      this._UIDs.push(this.viewer.story.scene.uid);
    },

    btnClickHandler: function () {
      if (this._UIDs.length <= 1) {
        return;
      }
      this._UIDs.pop();
      var lastScene = this._UIDs.pop();
      this.viewer.story.loadScene(lastScene);
    },

    createButton: function () {

        var config = {
            url: this.plugin.options.url,
            width: this.plugin.options.width,
            height: this.plugin.options.height,
            alpha: this.plugin.options.alpha,
            key: this.plugin.options.key,
            i18n: this.plugin.options.i18n,
            keepRatio: this.plugin.options.keepRatio,
            maximized: this.plugin.options.maximized,
        };

        this._btn = this.plugin.create.image(config, false);

        // Set properties to the image
        this._btn.background = this.plugin.options.background;
        this._btn.top = this.plugin.options.top;
        this._btn.right = this.plugin.options.right;
        this._btn.bottom = this.plugin.options.bottom;
        this._btn.left = this.plugin.options.left;
        this._btn.horizontalCenter = this.plugin.options.horizontalCenter;
        this._btn.verticalCenter = this.plugin.options.verticalCenter;
        this._btn.width = this.plugin.options.width;
        this._btn.height = this.plugin.options.height;

        // Add the button to the main container
        this.plugin.container.addChild(this._btn);

        // Add the events handlers
        this._btn.pointer.enabled = true;
        this._btn.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        this._btn.pointer.onClick.add(this.btnClickHandler, this);
    }

  };