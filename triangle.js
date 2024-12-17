const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let points = []; //array of all points
let diameterPoints = []; //array of the two points that form the diameter
let trianglePoints = []; //array of the three corner points of the triangle
let maxDistance = 0; //the maximal distance between two points

//set canvas size to window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

function calculateDiameter() {
    if (points.length > 1) { //there is no diameter if there is only one point
        console.log("Calculating diameter...");
        let maxDistanceChanged = false;
        newestPoint = points[points.length - 1]; // the newest point is the last one that got pushed into the array
        
        for (let i = 0; i < points.length - 1; i++) { // calculates the distance to each point in the array (excluding itself)
            let distance = calculateDistance(points[i], newestPoint)
                if (distance > maxDistance) {
                    console.log("New max distance", distance);
                    diameterPoints[0] = points[i];
                    diameterPoints[1] = newestPoint;
                    maxDistance = distance;
                    maxDistanceChanged = true;
                }
        }

        //no need to redraw the points and diameter if the maximal distance didn't change
        if (maxDistanceChanged) {
            console.log("Max distance changed: ", maxDistance);
            console.log("New points: ", diameterPoints[0], diameterPoints[1]);
            context.clearRect(0, 0, canvas.width, canvas.height); //deletes everything on the canvas
            points.forEach(point => {
                drawPoint(point);
            });
            drawDiameter();
        } else {
            console.log("Max distance didn't change");
        }
    }
}

//f(x) = sqrt(3) * x + 0
//describes a straight line through (0,0) with an angle of 60 degrees (the angle of every corner in an equilateral triangle)
function f(x) {
    return Math.sqrt(3) * x;
}

function calculatePoints() {
    let lowestPoint = {x: 0, y: 0};

    let minDistanceLeft = Infinity;
    let minDistanceRight = -Infinity;
    let closestPointLeft = {x: 0, y: 0};
    let closestPointRight = {x: 0, y: 0};

    points.forEach(point => {
        if (point.y > lowestPoint.y) { //the lowest point is the one with the greatest y-value, because (0,0) is in the upper left corner
            lowestPoint = point;
        }

        //find the vertically closest point to each line
        let distanceToLeftLine = Math.abs(-f(point.x) - point.y);
        let distanceToRightLine = Math.abs(f(point.x) - point.y);
        
        if (distanceToLeftLine < minDistanceLeft) {
            minDistanceLeft = distanceToLeftLine;
            closestPointLeft = point;
        }
        if (distanceToRightLine > minDistanceRight) {
            minDistanceRight = distanceToRightLine;
            closestPointRight = point;
        }
    });

    //find the top of the triangle by finding the point where both lines intersect when drawn through their closest points
    let x1 = ((closestPointRight.y - closestPointLeft.y) - f(closestPointLeft.x + closestPointRight.x)) / (2 * -Math.sqrt(3));
    let y1 = -f(x1-closestPointLeft.x) + closestPointLeft.y;
    trianglePoints[0] = {x: x1, y: y1};

    //find the bottom left point of the triangle by inserting the y-value of the lowest point in the function of the left line
    //f(x) = y
    //-sqrt(3) * (x - Px) + Py = y
    //-sqrt(3) * (x - Px) + Py = y -> - Py
    //-sqrt(3) * (x - Px) = y - Py -> / -sqrt(3)
    //x - Px = (y - Py) / -sqrt(3) -> + Px
    //x = (y - Py) / -sqrt(3) + Px
    let x2 = (lowestPoint.y - closestPointLeft.y) / -Math.sqrt(3) + closestPointLeft.x;
    trianglePoints[1] = {x: x2, y: lowestPoint.y};

    //find the bottom right point of the triangle by inserting the y-value of the lowest point in the function of the right line
    //f(x) = y
    //sqrt(3) * (x - Px) + Py = y
    //sqrt(3) * (x - Px) + Py = y -> - Py
    //sqrt(3) * (x - Px) = y - Py -> / sqrt(3)
    //x - Px = (y - Py) / sqrt(3) -> + Px
    //x = (y - Py) / sqrt(3) + Px
    let x3 = (lowestPoint.y - closestPointRight.y) / Math.sqrt(3) + closestPointRight.x;
    trianglePoints[2] = {x: x3, y: lowestPoint.y};
}

function drawPoint({x, y}) {
    context.globalCompositeOperation='source-over';
    context.beginPath();
    context.ellipse(x, y, 5, 5, 0, 0, 2 * Math.PI); //ellipse with x and y radius of 5 (known as a circle)
    context.fillStyle = "#000000" //black color
    context.fill()
    console.log("Point drawn");
}

function drawDiameter() {
    context.globalCompositeOperation='source-over';
    context.strokeStyle = "#880000"; //dark red color
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(diameterPoints[0].x ,diameterPoints[0].y); //first point
    context.lineTo(diameterPoints[1].x, diameterPoints[1].y); //second point
    context.stroke();
}

function drawTriangle() {
    if(points.length >= 2){ //there have to be at least two points to draw the triangle
        calculatePoints();
        context.globalCompositeOperation='destination-over';
        context.beginPath();
        context.moveTo(trianglePoints[0].x, trianglePoints[0].y); //top point
        context.lineTo(trianglePoints[1].x, trianglePoints[1].y); //bottom left point
        context.lineTo(trianglePoints[2].x, trianglePoints[2].y); //bottom right point
        context.closePath();
        context.fillStyle = "#bfe7f2"
        context.fill(); //color the defined area
    }
}

canvas.addEventListener('click', (event) => { //listen for user inputs (mouse clicks)
    let boundingRect = canvas.getBoundingClientRect();
    let x = event.clientX - boundingRect.left;
    let y = event.clientY - boundingRect.top;
    console.log("Clicked on ", x, y);
    points.push({x, y}); //add a new point where the user clicked...
    drawPoint({x, y}); //... and draw it on the canvas
    calculateDiameter();
    drawTriangle();
});