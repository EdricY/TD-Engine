import { map, MAP_H, MAP_W, mapContains, getHeight } from "./getMap";
import MinPQ from "./minPQ";
import { diagUnit } from "./constants";

//map = map ? map : [[]];

// fields = []
// let startgenfield = Date.now();
// for (let i = 0; i < map.length; i ++) {
//   fields.push([])
//   for (let j = 0; j < map[0].length; j ++) {
//     fields[i].push(generateFlowField(i,j));
//   }
// }
// console.log('took:', Date.now()-startgenfield)

//TODO: class instead of function
function PFNode(i, j, fromNode) {
  this.i = i;
  this.j = j;
  this.cost = 0;
  this.fromNode = fromNode;
  this.v = {x:0, y:0};
  
  if (fromNode && map[i][j] == 0) {
      this.v = {
        x: fromNode.j - this.j,
        y: fromNode.i - this.i
      };
      if (isDiagTo(this, fromNode)) {
        this.v.x *= diagUnit;
        this.v.y *= diagUnit;
    } // else keep v from above
    this.cost = computeTravelCost(fromNode.i, fromNode.j, this.i, this.j);
    this.cost += fromNode.cost;
  }

  this.compareTo = function(that) {
    let c0 = this.cost;
    let c1 = that.cost;
    if (c0 < c1) return -1;
    if (c0 > c1) return 1;
    return 0;
  }

  this.addNeighbor = function(addI, addJ, list) {
    let ni = this.i + addI;
    let nj = this.j + addJ;
    if(!mapContains(ni, nj)) return; //out of bounds
    list.push(new PFNode(ni ,nj, this));
  }
  
  this.neighbors = function() {
    let list = [];
    // add N,E,S,W
    this.addNeighbor( 0, -1, list);
    this.addNeighbor( 1,  0, list);
    this.addNeighbor( 0,  1, list);
    this.addNeighbor(-1,  0, list);
  
    // add NW,NE,SW,SE corners
    this.addNeighbor(-1, -1, list);
    this.addNeighbor( 1, -1, list);
    this.addNeighbor(-1,  1, list);
    this.addNeighbor( 1,  1, list);
  
    return list;
  }

}

function isDiagTo (a, b) {
  if (a.i == b.i) return false;
  if (a.j == b.j) return false;
  return true; //could wrongly give true, but shouldn't at this point;
}

/*
 * @deprecated Since not needed
 */
function getAngle(i0, j0, i1, j1) {
  let di = i1 - i0;
  let dj = j1 - j0;
  let angle = Math.atan(dj/di);
  if (di < 0) {
    angle -= Math.PI;
  }
  return angle;
}

function computeDistance(i0, j0, i1, j1) {
  return Math.sqrt((i0 - i1) * (i0 - i1) + (j0 - j1) * (j0 - j1));
}

function computeTravelCost(i0, j0, i1, j1) {
  let h0 = getHeight(i0, j0);
  let h1 = getHeight(i1, j1);
  let hd = Math.abs(h0 - h1);
  let dist = (hd * 1000) + computeDistance(i0 ,j0, i1, j1);
  return dist;
}

//i and j of target
function generateFlowField(i, j) {
  let field = [];
  for (let j = 0; j < map.length; j++) {
    field.push([])
    for (let i = 0; i < map[0].length; i++) {
      field[j].push(null);
    }
  }  
  let mpq = new MinPQ();
  let root = new PFNode(i, j, null);
  mpq.enqueue(root);
  while (!mpq.isEmpty()) {
    let current = mpq.dequeue();
    if (map[current.i][current.j] !== 0) continue; //exclude blocked paths in field
    if (field[current.i][current.j] != null) continue //traversal already reached this map position
    field[current.i][current.j] = current.v;
    //add neigbors
    let ns = current.neighbors();
    for (let n of ns) {
      if (field[n.i][n.j] == null){
        mpq.enqueue(n);
      }
    }
  }

  return field;
}

//i and j of target
export function getField(i, j) {
  //if possible, pre-generate instead or use lookup table instead
  return generateFlowField(i, j);
}

//TODO: maybe make flowfield class?

//check if you can reach target from given i and j 
export function pathExists(field, i, j) {
  if (map[i][j] !== 0) return false;
  return field[i][j] != null;
}