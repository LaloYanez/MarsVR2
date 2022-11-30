const scene = document.querySelector('a-scene');
const loading = document.getElementById('loading');
const marsbg = document.getElementById('marsbg');
const startbtn = document.getElementById('startbtn');
let introplaying = true;

function showbtn() {
  startbtn.innerHTML = "ENTER";
  startbtn.style.display = "block";
  startbtn.style.pointerEvents = "all";
  startbtn.style.color = "#ffffff";
}

function playintro() {
  const sndintro = document.getElementById("intro").components.sound;   
  sndintro.playSound();
}

function introended() {
  introplaying = false;
}

function startexp() {
  loading.classList.toggle('hide');
  marsbg.classList.toggle('hide');
  loading.style.pointerEvents = "none";
  startbtn.style.pointerEvents = "none";
  const selection = document.getElementById("selection").components.sound;
  selection.playSound();
  const ambient = document.getElementById("ambient").components.sound;
  ambient.playSound();
  setTimeout(playintro, 2500);
  setTimeout(introended, 50500);
}

if (scene.hasLoaded) {
  showbtn();
} else {
  scene.addEventListener('loaded', showbtn);
}

function goscreen2(){
  const screen1 = document.getElementById("screen1");
  const screen2 = document.getElementById("screen2");
  screen1.style.display = "none";
  screen2.style.display = "block";
}

const stickleft = document.getElementById("stickleft");
const stickright = document.getElementById("stickright");
const thecamera = document.getElementById("droneobject");

let newrotation;
let camerarotation;
let currentrotation;
let rotationcount = 0;
let turning = 2;
let currentspeed = .2;
const el = this.el,
    data = this.data;

let elevationspeed = .1;
let cameraposition;
let newposition;
let currentposition;
let elevation = 0;

let resetdrone = true;