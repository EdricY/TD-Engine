import Unit from "./unit";
import { getField, pathExists } from "./flowfield.js";
import { map, mapContains, MAP_H, MAP_W } from "./getMap"
import { W, B, S } from "./constants"

var body = document.getElementById('body');
var startBtn = document.getElementById('start-btn');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d')
var keys = {};
var done = false;

var startPos = {j: 0, i: 0};
var finishPos = {j: MAP_W-1, i: MAP_H-1};

canvas.width = W;
canvas.height = W;

var player = {
  units: []
}

window.player = player; //for debug

var field;
startBtn.addEventListener("click", function() {
  for (let i = 0; i < 8; i++) {
    let x = Math.floor((Math.random() + startPos.j) * B)
    let y = Math.floor((Math.random() + startPos.i) * B)
    player.units.push(new Unit(x, y, 8, field))
  }
});

function getColor(n){
  if (n == 0) return "black"
  if (n == 1) return "red"
  return 'white'
}


function draw() {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, W, W);
  ctx.strokeStyle = "#555";

  for (let i = 0; i < S; i ++) {
    for (let j = 0; j < S; j ++) {
      // if (map[i][j] === 0) continue;
      let color = getColor(map[i][j]);
      ctx.fillStyle = color;
      ctx.fillRect(j*B, i*B, B, B);
      ctx.strokeRect(j*B, i*B, B, B);
    }
  }

  if (field) drawField(ctx, field)

  player.units.forEach(unit => unit.draw(ctx));

}


function drawField(ctx, field) {
  for (let i = 0; i < S; i ++) {
    for (let j = 0; j < S; j ++) {
      if (!field[i][j]) continue
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      let cx = j*B + B/2
      let cy = i*B + B/2
      // ctx.moveTo(cx, cy);
      // ctx.lineTo(cx + 10*field[i][j].x, cy + 10*field[i][j].y);
      // ctx.lineTo(cx - 3*field[i][j].y, cy + 3*field[i][j].x);
      // ctx.lineTo(cx + 10*field[i][j].x, cy + 10*field[i][j].y);
      // ctx.lineTo(cx + 3*field[i][j].y, cy - 3*field[i][j].x);

      ctx.moveTo(cx - B/8*field[i][j].y, cy + B/8*field[i][j].x);
      ctx.lineTo(cx + B/4*field[i][j].x, cy + B/4*field[i][j].y);
      ctx.lineTo(cx + B/8*field[i][j].y, cy - B/8*field[i][j].x);


      ctx.stroke();
    }
  }
}

function update() {
  player.units.forEach(unit => unit.update());
  nudgeUnits(player.units);
}

function tick(t) {
  draw();
  update();
  if (!done) requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

const nudgeFactor = .2;
function nudgeUnits(units) {
  for (let i = 0; i < units.length; i++) {
    let u1 = units[i];
    for (let j = i+1; j < units.length; j++) {
      let u2 = units[j];
      let dx = u2.x - u1.x;
      if (Math.abs(dx) > B) continue;
      let dy = u2.y - u1.y;
      if (Math.abs(dy) > B) continue;
      //do nudge;
      let nx = Math.sign(dx) * (B-Math.abs(dx));
      let ny = Math.sign(dy) * (B-Math.abs(dy));
      u2.vx += nudgeFactor * nx;
      u2.vy += nudgeFactor * ny;
      u1.vx -= nudgeFactor * nx;
      u1.vy -= nudgeFactor * ny;
    }
  }
}

function getUnit(player, x, y) {
  for (let unit of player.units) {
    if (unit.contains(x, y)){
      return unit;
    }
  }
  return null;
}

canvas.onmousedown = function(e) {
  keys[e.button] = true;
  let x = Math.round(getCanvasPosition(e.offsetX));
  let y = Math.round(getCanvasPosition(e.offsetY));
  let i = Math.floor(y/B);
  let j = Math.floor(x/B);
  
  if (e.button === 0) {
    //select unit
    let unit = getUnit(player, x, y);
    if (unit !== null) {
      unit.selected = true;
      return;
    }
    
    //add wall
    if (mapContains(i,j)) {
      map[i][j] = 1;
     triggerMapChanged()

    }
  } else if (e.button === 2){
    if (mapContains(i,j)) {
      map[i][j] = 0;
     triggerMapChanged()
    }
  }
}

canvas.onmousemove = function(e) {
  let x = Math.round(getCanvasPosition(e.offsetX));
  let y = Math.round(getCanvasPosition(e.offsetY));
  let i = Math.floor(y/B);
  let j = Math.floor(x/B);
  if (keys[0] == true) {
    if (mapContains(i,j)) {
      map[i][j] = 1;
    }
    triggerMapChanged()
  }
  else if (keys[2] == true) {
    if (mapContains(i,j)) {
      map[i][j] = 0;
    }
    triggerMapChanged()
  }
}


var mapTimeout = setTimeout(mapChanged, 0);
function triggerMapChanged() {
  clearTimeout(mapTimeout);
  mapTimeout = setTimeout(mapChanged, 100);
}

const pathExistsSpan = document.getElementById("path-exists-span");
function mapChanged() {
  field = getField(finishPos.i, finishPos.j);
  pathExistsSpan.innerText = pathExists(field, startPos.i, startPos.j)
}

window.onmouseup = function(e) {
  keys[e.button] = false;
}

canvas.oncontextmenu = function(e) {
  e.preventDefault()
}

function getCanvasPosition(clientPos) {
  let ratio = canvas.width / canvas.clientWidth;
  return Math.round(clientPos * ratio);
}

window.onresize = function(e) {
  canvas.width = W;
  canvas.height = W;
}

window.onkeydown = function (e) {
  keys[e.keyCode] = true;
}

window.onkeyup = function (e) {
  keys[e.keyCode] = false;
}
