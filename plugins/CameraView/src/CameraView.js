// Create the namespace if it doesn't already exist
var ForgePlugins = ForgePlugins || {};

navigator.getUserMedia = (navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

// Constructor
ForgePlugins.CameraView = function () {
  this._scene = null;
  this._renderer = null;
  this._model = null;
  this._arToolkitSource = null;
  this._arToolkitContext = null;
  this._texture = null;
  this._screen = null;
  this._radius = 100;
  this._cam = null;
};

ForgePlugins.CameraView.prototype = {
  /**
   * Boot function
   */
  boot: function () {
    console.log("Booting!")
    this._cam = this.viewer.camera;
    var backCam;
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        console.log("devices", devices);
        if (devices.length > 1 && devices[1].kind !== "audioinput") {
          backCam = devices[1];
        } else {
          backCam = devices[0];
        }
      })
      .catch(function (err) {
        console.log(err.name + ": " + error.message);
      });
    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      navigator.getUserMedia(
        {
          audio: false,
          video: {
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 },
            sourceId: backCam,
            //optional: [{sourceId: backCam}]
          }
        },

        // Success callback
        function (stream) {

          var videoURL = window.URL.createObjectURL(stream);
          var video = document.createElement('video');
          video.setAttribute('autoplay', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('muted', '');
          video.src = videoURL;
          video.onloadedmetadata = function () {
            video.play();
            setTimeout(function () { this.sceneSetup(video); }.bind(this), this.plugin.options.delay * 1000);
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
    //this._screen.position.copy(this.yawPitchToCoords(this._cam.yaw, this._cam.pitch, this._radius));
    //this._screen.rotation.set(new THREE.Vector3(-this._cam.pitch,180-this._cam.yaw, 0));
    //this._screen.setRotationFromEuler(new THREE.Vector3(-this._cam.pitch,180-this._cam.yaw, 0),"XYZ");
    // this._screen.rotation.y = (-this._cam.yaw)*Math.PI/180;
    //this._screen.rotation.x = this._cam.pitch*Math.PI/180;
    //this._screen.rotation.z = 0;
    this._screen.lookAt(new THREE.Vector3(0, 0, 0));
    this._texture.needsUpdate = true;
  },

  sceneSetup: function (video) {
    if (this.plugin.options.facing !== "front") {
      return;
    }
    this._renderer = this.viewer.renderer.backgroundRenderer;
    this._scene = this._renderer.scene;
    // load a texture, set wrap mode to repeat
    this._texture = new THREE.Texture(video);
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
    console.log("Called destroy");
    this._model = null;
    this._arToolkitSource = null;
    this._arToolkitContext = null;
    this._texture = null;
    this._screen = null;
    this._radius = 100;
  }

};
