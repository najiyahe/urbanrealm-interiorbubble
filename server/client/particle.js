// Particle Class, Daniel Shiffman
// The Nature of Code, http://natureofcode.com


class Particle {

  constructor(x, y) {
    this.acceleration = createVector(0, 0.05);
    this.velocity = createVector(random(-1, 2), random(-2, 1));
    this.position = createVector(x, y);
    this.lifespan = 1.0;
  }

  run() {
    this.update();
    this.display();
  }

  // Method to update position
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 0.05;
  }

  // Method to display
  display() {
    // blendMode(SCREEN);
    let hueMap = 0;
    hueMap = map(this.position.x, 0, width, 0, 360);
    // stroke(hueMap, 80, 80, this.lifespan);
    // strokeWeight(2);
    noStroke();
    fill(hueMap, 80, 80, this.lifespan);
    ellipse(this.position.x, this.position.y, 30, 30);

    // console.log(this.position.x, this.position.y);

  }

  // Is the particle still useful?
  isDead() {
    if (this.lifespan < 0.0) {
      return true;
    } else {
      return false;
    }
  }


}

//Simple Particle System
class ParticleSystem {

  constructor(x, y) {
    this.origin = createVector(x, y);
    this.particles = [];
  }

  addParticle(x, y) {
    if (x !== undefined && y !== undefined) {
      this.particles.push(new Particle(x, y));
    } else {
      this.particles.push(new Particle(this.origin.x, this.origin.y));
    }
  }

  run() {
    // Run every particle
    // ES6 for..of loop
    for (let particle of this.particles) {
      particle.run();
    }

    // Filter removes any elements of the array that do not pass the test
    this.particles = this.particles.filter(particle => !particle.isDead());
  }
}