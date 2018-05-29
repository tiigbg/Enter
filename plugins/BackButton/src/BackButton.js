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
        // Create a FORGE.Button instance
        this._btn = this.plugin.create.button();

        // Set properties to the button
        this._btn.top = this.plugin.options.top;
        this._btn.right = this.plugin.options.right;
        this._btn.bottom = this.plugin.options.bottom;
        this._btn.left = this.plugin.options.left;
        this._btn.horizontalCenter = this.plugin.options.horizontalCenter;
        this._btn.verticalCenter = this.plugin.options.verticalCenter;

        var skin = this._btn.skin;

        // Set the skin if any
        if (typeof this.plugin.options.skin !== "undefined")
        {
            // default state
            if (typeof this.plugin.options.skin.out !== "undefined")
            {
                skin.out = FORGE.Utils.extendMultipleObjects((this.plugin.options.defaultSkin === true ? FORGE.ButtonSkin.DEFAULT_STATE : {}), skin.out, this.plugin.options.skin.out);
            }

            // skin.out is the default skin state for over state
            if (typeof this.plugin.options.skin.over !== "undefined")
            {
                skin.over = FORGE.Utils.extendMultipleObjects(skin.out, skin.over, this.plugin.options.skin.over);
            }

            // skin.out is the default skin state for down state
            if (typeof this.plugin.options.skin.down !== "undefined")
            {
                skin.down = FORGE.Utils.extendMultipleObjects(skin.out, skin.down, this.plugin.options.skin.down);
            }
        }

        // Set the global value if any
        if (this.plugin.options.value !== undefined && this.plugin.options.value !== null)
        {
            if(typeof skin.out.label !== "undefined")
            {
                skin.out.label.value = this.plugin.options.value;
            }
            if(typeof skin.over.label !== "undefined")
            {
                skin.over.label.value = this.plugin.options.value;
            }
            if(typeof skin.down.label !== "undefined")
            {
                skin.down.label.value = this.plugin.options.value;
            }
        }

        this._btn.updateSkin();

        this._btn.width = this.plugin.options.width;
        this._btn.height = this.plugin.options.height;

        // Add the button to the main container
        this.plugin.container.addChild(this._btn);

        // Add the events handlers
        this._btn.pointer.onClick.add(this.btnClickHandler, this);
    }

  };