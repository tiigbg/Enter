function loadJSON(filename, callback) {

  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function takeScreenshot() {
  var shotCanvas;
  window.html2canvas(document.querySelector("#container")).then(canvas => {
    shotCanvas = document.body.appendChild(canvas);
    var img = shotCanvas.toDataURL("image/jpeg", 0.8);
    document.write('<img src="' + img + '"/>');
  });
}

function loadPlugins(story, editor) {
  story.plugins = {
    enabled: true,
    prefix: "./plugins/",
    engines: [
      {
        uid: "se.ri.delayedactions",
        url: "DelayedActions/"
      },
      {
        uid: "se.ri.cameraview",
        url: "CameraView/"
      },
      {
        uid: "se.ri.locationtriggers",
        url: "LocationTriggers/"
      },
      {
        uid: "se.ri.arview",
        url: "ARView/"
      },
      {
        uid: "se.ri.orientationkeeper",
        url: "OrientationKeeper/"
      },
      {
        uid: "org.forgejs.simpleimage",
        url: "SimpleImage/"
      },
      {
        uid: "org.forgejs.simpletext",
        url: "SimpleText/"
      },
      {
        uid: "org.forgejs.simplevideo",
        url: "SimpleVideo/"
      },
      {
        uid: "org.forgejs.simplebutton",
        url: "SimpleButton/"
      },
      {
        uid: "se.ri.backbutton",
        url: "BackButton/"
      },
      {
        uid: "se.ri.imagebutton",
        url: "ImageButton/"
      }
    ],
    instances: [
      {
        uid: "orientationkeeper",
        engine: "se.ri.orientationkeeper"
      }
    ]
  };
  story.story.scenes.forEach(scene => {
    scene.plugins.instances.push(
      {
        uid: "backbutton",
        engine: "se.ri.backbutton"
      }
    )
  });
  if (editor !== null) {

    var editorEngines = [{
      uid: "org.forgejs.editor",
      url: "Editor/"
    }];
    var editorInstances = [{
      uid: "editor",
      engine: "org.forgejs.editor"
    }];
    //story = Object.assign(story.plugins, editorPlugins);
    story.plugins.engines = story.plugins.engines.concat(editorEngines);
    story.plugins.instances = story.plugins.instances.concat(editorInstances);
    console.log("Story is", story);
  }
}

function loadLocalizations(story) {
  story.i18n =
  {
      enabled: true,
      default: "sv-SE",
      locales:
      [
          {
              uid: "sv-SE",
              name: "Swedish",
              files:
              [
                  {
                      key: "project.sv-SE",
                      url: "./i18n/sv-SE/locale.json"
                  }
              ]
          },
          {
              uid: "en-US",
              name: "English",
              files:
              [
                  {
                      key: "project.en-US",
                      url: "./i18n/en-US/locale.json"
                  }
              ]
          }      
        ]
  };
}