requirejs.config({
  paths: {
    Three: 'http://threejs.org/build/three.min.js',
  }
});

// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-super-touchplate"], function(touchplate) {
  console.log("test running of " + touchplate.id);
  touchplate.init();

  /*
      chilipeppr.load("#test-serial-port", "http://fiddle.jshell.net/chilipeppr/vetj5fvx/show/light/",

      function () {
          cprequire(
          ["inline:com-chilipeppr-widget-serialport"],

          function (sp) {
              sp.setSingleSelectMode();
              sp.init(null, "tinyg");
              //sp.consoleToggle();
          });
      });

      // tinyg widget test load
      chilipeppr.load("#test-tinyg", "http://fiddle.jshell.net/chilipeppr/XxEBZ/show/light/",

      function () {
          cprequire(
          ["inline:com-chilipeppr-widget-tinyg"],

          function (tinyg) {
              tinyg.init();
          });
      });

      // axes widget test load
      chilipeppr.load(
          "#test-axes",
          "http://fiddle.jshell.net/chilipeppr/gh45j/show/light/",

      function () {
          cprequire(
          ["inline:com-chilipeppr-widget-xyz"],

          function (xyz) {
              xyz.init();
          });
      });

      // Serial Port Console Log Window
      // http://jsfiddle.net/chilipeppr/JB2X7/
      // NEW VERSION http://jsfiddle.net/chilipeppr/rczajbx0/
      // The new version supports onQueue, onWrite, onComplete

      chilipeppr.load("#test-console",
          "http://fiddle.jshell.net/chilipeppr/rczajbx0/show/light/",

      function () {
          cprequire(
          ["inline:com-chilipeppr-widget-spconsole"],

          function (spc) {
              // pass in regular expression filter as 2nd parameter
              // to enable filter button and clean up how much
              // data is shown
              spc.init(true, /^{/);

          });
      });
      */

} /*end_test*/ );

