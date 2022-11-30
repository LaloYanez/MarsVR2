AFRAME.registerComponent("screen-controls", {
  schema: {
    speedlimiter: {default: 1.5},
    tiltSpeed: {default: 5},
    elevation: {default: 0},
  },
  
  init: function () {
    this.component = document.getElementById("droneobject").components["extended-wasd-controls"];
    this.joystick1 = new Joystick("stick1", 64, 8);
    this.joystick2 = new JoystickVR2("stick2vr", 64, 8);
    console.log("Controls initialized");
  },

  tick: function (time, deltaTime) {
    const el = this.el,
        data = this.data;    
    
    const dronemodel = document.getElementById("droneobject")
    const droneui = document.getElementById("droneui");
    const rig = document.getElementById("rig");    
    const dronemap = document.getElementById("dronemap");
    let dotpos = .0027 * dronemodel.object3D.position.y;
    let mapposx = rig.object3D.position.x / 1000;
    let mapposz = rig.object3D.position.z / 1000;
    
    this.component.movePercent.y = data.elevation;
    this.component.movePercent.x = this.joystick1.value.x * data.speedlimiter;
    this.component.movePercent.z = -this.joystick1.value.y * data.speedlimiter;
    this.component.rotatePercent.z = -this.joystick1.value.x * 5;
    this.component.rotatePercent.x = this.joystick1.value.y * 5;
    droneui.object3D.position.y = dotpos;
    dronemap.object3D.position.y = mapposx;
    dronemap.object3D.position.x = mapposz;
    
        
    if (this.joystick1.active == true) {
      resetdrone = false;
    }
    
    if (this.joystick1.active == false) {
      resetdrone = true;
    }
    if (this.joystick2.active == true) {      
      this.component.movePercent.y = -this.joystick2.value.y * data.speedlimiter;
    }
  },
});

AFRAME.registerComponent("thumbstick-logging", {
  schema: {
    turn: {default: 5},
  },
  init: function () {
    
    const stickleft = document.getElementById("stickleft");
    const stickright = document.getElementById("stickright");
    
    function resetelevation() {
      document.querySelector("a-scene").setAttribute("screen-controls", "speedlimiter: .8; elevation: 0;");
    }
    
    this.el.addEventListener("thumbstickmoved", this.logThumbstick);
    this.el.addEventListener("thumbsticktouchend", resetelevation);
  },
  
  logThumbstick: function (evt) {
    
    
    if (evt.detail.y > 0.95) {
      document.querySelector("a-scene").setAttribute("screen-controls", "speedlimiter: .8; elevation: -1;");
    }
    if (evt.detail.y < -0.95) {
      document.querySelector("a-scene").setAttribute("screen-controls", "speedlimiter: .8; elevation: 1;");
    }
    if (evt.detail.x < -0.95) {
    }
    if (evt.detail.x > 0.95) {
    }
  },
});

AFRAME.registerComponent("fix", {
  init() {
    const {el} = this
    el.addEventListener("model-loaded", (e) => {
      const texture = el.getObject3D("mesh");
      if (!texture) {
        return;
      }
      texture.traverse((node) => {
        if (node.isMesh) {
          node.frustumCulled = false;
        }
      })
    })
  },
})

