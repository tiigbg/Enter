// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

// Constructor
ForgePlugins.LocationTriggers = function() {
  this._setIntervalHandler;
};

ForgePlugins.LocationTriggers.prototype =
  {
    /**
     * Boot function
     */
    boot: function() {
      if (this.plugin.options.locations) {
        this._setIntervalHandler = setInterval(this.getLocation.bind(this),this.plugin.options.pollRate*1000);
      }
      if (this.plugin.options.debug) {
        setTimeout(this.debug.bind(this), 3000);
      }
    },

    debug: function() {
      console.log("Action list", this.plugin.actions);
      console.log("Action is", this.plugin.actions[0]);
      var action = this.viewer.actions.get(this.plugin.options.locations[0].actionUID);
      console.log("Action in boot is", action);
      //this.plugin.actions[0].execute();
          if(typeof action !== "undefined" && action !== null)
          {
              action.execute();
              console.log("Executed");
          }
    },

    /**
     * Destroy function
     */
    destroy: function() {
      clearInterval(this._setIntervalHandler);
    },

    getLocation: function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.checkDistance.bind(this));
      } else {
        console.log( "Geolocation is not supported by this browser.");
      }
    },

    checkDistance: function(position) {
      console.log( "Latitude, longitude", position.coords.latitude, position.coords.longitude);
      console.log("plugin options are", this.plugin.options);
      for (var i = 0; i < this.plugin.options.locations.length; i++) {
        var distance = this.getDistanceFromLatLonInM(position.coords.latitude, position.coords.longitude, this.plugin.options.locations[i].lat, this.plugin.options.locations[i].long);
        console.log("Distance is", distance);
        if (distance <= this.plugin.options.locations[i].triggerDistance) {
          console.log("Dispatch!");
          //var eventName = this.plugin.options.locations[i].event;
          //var action = this.viewer.actions.get(this.plugin.actions[i]);
          var action = this.viewer.actions.get(this.plugin.options.locations[i].actionUID);
          console.log("Actoin is", action);
          if(typeof action !== "undefined" && action !== null)
          {
              action.execute();
          }
          //this.plugin.actions[0].execute();

          //this.plugin.events.loc0.dispatch();
        }
      }
    },

    // from http://stackoverflow.com/a/27943
    getDistanceFromLatLonInM: function(lat1,lon1,lat2,lon2) {
      var R = 6371000; // Radius of the earth in m
      var dLat = this.deg2rad(lat2-lat1);
      var dLon = this.deg2rad(lon2-lon1);
      var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in m
      return d;
    },

    deg2rad: function(deg) {
      return deg * (Math.PI/180)
    }
  };
