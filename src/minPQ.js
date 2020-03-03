export default function MinPQ() {
  this.values = [];
  this.enqueue = function(val) {
    this.values.push(val);
  }

  this.getMinIndex = function() {
    if (this.values.length > 0) {
      let min = this.values[0].cost;
      let mindex = 0;
      for (let i = 1; i < this.values.length; i++) {
        if (this.values[i].cost < min) {
          min = this.values[i].cost;
          mindex = i;
        }
      }
      return mindex;
    }
    return -1
  }

  this.dequeue = function() {
    let idx = this.getMinIndex();
    return this.values.splice(idx, 1)[0];
  }

  this.getLength = function() {
    return this.values.length;
  }

  this.isEmpty = function() {
    return this.values.length == 0;
  }
}
