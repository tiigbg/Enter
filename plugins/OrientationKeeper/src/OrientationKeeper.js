// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

// Constructor
ForgePlugins.OrientationKeeper = function () {
  this._camera;
  this._lastSceneorientation;
  this._gyroscope;

  this._screenOrientation = 0;

  window.yawOffset = 0;
  this._currentTargetYaw;
  this._sceneAdjustmentYaw = 0;
  this._posEuler = new THREE.Euler(1, 0, 1);
  this._posQuatScreenOrientation = new THREE.Quaternion();
  this._posQuatIndermediate = new THREE.Quaternion();
  this._posQuatOffset = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  this._posQuatFinal = new THREE.Quaternion();
  this._sceneAdjustmentQuat = null;
  this._last360SceneUID = null;
};

ForgePlugins.OrientationKeeper.prototype =
  {
    /**
     * Boot function
     */
    boot: function () {
      console.log("Booting 2!")
      this._camera = this.viewer.camera;
      this.viewer.story.onSceneLoadComplete.add(this.sceneLoadHandler, this); 
      if (FORGE.Device.gyroscope === false) {
        return;
      }
      this._gyroscope = this.viewer.controllers.getByType(FORGE.ControllerType.GYROSCOPE);
      // Disable gyroscope controller
      console.log("Gyroscope is ", this._gyroscope, this.viewer.controllers);
      this._gyroscope.enabled = false;

      //Add our own gyro handlers
      //FORGE.Device.addEventListener("deviceorientation", this.orientationChangeHandler)
      this.viewer.gyroscope.onDeviceOrientationChange.add(this.gyroHandler, this);
      this.viewer.gyroscope.onScreenOrientationChange.add(this.orientationChangeHandler, this);

      this.gyroHandler();
      this.orientationChangeHandler();
      this.sceneLoadHandler();
    },

    update: function () {
      if (FORGE.Device.gyroscope === false) {
        return;
      }
      this.viewer.camera.quaternion = this._posQuatFinal;
    },



    /**
     * Destroy function
     */
    destroy: function () {
      console.log("Destroy!");
      if (FORGE.Device.gyroscope === false) {
        return;
      }
      this.viewer.story.onSceneLoadComplete.remove(this.sceneLoadHandler, this);
      this.viewer.gyroscope.onDeviceOrientationChange.remove(this.gyroHandler, this);
      this.viewer.gyroscope.onScreenOrientationChange.remove(this.orientationChangeHandler, this);
    },

    gyroHandler: function (event) {
      if (this._viewer.controllers.enabled === false) {
        return;
      }

      /** @type {DeviceOrientation} */
      var position = {
        beta: 0,
        alpha: 0,
        gamma: 0
      };

      if (typeof event !== "undefined" && event !== null && typeof event.data !== "undefined" && event.data !== null) {
        position = /** @type {DeviceOrientation} */ event.data;
      }
      //console.log("Pos is", position, this._sceneAdjustmentQuat);

      this._posEuler.set(FORGE.Math.degToRad(position.beta), FORGE.Math.degToRad(position.alpha), -FORGE.Math.degToRad(position.gamma), "YXZ");

      //Adjust for the given scene
      if (this._sceneAdjustmentQuat !== null) {
        var quat = new THREE.Quaternion();
        // Start with an adjusted rotation
        this._posQuatIndermediate = this._sceneAdjustmentQuat.clone();
        // Set the position in correct Euler coordinates
        this._posQuatIndermediate.multiply(quat.setFromEuler(this._posEuler));
      } else {
      // Set the position in correct Euler coordinates
        this._posQuatIndermediate.setFromEuler(this._posEuler);
      }

      // Add the offset provided by the camera
      this._posQuatIndermediate.multiply(this._posQuatOffset);


      // Adjust given the screen orientation
      this._posQuatIndermediate.multiply(this._posQuatScreenOrientation);


      // Final inversion, see FORGE.RenderDisplay#getQuaternionFromPose method
      this._posQuatFinal.set(-this._posQuatIndermediate.y, -this._posQuatIndermediate.x, -this._posQuatIndermediate.z, this._posQuatIndermediate.w);

    },

    orientationChangeHandler: function (event) {
      if (typeof screen.orientation !== "undefined") {
        this._screenOrientation = FORGE.Math.degToRad(screen.orientation.angle);
      }
      else if (typeof window.orientation !== "undefined") {
        this._screenOrientation = FORGE.Math.degToRad(window.orientation);
      }

      this._posQuatScreenOrientation.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this._screenOrientation);
    },

    sceneLoadHandler: function () {
      console.log("Complete 6!");
      console.log("Disabling gyro");
      if (this._gyroscope) {
        this._gyroscope.enabled = false;
      }
      if (this.viewer.story.scene.config.hotspots.length > 0) {
        var curUID = this.viewer.story.scene.config.uid;
        if (curUID !== this._last360SceneUID) {
          console.log(" A new 360 scene, adjusting");
          this._last360SceneUID = this.viewer.story.scene.config.uid;
        } else {
          console.log(" Same 360 scene as before, don't adjust");
          return;
        }
      } else {
        return;
      }
      this._sceneAdjustmentYaw = 0;
      window.yawOffset = 0;
      console.log("Got here");
      this._sceneAdjustmentQuat = null;
      if (this.viewer.story.scene.config.startingYaw === undefined) {
        console.log("no target yaw");
        return;
      } 
      this._currentTargetYaw = this.viewer.story.scene.config.startingYaw;
      console.log("target yaw is", this._currentTargetYaw);
      setTimeout(this.changeSceneOrientation.bind(this), 300);
    },

    changeSceneOrientation: function() {
      var currentYaw
      if (this._sceneAdjustmentQuat && this._sceneAdjustmentQuat !== null) {
        console.log("Had old adjustmenet");
        currentYaw = this._camera.yaw-this._sceneAdjustmentYaw;
      } else {
        console.log("No old adjustment");
        currentYaw = this._camera.yaw;
      }
      console.log("yaw at start of scene is", currentYaw);
      this._sceneAdjustmentYaw = this._currentTargetYaw-currentYaw+360;
      window.yawOffset = this._currentTargetYaw-currentYaw + 360;
      this._sceneAdjustmentQuat = new THREE.Quaternion();
      this._sceneAdjustmentQuat.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), FORGE.Math.degToRad(-this._sceneAdjustmentYaw));
      console.log("We are adjusting by", this._currentTargetYaw-currentYaw, this._sceneAdjustmentQuat);
      setTimeout(this.checkYaw.bind(this), 500);
    },

    checkYaw: function() {
      console.log("new yaw is now", this._camera.yaw, this._sceneAdjustmentQuat);
      var diff = this._currentTargetYaw - this._camera.yaw;
      diff = this.corrMod(diff + 180, 360) - 180
      console.log("Diff is", diff);
      if (Math.abs(diff) > 3) {
        //this._sceneAdjustmentQuat = null;
        this.changeSceneOrientation();
      }

    },

    corrMod: function(a, n) {
      return a - Math.floor(a/n) * n;
    }

  };