AFRAME.registerComponent("logic", {
  schema: {
  },
  init: function () {
    const detector = document.getElementById("droneobject");
    const collider1 = document.getElementById("collider1");
    const collider2 = document.getElementById("collider2");
    const collider3 = document.getElementById("collider3");
    
    const indicator1 = document.getElementById("indicator1");
    const indicator2 = document.getElementById("indicator2");
    const indicator3 = document.getElementById("indicator3");
    
    const base = document.getElementById("base");
    const floor = document.querySelector(".floor");
    const ceiling = document.getElementById("ceiling");
    const rig = document.getElementById("rig");
    const drone1 = document.getElementById("drone1");
    const drone2 = document.getElementById("drone2");
    const drone3 = document.getElementById("drone3");
    
    const arrows = document.getElementById("arrows");
    const arrow1 = document.getElementById("arrow1");
    const arrow2 = document.getElementById("arrow2");
    const arrow3 = document.getElementById("arrow3");
    
    const cant = document.getElementById("cant").components.sound;
    const success = document.getElementById("success").components.sound;
    const message = document.getElementById("message").components.sound; 
    const snda = document.getElementById("a").components.sound;    
    const sndb = document.getElementById("b").components.sound;  
    const sndfound = document.getElementById("found").components.sound;
    
    let prompt = document.getElementById("prompt");
    
    let rings1 = document.querySelector(".rings1");
    let rings2 = document.querySelector(".rings2");
    let rings3 = document.querySelector(".rings3");
    
    let found = 0;
    let found1 = false;
    let found2 = false;
    let found3 = false;
    let timing;
    
    function playfoundsnd() {
      sndfound.playSound();
    }
    
    function playsnda() {
      snda.playSound();
    }
    
    function playsndb() {
      sndb.playSound();
    }
    
    function endgame() {
      console.log("End"); 
      success.playSound();
      prompt.setAttribute("text", "value: Nice work, we found the missing drone!");
      setTimeout(playfoundsnd, 4000);
    }
    
    function bump() {
      detector.object3D.position.z = -2;
      rig.object3D.position.z = -2;
      cant.playSound();
    }
    
    function bumpup() {
      detector.object3D.position.y = .8;
      rig.object3D.position.y = .8;
      console.log("Floor");
      cant.playSound();
      prompt.setAttribute("text", "value: Stay in the air. Lets not crash this one too!");
    }
    
    function bumpdown() {
      detector.object3D.position.y = 215;
    //  rig.object3D.position.y = 216;
      console.log("Ceiling");
      cant.playSound();
      prompt.setAttribute("text", "value: Should not fly any higher, but you already know that.");
    }
    
    function showarrows() {
      arrows.setAttribute("visible", "true");
    }
    
    function showdrones() {
      drone1.setAttribute("visible", "true");
      drone2.setAttribute("visible", "true");
      drone3.setAttribute("visible", "true");
      prompt.setAttribute("text", "value: Not here either, just one more spot to check.");
      message.playSound();
    }
    
    function collision1() {
      if (found1 == false) {
        found1 = true;
        arrow1.setAttribute("scale", "0 0 0");
        found++;
        rings1.setAttribute("animation", "dur: 2000; property: material.opacity; to: 0; loop: 1;");
        collider1.setAttribute("scale", "0 0 0");
        if (found == 3) {
          endgame();
        }
        if (found != 3) {
          if (found == 2) {
            timing = setTimeout(showdrones, 2200);
            console.log("Show Drones");            
            setTimeout(playsndb, 500);
          }
          if (found == 1) {
            prompt.setAttribute("text", "value: Doesnt seem like it crashed here. Lets take flight again and keep looking.");
            message.playSound();
            setTimeout(playsnda, 500);
          }
          indicator1.setAttribute("animation", "dur: 2000; property: scale; to: 0 0 0; loop: 1;");
        }
      }
      console.log("In range");
      console.log(found, found1, found2, found3);
    }
    
    function collision2() {
      if (found2 == false) {
        found2 = true;
        arrow2.setAttribute("scale", "0 0 0");
        found++;
        rings2.setAttribute("animation", "dur: 2000; property: material.opacity; to: 0; loop: 1;");
        collider2.setAttribute("scale", "0 0 0");
        if (found == 3) {
          endgame();
        }
        if (found != 3) {
          if (found == 2) {
            timing = setTimeout(showdrones, 2200);
            console.log("Show Drones");            
            setTimeout(playsndb, 500);
          }
          if (found == 1) {
            prompt.setAttribute("text", "value: Its not around this area. Lets take flight again and keep looking.");
            message.playSound();
            setTimeout(playsnda, 500);
          }
          indicator2.setAttribute("animation", "dur: 2000; property: scale; to: 0 0 0; loop: 1;");
        }
      }
      console.log("In range");
      console.log(found, found1, found2, found3);
    }
    
    function collision3() {
      if (found3 == false) {
        found3 = true;
        arrow3.setAttribute("scale", "0 0 0");
        found++;
        rings3.setAttribute("animation", "dur: 2000; property: material.opacity; to: 0; loop: 1;");
        collider3.setAttribute("scale", "0 0 0");
        if (found == 3) {
          endgame();
        }
        if (found != 3) {
          if (found == 2) {
            timing = setTimeout(showdrones, 2200);
            console.log("Show Drones");
            setTimeout(playsndb, 500);
          }
          if (found == 1) {
            prompt.setAttribute("text", "value: Looks like it is not here. Lets take flight again and keep looking.");
            message.playSound();
            setTimeout(playsnda, 500);
          }
          indicator3.setAttribute("animation", "dur: 2000; property: scale; to: 0 0 0; loop: 1;");
        }
      }
      console.log("In range");
      console.log(found, found1, found2, found3);
    }
    
    collider1.addEventListener("hitstart", collision1);
    collider2.addEventListener("hitstart", collision2);
    collider3.addEventListener("hitstart", collision3);
    base.addEventListener("hitstart", bump);
    floor.addEventListener("hitstart", bumpup);
    ceiling.addEventListener("hitstart", bumpdown);
  },
});

