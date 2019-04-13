//global variable setting
var count;
var pq;
var root;
//size of the board 
var BSIZE = 3;
var MAX = BSIZE * BSIZE - 1;
//leave counter for generating the tree
//reason not using recursive is that recursive require more resource than just a for loop.
//However for loop is not asyn, so the ui will stucked during looping utill the solution is found or the loopTime is met.
var loopTime = 10000*BSIZE*BSIZE;// the looping times of the gameTree search
class Node {
    constructor(arr, manha, parent, depth) {
        this.arr = arr;
        this.manha = manha;
        this.child = [];
        this.parent = parent;
        this.depth = depth;
    }
}

class PQ {
    constructor() {
        this.queue = [];
    }
    add(qNode) {
        if (this.queue.length == 0) {
            this.queue.push(qNode);
        } else {
            var element;
            if (this.queue.length == 1) {
                if (qNode.manha < this.queue[0].manha)
                    this.queue.unshift(qNode);
                else
                    this.queue.push(qNode);
            } else {
                for (let i = 0; i < this.queue.length; i++) {
                    element = this.queue[i];
                    if (qNode.manha < element.manha) {
                        this.queue.splice(i, 0, qNode);
                        return;
                    }
                }
                this.queue.push(qNode); //console.log("add to tail");
            }
        }
    }
    popP() {
        var lowest = this.queue[0];
        this.queue.forEach(element => {
            if (element.manha < lowest.manha)
                lowest = element;
        });
        return lowest;
    }
}
class Board {
    constructor(x) {
        this.size = x;
        this.num = x * x - 1;
        this.board = new Array((this.num + 1));
        this.uiGoal = [];
        this.uiBoard = [];
        //create the board and the checking list
        for (var index = 0; index < this.board.length - 1; index++) {
            this.board[index] = index + 1;
        }
        this.board[this.num] = 0;
        this.goal = this.board.slice();
        this.uiGoal = this.board.slice();//for the show the goal grid 
    }
    randPermin() {
        var a, b; // index of the array
        for (let i = 0; i < this.num; i++) {
            a = Math.floor(Math.random() * (this.num + 1));
            b = Math.floor(Math.random() * (this.num + 1));
            var temp = this.uiGoal[a];
            this.uiGoal[a] = this.uiGoal[b];
            this.uiGoal[b] = temp;
            
        }
        do {
            for (let i = 0; i < this.num; i++) {
                a = Math.floor(Math.random() * (this.num + 1));
                b = Math.floor(Math.random() * (this.num + 1));
                var temp = this.board[a];
                this.board[a] = this.board[b];
                this.board[b] = temp;
            }
            //console.log(this.board);
        } while (!this.isSolvable());
        this.uiBoard = this.board.slice();
        //this.board = [0,1,3,4,2,5,7,8,6]; simple case
        //this.board = [8,6,7,2,5,4,3,0,1]//hard 8 puzzle
        //this.board = [1,2,3,4,5,6,8,7,0];//false case
        //this.board = [7,4,3,12,13,0,10,5,6,1,9,2,14,8,15,11]; //4x4 puzzle
        //this.board = [6, 5, 3, 1, 8, 4, 0, 7, 2];
    }
    isSolvable() {
        var arr = this.board.slice();
        var x = arr.indexOf(0);
        arr.splice(x, 1);
        var inversion = 0;
        //console.log(arr);
        for (var i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j])
                    inversion++;
            }
        }
        //console.log("%sX%s inversion:%s blank_block_row:%s", BSIZE, BSIZE, inversion, parseInt(x / BSIZE) + 1);
        if ((MAX) % 2 == 0)
            return ((inversion % 2) == 0);
        else if ((parseInt(x / BSIZE)) % 2 == 0) {
            return (inversion % 2 == 1)
        } else
            return (inversion % 2 == 0)
    }

    isGoal() {
        for (let index = 0; index < this.goal.length; index++) {
            if (this.goal[index] != this.board[index])
                return false;
        }
        return true;
    }

    goalState(arr) {
        for (var index = 0; index < this.goal.length; index++) {
            if (this.goal[index] != arr[index]) {
                return false;
            }
        }
        return true;
    }
    drawGrid() {
        var g = document.getElementById("grid");
        var tr = "";
        for (let i = 0; i < BSIZE; i++) {
            tr += "<tr id='r" + i + "'>"
            for (let j = 0; j < BSIZE; j++) {
                tr += "<td id='c" + j + "' onclick='move("+ (i * BSIZE + j) +")'>" + (this.board[i * BSIZE + j] === 0 ? '' : this.board[i * BSIZE + j]) + "</td>";
            }
            tr += "</tr>";
        }
        g.innerHTML = tr;
    }
    gameTree() {
        count = 0;
        var empty = this.board.indexOf(0);
        var manha, node;
        var depth = 0;
        manha = this.manhattanG(this.board);
        root = new Node(this.board.slice(), manha, null, depth);
        pq = new PQ();
        if (this.goalState(root.arr)) {
            return root;
        }
        count++;
        var up = (empty - BSIZE >= 0) ? empty - BSIZE : -1;
        var down = (empty + BSIZE <= MAX) ? empty + BSIZE : -1;
        var left = (empty % BSIZE != 0) ? empty - 1 : -1;
        var right = (empty % BSIZE != BSIZE - 1) ? empty + 1 : -1;
        var arr = [up, down, left, right];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != -1) {
                this.swap(empty, arr[i]);
                manha = this.manhattanG(this.board.slice()) + depth+1;
                node = new Node(this.board.slice(), manha, root, root.depth + 1)
                root.child.push(node);
                pq.add(node);
                this.swap(empty, arr[i]);
                count++;
            }
        }
        //return this.gameTreeR();
        return this.loopGameTree();
    }
    loopGameTree() {
        var ans;
        var cnode;
        for (let index = 0; index < loopTime; index++) {
            cnode = pq.queue.shift(); // remove first node in p queue
            if (this.goalState(cnode.arr)) {
                return cnode;
            }
            count++;
            var manha, node;
            var empty = cnode.arr.indexOf(0);
            manha = cnode.manha;
            var up = (empty - BSIZE >= 0) ? empty - BSIZE : -1;
            var down = (empty + BSIZE <= MAX) ? empty + BSIZE : -1;
            var left = (empty % BSIZE != 0) ? empty - 1 : -1;
            var right = (empty % BSIZE != (BSIZE - 1)) ? empty + 1 : -1;
            var arr = [up, down, left, right];
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] != -1) {
                    if (arr[i] == cnode.parent.arr.indexOf(0)) {
                        //console.log(arr[i],cnode.parent.arr.indexOf(0));
                        continue;
                    }
                    this.swapArr(cnode.arr, arr[i], empty);
                    manha = this.manhattanG(cnode.arr) + cnode.depth+1;
                    node = new Node(cnode.arr.slice(), manha, cnode, cnode.depth + 1);
                    this.swapArr(cnode.arr, arr[i], empty);
                    cnode.child.push(node);
                    pq.add(node);
                    count++;
                }
            }
            //console.log(index);
        }
        return cnode;
    }
    //recursive work to get goal A* search
    gameTreeR() {
        var cnode = pq.queue.shift(); // remove first node in p queue
        //var cnode = pq.popP();
        if (this.goalState(cnode.arr)) {
            return cnode;
        }
        count++;
        var manha, node;
        var empty = cnode.arr.indexOf(0);
        manha = cnode.manha;
        var up = (empty - BSIZE >= 0) ? empty - BSIZE : -1;
        var down = (empty + BSIZE <= MAX) ? empty + BSIZE : -1;
        var left = (empty % BSIZE != 0) ? empty - 1 : -1;
        var right = (empty % BSIZE != (BSIZE - 1)) ? empty + 1 : -1;
        var arr = [up, down, left, right];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] != -1) {
                if (arr[i] == cnode.parent.arr.indexOf(0)) {
                    //console.log(arr[i],cnode.parent.arr.indexOf(0));
                    continue;
                }
                this.swapArr(cnode.arr, arr[i], empty);
                manha = this.manhattanG(cnode.arr) + cnode.depth * cnode.depth;
                node = new Node(cnode.arr.slice(), manha, cnode, cnode.depth + 1);
                this.swapArr(cnode.arr, arr[i], empty);
                cnode.child.push(node);
                pq.add(node);
                count++;
            }
        }
        return this.gameTreeR();
    }
    manhattanG(arr) {
        var sum = 0;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == 0)
                continue;
            else
                sum += this.manhattanGS(arr, i);
        }
        return sum;
    }
    // zeroPost(arr,index){
    //     var val = 9;
    //     var x1= Math.floor((val-1)/BSIZE); var y1 = (val-1)%BSIZE;
    //     var x2= Math.floor(index/BSIZE); var y2 = index%BSIZE;
    //     return this.different(x1,x2)+this.different(y1,y2);
    // }
    manhattanGS(arr, index) {
        var val = arr[index];
        var x1 = Math.floor((val - 1) / BSIZE);
        var y1 = (val - 1) % BSIZE;
        var x2 = Math.floor(index / BSIZE);
        var y2 = index % BSIZE;
        return this.different(x1, x2) + this.different(y1, y2);
    }
    swapArr(arr, a, b) {
        var temp = arr[a];
        arr[a] = arr[b];
        arr[b] = temp;
    }
    swap(a, b) {
        var temp = this.board[a];
        this.board[a] = this.board[b];
        this.board[b] = temp;
    }
    different(a, b) {
        if (a > b)
            return a - b;
        return b - a;
    }

}

