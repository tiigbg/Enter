// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

var DATA_DIR = "data/";

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

// Constructor
ForgePlugins.ARView = function () {
  this._delayedLoad = null;
  this._scene = null;
  this._renderer = null;
  this._model = null;
  this._arController = null;
  this._texture = null;
  this._video = null;
  this._screen = null;
  this._radius = 100;
  this._cam = null;
  this._hits = [];
  this._detected = [];
};

ForgePlugins.ARView.prototype = {
  /**
   * Boot function
   */
  boot: function () {
    console.log("Booting 2!")
    this._cam = this.viewer.camera;
    this.setupCamera();

  },

  setupCamera: function () {
    if (navigator.getUserMedia) {
      console.log("Facingmode is", this.plugin.options.facing === "back" ? "environment" : "user");
      console.log("Supports facingmode?", navigator.mediaDevices.getSupportedConstraints()["facingMode"]);
      navigator.getUserMedia(
        {
          audio: false,
          video: {
            width: { min: 640, ideal: 1024, max: 1280 },
            height: { min: 360, ideal: 480, max: 720 },
            facingMode: this.plugin.options.facing === 'back' ? 'environment' : 'user'
          }
        },

        // Success callback
        function (stream) {

          var videoURL = window.URL.createObjectURL(stream);
          this._video = document.createElement('video');
          this._video.setAttribute('autoplay', '');
          this._video.setAttribute('playsinline', '');
          this._video.setAttribute('muted', '');
          this._video.src = videoURL;
          this._video.onloadedmetadata = function () {
            this._video.play();
            this._delayedLoad = setTimeout(function () { this.sceneSetup(); }.bind(this), this.plugin.options.delay * 1000);
          }.bind(this);
        }.bind(this),

        // Error callback
        function (err) {
          console.log('The following gUM error occured: ' + err);
        }
      );
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  },

  update: function () {
    if (viewer.story.scene.media.type != "cam") {
      //return;
    }
    if (!this._screen) {
      return;
    }
    // Hide the marker, we don't know if it's visible in this frame.
    //markerRoot.visible = false;

    // Process detects markers in the video frame and sends
    // getMarker events to the event listeners.
    if (this._arController && this._video) {
      this._arController.process(this._video);
      this.plugin.options.markers.forEach(function (marker, i) {
        if (!this._detected[i]) {
          this._hits[i] > 0 ? this._hits[i] -= 10 : void 0;
        }
        this._detected[i] = false;
        //this._hits > 0 ? this._hits -= 1 : void 0;
        console.log("Hits are", this._hits);
        if (this._hits[i] >= 100) {
          this.viewer.actions.get(marker.actionUID).execute();
        }
      }.bind(this));
    }
    if (this._screen && this._texture) {
      this._screen.lookAt(new THREE.Vector3(0, 0, 0));
      this._texture.needsUpdate = true;
    }
  },

  sceneSetup: function () {
    if (this.plugin.options.facing !== "front") {
      //return;
    }
    this._renderer = this.viewer.renderer.backgroundRenderer;
    this._scene = this._renderer.scene;
    // load a texture, set wrap mode to repeat
    this._texture = new THREE.Texture(this._video);
    // Remove power-of-two warning message
    this._texture.minFilter = THREE.LinearFilter;
    this._texture.wrapS = THREE.ClampToEdgeWrapping;
    this._texture.wrapT = THREE.ClampToEdgeWrapping;

    var vertexShaderSrc = [
      'varying vec2 vUv;',
      'void main() {',
      'vUv = uv;',
      ' gl_Position = vec4(position * 0.01, 1.0);',
      '}'
    ].join('\n');

    var fragmentShaderSrc = [
      'varying vec2 vUv;',
      'uniform sampler2D texture1;',
      'void main() {',
      ' gl_FragColor = texture2D(texture1, vUv);',
      '}'
    ].join('\n');


    var vFOV = this._cam.fov * Math.PI / 180;
    var height = 2 * Math.tan(vFOV / 2) * this._radius;
    var geometry = new THREE.PlaneGeometry(height / 0.5625, height, height);
    var material = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSrc,
      fragmentShader: fragmentShaderSrc,
      uniforms: {
        texture1: { type: "t", value: this._texture }
      },
      depthWrite: true,
      depthTest: true
    });

    var material2 = new THREE.MeshLambertMaterial({ map: this._texture, shading: THREE.FlatShading });
    this._screen = new THREE.Mesh(geometry, material);
    //this._screen = new THREE.Mesh( geometry, material2 );
    this._screen.position.set(0, 0, -this._radius);
    this._scene.add(this._screen);
    // Light is necessary for current material
    //var light = new THREE.AmbientLight('rgb(255,255,255)'); // soft white light
    //this._scene.add(light);

    if (this.plugin.options.markers && this.plugin.options.markers.length !== 0) {
      this.arSetup();
    }
  },

  arSetup: function () {
    var arController = new ARController(this._video, DATA_DIR + 'camera_para-iPhone 5 rear 640x480 1.0m.dat');
    arController.onload = function () {
      this._arController = arController;
      console.log('ARController ready for use', this._arController);

      var sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 8, 8),
        new THREE.MeshNormalMaterial()
      );
      this.plugin.options.markers.forEach(function (marker, i) {
        console.log("We got here with", marker);
        this._hits.push(0);
        this._detected.push(false);
        var markerFile = this._viewer._mainConfig.markers.find(function (storyMarker) {
          return storyMarker.uid === marker.markerUID;
        });
        console.log(DATA_DIR + markerFile.filename);
        var curMarkerId;
        var curMarkerRoot;
        this._arController.loadMarker(DATA_DIR + markerFile.filename, function (markerId) {
          console.log("We got a marker with id ", markerId);
          curMarkerId = markerId;
          curMarkerRoot = new THREE.Object3D();

          // Make the marker root matrix manually managed.
          //
          curMarkerRoot.matrixAutoUpdate = false;
          curMarkerRoot.add(sphere);
          this._scene.add(curMarkerRoot);
        }.bind(this));
        console.log("Added event listener");
        this._arController.addEventListener("getMarker", function (ev) {
          console.log("Marker id is", curMarkerId, ev.data.marker.id);
          if (curMarkerId === ev.data.marker.id) {
            console.log("Curmarkerroot is", curMarkerRoot.matrix);
            console.log("ev matrix is", ev);
            this._hits[i] += 1;
            this._detected[i] = true;
            // The marker was found in this video frame, make it visible.
            curMarkerRoot.visible = true;

            // Copy the marker transformation matrix to the markerRoot matrix.
            curMarkerRoot.matrix.set(ev.data.matrix);
            //console.log("MARKER IS", ev);
            //console.log("Created this callback during", marker);
          }

        }.bind(this))
      }.bind(this));

    }.bind(this);
  },

  yawPitchToCoords: function (yaw, pitch, radius) {
    var pos = new THREE.Vector3();
    var theta = Math.PI * (-(yaw - 90)) / 180;
    var phi = Math.PI * pitch / 180;
    pos.x = radius * Math.cos(theta) * Math.cos(phi);
    pos.y = radius * Math.sin(phi);
    pos.z = -radius * Math.sin(theta) * Math.cos(phi);
    return pos;
  },

  /**
   * Destroy function
   */
  destroy: function () {
    clearTimeout(this._delayedLoad);
    if (this._arController) {
      console.log("Arcontroller is", this._arController);
      //this._arController.removeEventListener();
      this._arController.dispose();
    }
    if (this._video !== undefined && this._video !== null && this._video.srcObject && this._video.srcObject.getTracks()[0]) {
      this._video.srcObject.getTracks()[0].stop();
    }
    if (this._video !== undefined && this._video !== null) {
      this._video.remove();
    }
    console.log("Called destroy");
    this._model = null;
    this._texture = null;
    this._screen = null;
    this._radius = 100;
  }

};
