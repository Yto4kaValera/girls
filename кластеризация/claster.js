let canvas;
let context;
canvas = document.getElementById('canvas');
context = canvas.getContext('2d');

let points = [];

function makeDot(x, y) {
    x = Number(x);
    y = Number(y);
    return {x, y};
}

function distanse(dot1, dot2){
    return Math.pow(dot1.x-dot2.x, 2)+Math.pow(dot1.y-dot2.y, 2);
}

function newCenter(n, k, points, centroids){
    for (let i = 1; i < k; i++) {
        let distances = new Array(n).fill(0);
        let totalDist = 0;

        for (let j = 0; j < n; j++) {
            let minDist = Number.MAX_VALUE;
            for (let k = 0; k < i; k++) {
                let dist = distanse(points[j], centroids[k]);
                minDist = Math.min(dist, minDist);
            }
            distances[j] = Math.pow(minDist, 2);
            totalDist += distances[j];
        }

        let r = Math.floor(Math.random() * totalDist);
        let cumulative = 0;
        for (let j = 0; j < n; j++) {
            cumulative+= distances[j];
            if (cumulative>=r){
                centroids[i] = {x:points[j].x, y:points[j].y};
                break;
            }
        }
    }
}

function kMeans(points, k){
    let n = points.length;
    let centroids = new Array(k);
    let labels = new Array(n).fill(-1);

    let randIndex = Math.floor(Math.random() * n);
    centroids[0] = { x: points[randIndex].x, y: points[randIndex].y };
    newCenter(n, k, points, centroids);

    let changed;
    for (let count = 0; count < 200; count++) {
        changed = false;

        for (let i = 0; i < n; i++) {
            let minDist = Number.MAX_VALUE;
            let bestCluster = -1;

            for (let j = 0; j < k; j++) {
                let dist = distanse(points[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    bestCluster = j;
                }
            }

            if (labels[i] !== bestCluster) {
                labels[i] = bestCluster;
                changed = true;
            }
        }

        if (!changed) break;

        let newCentroids = [];
        for (let i = 0; i < k; i++) {
            newCentroids.push({ x: 0, y: 0 });
        }
        let count = new Array(k).fill(0);

        for (let i = 0; i < n; i++) {
            newCentroids[labels[i]].x += points[i].x;
            newCentroids[labels[i]].y += points[i].y;
            count[labels[i]]++;
        }

        for (let j = 0; j < k; j++) {
            if (count[j] > 0){
                centroids[j].x = newCentroids[j].x/count[j];
                centroids[j].y = newCentroids[j].y/count[j];
            }
        }
    }

    return {labels: labels};
}

canvas.addEventListener('click', function(e) {
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;
    points.push(makeDot(x, y));
    draw(x, y, 'white');
});

function draw(x, y, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, 7, 0, Math.PI*2);
    context.fill();
}

function runClust() {
    if (points.length === 0) return;

    let k = 3;
    let res = kMeans(points, k);
    let {labels} = res;

    let colors = ['Crimson', 'HotPink', 'SlateBlue'];

    for (let i = 0; i < points.length; i++) {
        draw(points[i].x, points[i].y, colors[labels[i] % colors.length]);
    }
}
