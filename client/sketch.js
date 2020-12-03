// Change this to the domain name of your Heroku server
const SERVER_URL = 'wss://radiant-chamber-34629.herokuapp.com'

let x, y, b;
const socket = new osc.WebSocketPort({ url: SERVER_URL });

// Keep the connection alive
socket.on('close', () => {
  socket.open();
});

socket.on('error', (e) => {
  console.error('WebSocket error', e);
});

socket.on('message', (data) => {
  console.log(data);
  if (data.address === '/3/xy') {
    x = data.args[0] * width;
    y = data.args[1] * height;
  } else if (data.address === '/3/toggle1') {
    b = data.args[0];
  }
});

socket.open();

/////////// P5JS Sketch ///////////

// Particle System
//Ml5.js

//set up particle system 
let ps;

//set up ml5
let video;
let poseNet;
let pose;

function setup() {
  
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  // initiate particle system
  ps = new ParticleSystem(createVector(width/2, height/2));

  //ml5 video
  video = createCapture(VIDEO);
  video.hide(0);
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);
}

function draw() {
  
   background(150);
   image(video,0,0);
   tint(25,20,15,30);
   filter(GRAY);
   
    //colors for posenet motion
    fill(255, 64);
    stroke(5);
    strokeWeight(10);
  
  if (pose){
    
    // Left Wrist movement (moving the Particle System origin)
     let leftWrist = pose['leftWrist'];
  ps.origin.set(pose.leftWrist.x, pose.leftWrist.y-100, 0);
  ps.addParticle();
  ps.run();
   
    // Right Wrist movement (moving the Particle System origin)
     let rightWrist = pose['rightWrist'];
  ps.origin.set(pose.rightWrist.x, (pose.rightWrist.y-100), 0);
  ps.addParticle();
  ps.run();

  // Map location of particles via OSC to Arduino
  mapParticles(pose);
}

}

  // ///////////////////////////////////////////////////////////////////////////////////////////
 
// Map to arduino
function mapParticles(pose){

 const newrightX = map (pose.rightWrist.x, 0, width, 0, 1, true);
 const newrightY = map (pose.rightWrist.y, 0, height, 0, 1, true);
//  const newleftX = map (pose.leftWrist.x, 0, width, 0, 1, true);
//  const newleftY = map (pose.leftWrist.y, 0, height, 0, 1, true);

  socket.send({ address: 'right', args: [newrightX, newrightY] })
  // socket.send({ address: 'left', args: [newleftX, newleftY] })
}

// // ///////////////////////////////////////////////////////////////////////////////////////////

    // function mouseDragged() {
      //   // const newX = constrain(mouseX / width, 0, 1);
      //   // const newY = constrain(mouseY / height, 0, 1);
      //   socket.send({ address: '/3/xy', args: [newX, newY] })
      // }



