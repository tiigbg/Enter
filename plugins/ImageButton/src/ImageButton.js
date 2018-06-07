var ForgePlugins = ForgePlugins || {};

ForgePlugins.ImageButton = function()
{
    this._image = null;

};

ForgePlugins.ImageButton.prototype =
{
    /**
     * Boot function, add the button to the scene given the position.
     */
    boot: function()
    {

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

        this._image = this.plugin.create.image(config, false);

        // Set properties to the image
        this._image.background = this.plugin.options.background;
        this._image.top = this.plugin.options.top;
        this._image.right = this.plugin.options.right;
        this._image.bottom = this.plugin.options.bottom;
        this._image.left = this.plugin.options.left;
        this._image.horizontalCenter = this.plugin.options.horizontalCenter;
        this._image.verticalCenter = this.plugin.options.verticalCenter;

        this.plugin.container.addChild(this._image);

        this._image.pointer.enabled = true;
        this._image.pointer.cursor = FORGE.Pointer.cursors.POINTER;

        this._image.pointer.onClick.add(this._btnClickHandler, this);
        this._image.pointer.onOut.add(this._btnOutHandler, this);
        this._image.pointer.onOver.add(this._btnOverHandler, this);
        this._image.pointer.onDown.add(this._btnDownHandler, this);
    },

    /**
     * Fires the handler for a click on the button.
     */
    _btnClickHandler: function(event)
    {
        this.plugin.events.onClick.dispatch();
    },

    /**
     * Fires the handler for going out the button.
     */
    _btnOutHandler: function(event)
    {
        this.plugin.events.onOut.dispatch();
    },

    /**
     * Fires the handler for being over the button.
     */
    _btnOverHandler: function(event)
    {
        this.plugin.events.onOver.dispatch();
    },

    /**
     * Fires the handler for the button currently being click on (click
     * maintained).
     */
    _btnDownHandler: function(event)
    {
        this.plugin.events.onDown.dispatch();
    },

    destroy: function()
    {
        this._image = null;
    }
};