AFRAME.registerComponent("pushup", {
  schema: {
    height: {default: 1},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushup() {      
      detector.object3D.position.y = this.object3D.position.y + data.height;
      console.log("UP");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushup);
    
  },
});

AFRAME.registerComponent("pushback", {
  schema: {
    posz: {default: 1},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
    //  detector.object3D.position.z = this.object3D.position.z + data.posz;
      rig.object3D.position.z = this.object3D.position.z + data.posz;
      console.log("BACK");
      prompt.setAttribute("text", "value: Keep your distance from our base.");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});

AFRAME.registerComponent("wallpushback", {
  schema: {
    posz: {default: -667},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
    //  detector.object3D.position.z = data.posz;
      rig.object3D.position.z = data.posz;
      prompt.setAttribute("text", "value: Lets not waste time going in that direction and head to the areas we narrowed down.");
      console.log("BACK");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});

AFRAME.registerComponent("pushfront", {
  schema: {
    posz: {default: 19},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    let prompt = document.getElementById("prompt");
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    function pushfront() {      
     // detector.object3D.position.z = data.posz;
      rig.object3D.position.z = data.posz;
      prompt.setAttribute("text", "value: Lets not waste time going in that direction and head to the areas we narrowed down.");
      console.log("FRONT");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushfront);
    
  },
});

AFRAME.registerComponent("pushleft", {
  schema: {
    posx: {default: 1},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    let prompt = document.getElementById("prompt");
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
     // detector.object3D.position.x = this.object3D.position.x - data.posx;
      rig.object3D.position.x = this.object3D.position.x - data.posx;
      prompt.setAttribute("text", "value: Keep your distance from our base.");
      console.log("LEFT");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});

AFRAME.registerComponent("pushright", {
  schema: {
    posx: {default: 1},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    let prompt = document.getElementById("prompt");
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
    //  detector.object3D.position.x = this.object3D.position.x + data.posx;
      rig.object3D.position.x = this.object3D.position.x + data.posx;
      prompt.setAttribute("text", "value: Keep your distance from our base.");
      console.log("RIGHT");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});

AFRAME.registerComponent("wallpushleft", {
  schema: {
    posx: {default: 274},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    let prompt = document.getElementById("prompt");
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
    //  detector.object3D.position.x = data.posx;
      rig.object3D.position.x = data.posx;
      prompt.setAttribute("text", "value: Lets not waste time going in that direction and head to the areas we narrowed down.");
      console.log("LEFT");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});

AFRAME.registerComponent("wallpushright", {
  schema: {
    posx: {default: -295},
  },
  init: function () {
    const el = this.el,
        data = this.data;
    const detector = document.getElementById("droneobject");
    const rig = document.getElementById("rig");
    const cant = document.getElementById("cant").components.sound;    
    const sndw1 = document.getElementById("w1").components.sound;    
    const sndw2 = document.getElementById("w2").components.sound;    
    const sndw3 = document.getElementById("w3").components.sound;
    let clip;  
    let prompt = document.getElementById("prompt");
    
    function playwarning() {
      clip = Math.floor(Math.random() * 2);
        if (clip == 0) {
          sndw1.playSound();
          return;
        }
        if (clip == 1) {
          sndw2.playSound();
          return;
        }      
        if (clip == 2) {
          sndw3.playSound();
          return;
        }
    }
    
    function pushback() {      
    //  detector.object3D.position.x = data.posx;
      rig.object3D.position.x = data.posx;
      prompt.setAttribute("text", "value: Lets not waste time going in that direction and head to the areas we narrowed down.");
      console.log("RIGHT");
      cant.playSound();
      if (introplaying == false){
        setTimeout(playwarning, 500);        
      }
    }
    
    this.el.addEventListener("hitstart", pushback);
    
  },
});