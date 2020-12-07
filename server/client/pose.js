//Ml5js, Posenet
//The coding train, Daniel Shiffman


function gotPoses(poses){
  //record a pose each time a pose is recorded
  //console.log(poses);
  if (poses.length>0){
    pose= poses[0].pose;
    
    let eyeR= pose.rightEye;
    let eyeL= pose.leftEye;
    
    //distance function (coordR - x, coordR-y, coordL-x, coordL-y);
    d=dist(eyeR.x,eyeR.y, eyeL.x, eyeL.y);
}
}

function modelLoaded(){
  console.log('poseNet ready');
}