cpdefine("inline:com-chilipeppr-widget-super-touchplate", ["chilipeppr_ready", 'Three'], function() {
  return {
    id: "com-chilipeppr-widget-super-touchplate",
    url: "(auto fill by runme.js)", // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
    fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
    githuburl: "(auto fill by runme.js)", // The backing github repo
    testurl: "(auto fill by runme.js)", // The standalone working widget so can view it working by itself
    name: "Widget / Super Touch Plate",
    desc: "This widget helps you use a touch plate to find the origin on your workpiece.",
    subscribe: {},
    foreignPublish: {},
    foreignSubscribe: {},
    isInitted: false, // keep track of our one-time init
    init: function() {

      this.init3d();
      this.setupUiFromLocalStorage();
      this.btnSetup();
      //this.setupPortList();
      //this.setupWsRecv();
      //this.status("Loaded...");
      //this.setupWatchZ();

      // load audio
      this.audio = new Audio('http://chilipeppr.com/audio/beep.wav');
      //this.audio.play();

      this.forkSetup();

      //this.lazyLoadTutorial();
      this.isInitted = true;

      // issue a resize a bit later
      // issue resize event so other widgets can reflow
      $(window).trigger('resize');

      console.log(this.name + " done loading.");
    },
    audio: null,
    loader: new THREE.ObjectLoader(),
    camera: null,
    scene: null,
    renderer: null,
    scripts: {},
    dom: undefined,
    width: 500,
    height: 500,
    touchplate: null, // threejs group
    spindle: null, // threejs group
    light: null, // threejs light
    init3d: function() {
      // init the threejs stuff
      this.width = $('#com-chilipeppr-widget-super-touchplate .panel-body').width();
      this.height = $('#com-chilipeppr-widget-super-touchplate .panel-body').height();

      this.load(this.threeObj);
      //this.setSize( window.innerWidth, window.innerHeight );
      console.log("scene width:", this.width, "height:", this.height);
      this.setSize(this.width, this.height);
      //this.setSize( 140, 200);
      //this.scene.position.setX(width * -0.045);
      //this.play();
      $('#com-chilipeppr-widget-super-touchplate .panel-body').prepend(this.dom);
      $(window).resize(this.onresize.bind(this));
      // setup run buttons
      $('#com-chilipeppr-widget-super-touchplate .btn-Zplaterun').click(this.onRun.bind(this, "z"));
      $('#com-chilipeppr-widget-super-touchplate .btn-Xplaterun').click(this.onRun.bind(this, "x"));
      $('#com-chilipeppr-widget-super-touchplate .btn-Yplaterun').click(this.onRun.bind(this, "y"));
      //Now that we support multiple units, setup input-group-addons
      //When the units change, update the input-group-addons to reflect that change
      $('#com-chilipeppr-widget-super-touchplate .unit-sel').change(function() {
        unitSystem = $('#com-chilipeppr-widget-super-touchplate .unit-sel').val();
        unitSystemName = "";
        if (unitSystem == "G20") {
          unitSystemName = "in";
          currBitDiam = $('#com-chilipeppr-widget-super-touchplate .diameter').val();
          currPlateHeight = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
          currFRate = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
          newBitDiam = currBitDiam / 25.4;
          newPlateHeight = currPlateHeight / 25.4;
          newFRate = currFRate / 25.4;
          $('#com-chilipeppr-widget-super-touchplate .diameter').val(newBitDiam);
          $('#com-chilipeppr-widget-super-touchplate .heightplate').val(newPlateHeight);
          $('#com-chilipeppr-widget-super-touchplate .frprobe').val(newFRate);
        }
        if (unitSystem == "G21") {
          unitSystemName = "mm";
          currBitDiam = $('#com-chilipeppr-widget-super-touchplate .diameter').val();
          currPlateHeight = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
          currFRate = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
          newBitDiam = currBitDiam * 25.4;
          newPlateHeight = currPlateHeight * 25.4;
          newFRate = currFRate * 25.4;
          $('#com-chilipeppr-widget-super-touchplate .diameter').val(newBitDiam);
          $('#com-chilipeppr-widget-super-touchplate .heightplate').val(newPlateHeight);
          $('#com-chilipeppr-widget-super-touchplate .frprobe').val(newFRate);
        }
        $('#com-chilipeppr-widget-super-touchplate .input-group-addon').text(unitSystemName);
        //One special case!
        $('#com-chilipeppr-widget-super-touchplate #fr').text(unitSystemName + "/min");
      });
      // run intro anim
      this.introAnim();
    },
    introAnim: function() {

      var v = this.spindle.position.clone();

      // start
      var startx = v.x - 5;
      var starty = v.y + 12;
      var startfov = 45;

      // end
      var endx = v.x - 5;
      var endy = v.y + 10;
      var endfov = this.camera.fov;

      this.steps = 50;
      this.deltax = (endx - startx) / this.steps;
      this.deltay = (endy - starty) / this.steps;
      this.deltafov = (endfov - startfov) / this.steps;

      this.camera.fov = startfov;
      this.camera.updateProjectionMatrix();

      v.x = startx;
      v.y = starty;

      this.curV = v;
      this.curFov = startfov;
      this.curStep = 0;

      this.camera.lookAt(this.curV);
      this.animate();

      setTimeout(this.introAnimStep.bind(this), 5);


    },
    deltax: null,
    deltay: null,
    deltafov: null,
    curV: null,
    curFov: null,
    curStep: null,
    steps: null,
    introAnimStep: function() {

      this.curStep++;

      this.curV.x += this.deltax;
      this.curV.y += this.deltay;
      this.curFov += this.deltafov;

      console.log("introAnimStep. this.curV:", this.curV, "curFov:", this.curFov);
      this.camera.lookAt(this.curV);
      this.camera.fov = this.curFov;
      this.camera.updateProjectionMatrix();
      this.animate();

      if (this.curStep < this.steps)
        setTimeout(this.introAnimStep.bind(this), 5);
    },
    gcodeCtr: 0,
    isRunning: false,
    /* //this pointer corruption is killing me.  Appended to .change of unit-sel object. see this.init3D
    convertToIn: function() {
      currBitDiam = $('#com-chilipeppr-widget-super-touchplate .diameter').val();
      currPlateHeight = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
      newBitDiam = currBitDiam * 25.4;
      newPlateHeight = currPlateHeight * 25.4;
      $('#com-chilipeppr-widget-super-touchplate .diameter').val(newBitDiam);
      $('#com-chilipeppr-widget-super-touchplate .heightplate').val(newPlateHeight);
    },
    convertToMM: function() {
      currBitDiam = $('#com-chilipeppr-widget-super-touchplate .diameter').val();
      currPlateHeight = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
      newBitDiam = currBitDiam / 25.4;
      newPlateHeight = currPlateHeight / 25.4;
      $('#com-chilipeppr-widget-super-touchplate .diameter').val(newBitDiam);
      $('#com-chilipeppr-widget-super-touchplate .heightplate').val(newPlateHeight);
    },*/
    runZAxis: function() {
      this.isRunning = true;
      console.log("Starting Z-probing operation");
      //swap button to stop
      $('#com-chilipeppr-widget-super-touchplate .btn-Zplaterun').addClass("btn-danger").text("Stop");
      //get feedrate
      var fr = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
      
      //Set this axis to zero so that we search in the correct direction no matter what the absolute coords are.
      var id = "tp" + this.gcodeCtr++;
      if(this.coordOffsetNo == 0)  {
       gcode = "G28.3 Z0"; 
       chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
       });
      }
      else {
        gcode = "G10 L2 P" + this.coordOffsetNo + " Z0"
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
        });
      }
      //Start searching!
      var id = "tp" + this.gcodeCtr++;
      gcode = "G38.2 Z-30 F" + fr + "\n";
      chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
        Id: id,
        D: gcode
      });
      this.runningAxis = "z";
      this.animInfiniteStart();
      console.log(this.animAxis);
    },
    runXAxis: function() {
      this.isRunning = true;
      console.log("Starting X-probing operation");
      //swap button to stop
      $('#com-chilipeppr-widget-super-touchplate .btn-Xplaterun').addClass("btn-danger").text("Stop");
      //get feedrate
      var fr = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
      
      //Set this axis to zero so that we search in the correct direction no matter what the absolute coords are.
      var id = "tp" + this.gcodeCtr++;
      if(this.coordOffsetNo == 0)  {
       gcode = "G28.3 X0"; 
       chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
       });
      }
      else {
        gcode = "G10 L2 P" + this.coordOffsetNo + " X0"
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
        });
      }  
      //Start searching! Positive value makes toolhead search in opposite direction from g53 origin, towards touchplate.
      var id = "tp" + this.gcodeCtr++;
      gcode = "G38.2 X-20 F" + fr + "\n";
      chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
        Id: id,
        D: gcode
      });
      this.runningAxis = "x";
      this.animInfiniteStart();
    },
    runYAxis: function() {
      this.isRunning = true;
      console.log("Starting Y-probing operation");
      //swap button to stop
      $('#com-chilipeppr-widget-super-touchplate .btn-Yplaterun').addClass("btn-danger").text("Stop");
      //get feedrate
      var fr = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
      
      //Set this axis to zero so that we search in the correct direction no matter what the absolute coords are.
      var id = "tp" + this.gcodeCtr++;
      if(this.coordOffsetNo == 0)  {
       gcode = "G28.3 Y0"; 
       chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
       });
      }
      else {
        gcode = "G10 L2 P" + this.coordOffsetNo + " Y0"
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
         Id: id,
         D: gcode
        });
      }
      //Start searching! Positive value makes toolhead search in opposite direction from g53 origin, towards touchplate.
      var id = "tp" + this.gcodeCtr++;
      gcode = "G38.2 Y-20 F" + fr + "\n";
      chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
        Id: id,
        D: gcode
      });
      this.runningAxis = "y";
      this.animInfiniteStart();
    },
    onRun: function(axis) {
      if (this.isRunning) {
        // we need to stop

        // fire off cancel to cnc
        var id = "tp" + this.gcodeCtr++;
        var gcode = "!\n";
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });
        //Stop watching for data
        this.watchForProbeEnd();
        // swap button for desired axis to stop
        if (axis == "z") $('#com-chilipeppr-widget-super-touchplate .btn-Zplaterun').removeClass("btn-danger").text("Run Z");
        if (axis == "x") $('#com-chilipeppr-widget-super-touchplate .btn-Xplaterun').removeClass("btn-danger").text("Run X");
        if (axis == "y") $('#com-chilipeppr-widget-super-touchplate .btn-Yplaterun').removeClass("btn-danger").text("Run Y");
        this.animInfiniteEnd();
        this.isRunning = false;

      }
      else {
        //Get and set units
        unitSystem = $('#com-chilipeppr-widget-super-touchplate .unit-sel').val();
        unitSystemName = "";
        if (unitSystem == "G20") {
          unitSystemName = "in";
        }
        if (unitSystem == "G21") {
          unitSystemName = "mm";
        }
        // send the probe command to start the movement
        var id = "tp" + this.gcodeCtr++;
        var gcode = unitSystem + " G91 (Use " + unitSystemName + " and rel coords)\n";
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });
        //Get what offset we are using
        /*  For reference, the coordinate system-to-number chart can be found at:
         *   http://linuxcnc.org/docs/html/gcode/g-code.html#gcode:g10-l2
         *   Although you could probably just read this swich-case and be fine.
         */
        this.coordOffsetNo = 0;
        coordSystem = $('#com-chilipeppr-widget-super-touchplate .coord-sel').val();
        switch (coordSystem) {
          case "G53":
            this.coordOffsetNo = 0; //Technically, this is N/A, it sets nothing, but we're using it to represent G53, or machine absolute coords.
            break;
          case "G54":
            this.coordOffsetNo = 1;
            break;
          case "G55":
            this.coordOffsetNo = 2;
            break;
          case "G56":
            this.coordOffsetNo = 3;
            break;
          case "G57":
            this.coordOffsetNo = 4;
            break;
          case "G58":
            this.coordOffsetNo = 5;
            break;
          case "G59":
            this.coordOffsetNo = 6;
            break;
          case "G59.1":
            this.coordOffsetNo = 7;
            break;
          case "G59.2":
            this.coordOffsetNo = 8;
            break;
          case "G59.3":
            this.coordOffsetNo = 9;
            break;
          case "G92":
            this.coordOffsetNo = 10; //While technically not an official coordinate system, we'll use 10 to represent G92, WHICH I DO NOT RECOMMEND YOU USE. EVER.
            break;
        }
        //start watching for data from SPJS, then run.
        //that.watchForProbeStart(); //This is broken, inlining.
        console.log(axis);
        this.watchForProbeStart();
        //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLineForProbe);
        if (axis == "z") this.runZAxis();
        if (axis == "x") this.runXAxis();
        if (axis == "y") this.runYAxis();

      }
    },
    watchForProbeStart: function() {
      // We need to subscribe to the /recvline cuz we need to analyze everything coming back
      chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLineForProbe);

    },
    watchForProbeEnd: function() {
      chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLineForProbe);
    },
    onRecvLineForProbe: function(data) {
      console.log("onRecvLineForProbe. data:", data);

      // the data we're looking for is:
      // {"prb":{"e":1,"z":-7.844}}

      // make sure it's the data we want
      if (!('dataline' in data)) {
        console.log("did not get dataline in data. returning.");
        return;
      }

      // let's make sure it's json
      var json = $.parseJSON(data.dataline);

      // sometimes we get {"r":{"prb"  instead of {"prb": so just
      // detect and remap
      if ('r' in json && 'prb' in json.r) json = json.r;

      if ('prb' in json && 'e' in json.prb && this.runningAxis == "z") {
        //this.zOffset = json.prb.z;
        console.log("Z Offset from JSON: " + this.zOffset);
        $('#com-chilipeppr-widget-super-touchplate .btn-Zplaterun').removeClass("btn-danger").text("Run Z");
        this.animInfiniteEnd();
        this.onAfterProbeDone(json.prb);
        this.isRunning = false;
      }
      if ('prb' in json && 'e' in json.prb && this.runningAxis == "x") {
        //this.xOffset = json.prb.x;
        console.log("X Offset from JSON: " + this.xOffset);
        $('#com-chilipeppr-widget-super-touchplate .btn-Xplaterun').removeClass("btn-danger").text("Run X");
        this.animInfiniteEnd();
        this.onAfterProbeDone(json.prb);
        this.isRunning = false;
      }
      if ('prb' in json && 'e' in json.prb && this.runningAxis == "y") {
        //this.yOffset = json.prb.y;
        console.log("Y Offset from JSON: " + this.yOffset);
        $('#com-chilipeppr-widget-super-touchplate .btn-Yplaterun').removeClass("btn-danger").text("Run Y");
        this.animInfiniteEnd();
        this.onAfterProbeDone(json.prb);
        this.isRunning = false;
      }
      /*if (this.probingFinished) {
        //this is also a hack to work with existing function definitions.
        var compositeJSONobject = new Object();
        compositeJSONObject.x = this.xOffset;
        compositeJSONObject.y = this.yOffset;
        compositeJSONObject.z = this.zOffset;
        var JSONstring = JSON.stringify(compositeJSONObject)
        this.onAfterProbeDone(JSONstring);
      }*/
    },
    onAfterProbeDone: function(probeData) {
      // probeData should be of the format
      // {"e":1,"z":-7.844}
      console.log("onAfterProbeDone. probeData:", probeData);

      // unsub so we stop getting events
      this.watchForProbeEnd();

      // play good beep
      this.audio.play();

      // we take the value returned and then add the plate height and make that
      // machine coordinates offset
      //br is negative because the bit is left and down of (0,0)
      if (this.runningAxis == "z") {
        var plateHeight = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
        if (isNaN(plateHeight)) plateHeight = 0;
        console.log("plateHeight:", plateHeight);
        //var gcode = "G28.3 Z" + plateHeight + "\n";
        var gcode = "";
        if(this.coordOffsetNo == 0) {
          gcode = "G28.3 Z" + plateHeight + "\n";
        }
        else if (this.coordOffsetNo == 10) { //Allowing G92
          var gcode = "G92 Z" + plateHeight + "\n";
        }
        else {
          var gcode = "G10 L2 P" + this.coordOffsetNo + " Z" + plateHeight + "\n";
        }
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });

        // now back off a bit
        var gcode = "G91 G0 Z4\nG91 G0 Y25 X25\n";
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });
      }
      if (this.runningAxis == "x") {
        var plateWidth = $('#com-chilipeppr-widget-super-touchplate .widthplate').val();
        //Need to offset X and Y by bit diameter so that bit center will be at desired origin when G0 X0 Y0 Z0 is run.
        var br = Number($('#com-chilipeppr-widget-super-touchplate .diameter').val()) / 2*-1;
        if (isNaN(plateWidth)) plateWidth = 0;
        if (isNaN(br)) br = 0;
        console.log("plateWidth:", plateWidth);
        //var gcode = "G28.3 X" + plateWidth + "\n";
        //var gcode = "G28.3 X" + br + "\n";
        var gcode = "";
        if(this.coordOffsetNo == 0) {
          gcode = "G28.3 X" + plateWidth + "\n";
        }
        else if (this.coordOffsetNo == 10) { //Allowing G92
          var gcode = "G92 X" + plateWidth + "\n";
        }
        else {
          var gcode = "G10 L20 P" + this.coordOffsetNo + " X" + plateWidth + "\n";
        }
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });

        // now back off a bit
        var gcode = "G91 G0 X10\nG91 G0 Y25\nG91 G0 X-25\n";
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });
      }
      if (this.runningAxis == "y") {
        var plateLength = $('#com-chilipeppr-widget-super-touchplate .lengthplate').val();
        //Need to offset X and Y by bit diameter so that bit center will be at desired origin when G0 X0 Y0 Z0 is run.
        var br = Number($('#com-chilipeppr-widget-super-touchplate .diameter').val()) / 2*-1;
        if (isNaN(plateLength)) plateLength = 0;
        if (isNaN(br)) br = 0;
        console.log("platLength:", plateLength);
        //var gcode = "G28.3 Y" + plateLength + "\n";
        //var gcode = "G28.3 Y" + br + "\n";
        var gcode = "";
        if(this.coordOffsetNo == 0) {
          gcode = "G28.3 Y" + plateLength + "\n";
        }
        else if (this.coordOffsetNo == 10) { //Allowing G92
          var gcode = "G92 Y" + plateLength + "\n";
        }
        else {
          var gcode = "G10 L20 P" + this.coordOffsetNo + " Y" + plateLength + "\n";
        }
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });

        // now back off a bit
        var gcode = "G91 G0 Y10\nG91 G0 Z25\nG91 G0 Y-30\n";
        var id = "tp" + this.gcodeCtr++;
        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
          Id: id,
          D: gcode
        });
      }

      // back to absolute mode
      var gcode = "G90\n";
      var id = "tp" + this.gcodeCtr++;
      chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
        Id: id,
        D: gcode
      });

    },
    isAnimInfiniteRunning: false,
    animInfiniteCallback: null,
    animInfiniteStart: function() {
      this.isAnimInfiniteRunning = true;
      this.animInfiniteCallback = setTimeout(this.animInfinite.bind(this), 10);
    },
    animInfiniteEnd: function() {
      this.isAnimInfiniteRunning = false;
    },
    animInfinite: function() {
      if (this.runningAxis == "x") {
        this.spindle.position.setX(this.spindle.position.x - 0.3);
        if (this.spindle.position.x < -5) {
          this.spindle.position.setX(0);
        }
        this.animate();
      }
      // move down the spindle
      //This is frustrating: Gcode uses cartesian coordinates with planeXY as horizontal, and planeXZ as vertial.  Meanwhile, OpenGL uses plane XY as vertical and XZ as horizontal.
      //Therefore the .set[axis]() commands are changed.
      //console.log("about to move the spindle down. this.spindle.position:", this.spindle.position);
      if (this.runningAxis == "y") {
        this.spindle.position.setZ(this.spindle.position.z - 0.3);
        if (this.spindle.position.z < -5) {
          this.spindle.position.setZ(0);
        }
        // re-render
        this.animate();
      }
      if (this.runningAxis == "z") {
        this.spindle.position.setY(this.spindle.position.y - 0.3);
        if (this.spindle.position.y < -1) {
          this.spindle.position.setY(5);
        }
        this.animate();
      }
      if (this.isAnimInfiniteRunning) {
        this.animInfiniteCallback = setTimeout(this.animInfinite.bind(this), 200);
      }
    },
    onresize: function() {
      this.width = $('#com-chilipeppr-widget-super-touchplate .panel-body').width();
      this.setSize(this.width, this.height);
    },
    load: function(json) {

      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      this.renderer.setClearColor(0xffffff);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      // cast shadows
      this.renderer.shadowMapEnabled = true;
      // to antialias the shadow
      this.renderer.shadowMapSoft = true;
      this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

      //this.camera = new THREE.OrthographicCamera( -1, 30, 50, -5, 0.1, 1500 );
      //this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 0.1, 500 );
      //this.camera.lookAt(new THREE.Vector3(0,50,0));
      //this.camera.fov = 15;
      //this.camera.updateProjectionMatrix();
      this.camera = this.loader.parse(json.camera);
      //this.camera.aspect = this.width / this.height;
      this.camera.setViewOffset(this.width * 3, this.height, this.width * 1.4, 0, this.width, this.height);
      //this.camera.fov = 30;
      //this.camera.position.setX(50);
      //this.camera.position.setZ(150);
      console.log("scene camera:", this.camera);

      this.scene = this.loader.parse(json.scene);
      this.scene.traverse(function(obj) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        console.log("traversed scene to obj:", obj);
      });

      //this.scene.castShadow = true;
      var light = this.scene.getObjectByName("SpotLight 1");
      this.light = light;
      light.castShadow = true;
      //light.shadowCameraVisible = true;

      light.shadowMapWidth = 2048;
      light.shadowMapHeight = 2048;

      //light.shadowCameraNear = 50;
      //light.shadowCameraFar = 500;
      light.shadowCameraFov = 20;

      /*
      light.shadowCameraRight     =  0.5;
      light.shadowCameraLeft     = -0.5;
      light.shadowCameraTop      =  0.5;
      light.shadowCameraBottom   = -0.5;
      */

      var touchplate = this.scene.getObjectByName("GroupTouchPlate");
      this.touchplate = touchplate;

      var lineMat = new THREE.LineDashedMaterial({
        color: 0x0000ff
      });
      var lineGeo = new THREE.Geometry();
      lineGeo.vertices.push(new THREE.Vector3(5, 11.15, 0));
      lineGeo.vertices.push(new THREE.Vector3(20, 11.15, 0));
      lineGeo.vertices.push(new THREE.Vector3(20, 0.1, 0));
      lineGeo.vertices.push(new THREE.Vector3(10, 0.1, 0));
      var line = new THREE.Line(lineGeo, lineMat); //, THREE.LineStrip);
      line.castShadow = true;
      touchplate.add(line);

      var spindle = this.scene.getObjectByName("GroupSpindle");
      this.spindle = spindle;
      spindle.position.setY(5);

      /*
      var lineMat2 = new THREE.LineDashedMaterial( { color: 0x0000ff } );
      var lineGeo2 = new THREE.Geometry();
      lineGeo2.vertices.push(new THREE.Vector3( 0, 10, 0 ));
      lineGeo2.vertices.push(new THREE.Vector3( 20, 10, 0 ));
      lineGeo2.vertices.push(new THREE.Vector3( 20, 0, 0 ));
      lineGeo2.vertices.push(new THREE.Vector3( 0, 0, 0 ));
      var line2 = new THREE.Line(lineGeo2, lineMat2); //, THREE.LineStrip);
      line2.castShadow = true;
      spindle.add(line2);
      */

      console.log("touch plate scene:", this.scene);

      this.scripts = {
        keydown: [],
        keyup: [],
        mousedown: [],
        mouseup: [],
        mousemove: [],
        update: []
      };

      for (var uuid in json.scripts) {

        var object = this.scene.getObjectByProperty('uuid', uuid, true);

        var sources = json.scripts[uuid];

        for (var i = 0; i < sources.length; i++) {

          var script = sources[i];

          var events = (new Function('player', 'scene', 'keydown', 'keyup', 'mousedown', 'mouseup', 'mousemove', 'update', script.source + '\nreturn { keydown: keydown, keyup: keyup, mousedown: mousedown, mouseup: mouseup, mousemove: mousemove, update: update };').bind(object))(this, scene);

          for (var name in events) {

            if (events[name] === undefined) continue;

            if (this.scripts[name] === undefined) {

              console.warn('APP.Player: event type not supported (', name, ')');
              continue;

            }

            this.scripts[name].push(events[name].bind(object));

          }

        }

      }

      this.dom = this.renderer.domElement;

    },
    setCamera: function(value) {

      camera = value;
      camera.aspect = this.width / this.height;
      camera.updateProjectionMatrix();

    },
    setSize: function(width, height) {

      this.width = width;
      this.height = height;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);

    },
    dispatch: function(array, event) {

      for (var i = 0, l = array.length; i < l; i++) {

        array[i](event);

      }

    },
    request: null,
    animate: function(time) {

      //this.request = requestAnimationFrame( this.animate );
      //this.dispatch( this.scripts.update, { time: time } );
      this.renderer.render(this.scene, this.camera);

    },
    isHidden: false,
    unactivateWidget: function() {
      if (!this.isHidden) {
        // unsubscribe from everything
        console.log("unactivateWidget. unsubscribing.");
        //chilipeppr.unsubscribe("/com-chilipeppr-interface-cnccontroller/axes", this, this.onAxes);
        //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onWsRecvLaser);
        this.isHidden = true;

      }
      // issue resize event so other widgets can reflow
      $(window).trigger('resize');
    },
    activateWidget: function() {
      if (!this.isInitted) {
        this.init();
      }
      if (this.isHidden) {
        // resubscribe
        console.log("activateWidget. resubscribing.");
        //chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/axes", this, this.onAxes);
        //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, this.onWsRecvLaser);
        this.isHidden = false;
        this.introAnim();
      }
      // issue resize event so other widgets can reflow
      $(window).trigger('resize');
    },
    isVidLoaded: false,
    lazyLoadTutorial: function() {
      // lazy load tutorial tab youtube vid
      //var isVidLoaded = false;
      var that = this;
      $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        //e.target // activated tab
        console.log("tab activated. e.target:", $(e.target));
        if ($(e.target).text() == 'Tutorial') {
          // lazy load
          console.log("we are on tutorial tab");
          if (!that.isVidLoaded) {
            console.log("lazy loading vid cuz not loaded");
            that.isVidLoaded = true;
            $('#lasersolder-tutorial').html('<iframe style="width:100%;" class="" src="//www.youtube.com/embed/T2h7hagVfnA" frameborder="0" allowfullscreen></iframe>');
          }
        }
        //e.relatedTarget // previous tab
      })

    },
    options: null,
    setupUiFromLocalStorage: function() {
      // read vals from cookies
      var options = localStorage.getItem('com-chilipeppr-widget-touchplate-options');

      if (options) {
        options = $.parseJSON(options);
        console.log("just evaled options: ", options);
      }
      else {
        options = {
          showBody: true,
          frprobe: 25,
          heightplate: 1.75
        };
      }

      // check z
      //if (!('z' in options)) options.z = 1.0;

      this.options = options;
      console.log("options:", options);

      // show/hide body
      if (options.showBody) {
        this.showBody();
      }
      else {
        this.hideBody();
      }

      // setup textboxes
      $('#com-chilipeppr-widget-super-touchplate .frprobe').val(this.options.frprobe);
      $('#com-chilipeppr-widget-super-touchplate .heightplate').val(this.options.heightplate);
      $('#com-chilipeppr-widget-super-touchplate .widthplate').val(this.options.widthplate);
      $('#com-chilipeppr-widget-super-touchplate .lengthplate').val(this.options.lengthplate);

      // attach onchange
      $('#com-chilipeppr-widget-super-touchplate input').change(this.saveOptionsLocalStorage.bind(this));
    },
    saveOptionsLocalStorage: function() {
      //var options = {
      //    showBody: this.options.showBody
      //};

      // grab text vals
      this.options.frprobe = $('#com-chilipeppr-widget-super-touchplate .frprobe').val();
      this.options.heightplate = $('#com-chilipeppr-widget-super-touchplate .heightplate').val();
      this.options.widthplate = $('#com-chilipeppr-widget-super-touchplate .widthplate').val();
      this.options.lengthplate = $('#com-chilipeppr-widget-super-touchplate .lengthplate').val();

      var options = this.options;

      var optionsStr = JSON.stringify(options);
      console.log("saving options:", options, "json.stringify:", optionsStr);
      // store cookie
      localStorage.setItem('com-chilipeppr-widget-touchplate-options', optionsStr);
    },
    showBody: function(evt) {
      $('#com-chilipeppr-widget-super-touchplate .panel-body').removeClass('hidden');
      //$('#com-chilipeppr-widget-touchplate .panel-footer').removeClass('hidden');
      $('#com-chilipeppr-widget-super-touchplate .hidebody span').addClass('glyphicon-chevron-up');
      $('#com-chilipeppr-widget-super-touchplate .hidebody span').removeClass('glyphicon-chevron-down');
      if (!(evt == null)) {
        this.options.showBody = true;
        this.saveOptionsLocalStorage();
      }
    },
    hideBody: function(evt) {
      $('#com-chilipeppr-widget-super-touchplate .panel-body').addClass('hidden');
      //$('#com-chilipeppr-widget-touchplate .panel-footer').addClass('hidden');
      $('#com-chilipeppr-widget-super-touchplate .hidebody span').removeClass('glyphicon-chevron-up');
      $('#com-chilipeppr-widget-super-touchplate .hidebody span').addClass('glyphicon-chevron-down');
      if (!(evt == null)) {
        this.options.showBody = false;
        this.saveOptionsLocalStorage();
      }
    },
    btnSetup: function() {

      // chevron hide body
      var that = this;
      $('#com-chilipeppr-widget-super-touchplate .hidebody').click(function(evt) {
        console.log("hide/unhide body");
        if ($('#com-chilipeppr-widget-super-touchplate .panel-body').hasClass('hidden')) {
          // it's hidden, unhide
          that.showBody(evt);
        }
        else {
          // hide
          that.hideBody(evt);
        }
      });

      $('#com-chilipeppr-widget-super-touchplate .btn-toolbar .btn').popover({
        delay: 500,
        animation: true,
        placement: "auto",
        trigger: "hover",
        container: 'body'
      });

    },
    statusEl: null, // cache the status element in DOM
    status: function(txt) {
      console.log("status. txt:", txt);
      if (this.statusEl == null) this.statusEl = $('#com-chilipeppr-widget-touchplate-status');
      var len = this.statusEl.val().length;
      if (len > 30000) {
        console.log("truncating status area text");
        this.statusEl.val(this.statusEl.val().substring(len - 5000));
      }
      this.statusEl.val(this.statusEl.val() + txt + "\n");
      this.statusEl.scrollTop(
        this.statusEl[0].scrollHeight - this.statusEl.height()
      );
    },
    forkSetup: function() {
      var topCssSelector = '#com-chilipeppr-widget-super-touchplate';

      $(topCssSelector + ' .panel-title').popover({
        title: this.name,
        content: this.desc,
        html: true,
        delay: 200,
        animation: true,
        trigger: 'hover',
        placement: 'auto'
      });

      var that = this;
      chilipeppr.load("http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", function() {
        require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
          pubsubviewer.attachTo($('#com-chilipeppr-widget-super-touchplate .panel-heading .dropdown-menu'), that);
        });
      });

    },
    threeObj: {
      "camera": {
        "metadata": {
          "version": 4.3,
          "type": "Object",
          "generator": "ObjectExporter"
        },
        "object": {
          "uuid": "89F03B7D-AC02-43DF-848A-5771EB767F8C",
          "type": "PerspectiveCamera",
          "name": "Camera",
          "fov": 25,
          "aspect": 2.3550724637681157,
          "near": 0.1,
          "far": 100000,
          "matrix": [1, 0, 0, 0, 0, 1, -0.37076497077941895, 0, 0, 0.3707689046859741, 1, 0, -3.414, 37, 61, 1]

        }
      },
      "scene": {
        "metadata": {
          "version": 4.3,
          "type": "Object",
          "generator": "ObjectExporter"
        },
        "geometries": [{
          "uuid": "7D488A1C-8C25-4F9D-9963-D0800B9ABB46",
          "type": "BoxGeometry",
          "width": 5,
          "height": 0.8,
          "depth": 5,
          "widthSegments": 0,
          "heightSegments": 0,
          "depthSegments": 0
        }, {
          "uuid": "1A583147-F380-454E-BAF3-646CB918E861",
          "type": "BoxGeometry",
          "width": 5,
          "height": 1,
          "depth": 1,
          "widthSegments": 0,
          "heightSegments": 0,
          "depthSegments": 0
        }, {
          "uuid": "C249AD9E-1978-42DC-A389-65BE0BAC6985",
          "type": "BoxGeometry",
          "width": 1,
          "height": 1,
          "depth": 5.5,
          "widthSegments": 0,
          "heightSegments": 0,
          "depthSegments": 0
        }, {
          "uuid": "4601A1C8-537C-4551-BD1D-4C5AF434C3CB",
          "type": "PlaneGeometry",
          "width": 5000,
          "height": 5000,
          "widthSegments": 1,
          "heightSegments": 1
        }, {
          "uuid": "50DB6DF6-4923-441C-AE63-92D3A94EAEEC",
          "type": "CylinderGeometry",
          "radiusTop": 2,
          "radiusBottom": 2,
          "height": 10,
          "radialSegments": 32,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "E52C9CE5-1054-4953-87BD-2CD5640D756E",
          "type": "CylinderGeometry",
          "radiusTop": 6,
          "radiusBottom": 4,
          "height": 2,
          "radialSegments": 32,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "5DA49C1D-243E-44BC-B9ED-3D451DC46576",
          "type": "CylinderGeometry",
          "radiusTop": 6,
          "radiusBottom": 6,
          "height": 5,
          "radialSegments": 32,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "7FC7C6E9-AB7B-4B04-8BE1-13C810B7A639",
          "type": "CylinderGeometry",
          "radiusTop": 10,
          "radiusBottom": 9.08,
          "height": 1,
          "radialSegments": 64,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "93672A9F-6465-4F99-91AF-3CE40984F939",
          "type": "CylinderGeometry",
          "radiusTop": 10,
          "radiusBottom": 10,
          "height": 100,
          "radialSegments": 64,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "AC65F2CF-EBFF-4EC9-A4EF-F9FCB356E78F",
          "type": "CylinderGeometry",
          "radiusTop": 18,
          "radiusBottom": 18,
          "height": 20,
          "radialSegments": 64,
          "heightSegments": 1,
          "openEnded": false
        }, {
          "uuid": "8EB2C68D-5127-417B-94B1-E5B428D39B58",
          "type": "CylinderGeometry",
          "radiusTop": 15,
          "radiusBottom": 15,
          "height": 10,
          "radialSegments": 64,
          "heightSegments": 1,
          "openEnded": false
        }],
        "materials": [{
          "uuid": "D963E6DA-A503-450E-B082-F17EE56A0E75",
          "type": "MeshPhongMaterial",
          "color": 16777215,
          "ambient": 16777215,
          "emissive": 6184542,
          "specular": 1118481,
          "shininess": 30,
          "opacity": 0.5
        }, {
          "uuid": "BE00593A-F38B-48E1-9219-66CC5B0C81DF",
          "type": "MeshPhongMaterial",
          "color": 16777215,
          "ambient": 16777215,
          "emissive": 0,
          "specular": 1118481,
          "shininess": 30
        }, {
          "uuid": "DE09C011-C3E2-4D2D-986C-D7EA95C3F99F",
          "type": "MeshPhongMaterial",
          "color": 16777215,
          "ambient": 16777215,
          "emissive": 0,
          "specular": 1118481,
          "shininess": 30
        }, {
          "uuid": "0193A44A-30D0-4B28-BB6A-75652B7716E5",
          "type": "MeshPhongMaterial",
          "color": 16777215,
          "ambient": 16777215,
          "emissive": 0,
          "specular": 1118481,
          "shininess": 30
        }, {
          "uuid": "D20E89D8-E7FF-4152-B666-46CBDB913FAC",
          "type": "MeshPhongMaterial",
          "color": 8292740,
          "ambient": 16777215,
          "emissive": 131340,
          "specular": 1118481,
          "shininess": 30,
          "opacity": 0.8
        }, {
          "uuid": "3E27D340-2002-48B3-A3CB-62DB72D1E1A6",
          "type": "MeshPhongMaterial",
          "color": 11974326,
          "ambient": 16777215,
          "emissive": 5395026,
          "specular": 1118481,
          "shininess": 30
        }],
        "object": {
          "uuid": "31517222-A9A7-4EAF-B5F6-60751C0BABA3",
          "type": "Scene",
          "name": "Scene",
          "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          "children": [{
            "uuid": "CB134A1B-D27A-4509-A4C7-971458B9D412",
            "type": "SpotLight",
            "name": "SpotLight 1",
            "color": 16777215,
            "intensity": 1,
            "distance": 0,
            "angle": 0.874,
            "exponent": 10,
            "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 200, 150, 1]
          }, {
            "uuid": "65E528E3-190E-4679-A254-1692F2237593",
            "type": "Mesh",
            "name": "Plane 3",
            "geometry": "4601A1C8-537C-4551-BD1D-4C5AF434C3CB",
            "material": "D963E6DA-A503-450E-B082-F17EE56A0E75",
            "matrix": [1, 0, 0, 0, 0, 0.0002963267907034606, -0.9999999403953552, 0, 0, 0.9999999403953552, 0.0002963267907034606, 0, 0, 0, 0, 1]
          }, {
            "uuid": "0D3032BA-5923-4B8F-BA26-4E45525DB3D1",
            "type": "Group",
            "name": "GroupSpindle",
            "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            "children": [{
              "uuid": "768EAB11-0588-4690-A053-E6F9C5BB87E0",
              "type": "Mesh",
              "name": "Endmill",
              "geometry": "50DB6DF6-4923-441C-AE63-92D3A94EAEEC",
              "material": "BE00593A-F38B-48E1-9219-66CC5B0C81DF",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 18.510000228881836, 0, 1]
            }, {
              "uuid": "6CD932C4-5C71-404B-B0FB-5B7879388F2E",
              "type": "Mesh",
              "name": "ColletTaper",
              "geometry": "E52C9CE5-1054-4953-87BD-2CD5640D756E",
              "material": "DE09C011-C3E2-4D2D-986C-D7EA95C3F99F",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 22.6299991607666, 0, 1]
            }, {
              "uuid": "C4D75B11-5EC3-4267-AAA5-B62DC2DD6507",
              "type": "Mesh",
              "name": "Collet",
              "geometry": "5DA49C1D-243E-44BC-B9ED-3D451DC46576",
              "material": "0193A44A-30D0-4B28-BB6A-75652B7716E5",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 26, 0, 1]
            }, {
              "uuid": "84DECC53-67F7-4707-B9EC-F26F5FBDBC28",
              "type": "Mesh",
              "name": "SpindleBaseTaper",
              "geometry": "7FC7C6E9-AB7B-4B04-8BE1-13C810B7A639",
              "material": "D20E89D8-E7FF-4152-B666-46CBDB913FAC",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 29, 0, 1]
            }, {
              "uuid": "329C2A35-C121-489E-86D8-86B8426A4726",
              "type": "Mesh",
              "name": "SpindleBase",
              "geometry": "93672A9F-6465-4F99-91AF-3CE40984F939",
              "material": "D20E89D8-E7FF-4152-B666-46CBDB913FAC",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 79.5, 0, 1]
            }]
          }, {
            "uuid": "B0F9BB34-C502-46B6-A34E-BB374743DFCB",
            "type": "Group",
            "name": "GroupTouchPlate",
            "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            "children": [{
              "uuid": "F489E92A-EE90-48AC-88AF-4867D7049272",
              "type": "Mesh",
              "name": "TouchPlateOuter",
              "geometry": "AC65F2CF-EBFF-4EC9-A4EF-F9FCB356E78F",
              "material": "D20E89D8-E7FF-4152-B666-46CBDB913FAC",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            }, {
              "uuid": "B38B19B8-5E6A-4EAB-89B5-998A8B10BD7A",
              "type": "Mesh",
              "name": "TouchPlateMetal",
              "geometry": "8EB2C68D-5127-417B-94B1-E5B428D39B58",
              "material": "3E27D340-2002-48B3-A3CB-62DB72D1E1A6",
              "matrix": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 6.119999885559082, 0, 1]
            }]
          }]
        }
      },
      "scripts": {}
    },
  }
});
