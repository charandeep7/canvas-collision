const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d');
const mouse = {
    x: undefined,
    y: undefined
}
canvas.width = innerWidth;
canvas.height = innerHeight;

function randomIntFromRange(min,max)
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomColor(colors,flag=false)
{
    if(flag)
        return `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
    return colors[Math.floor(Math.random() * colors.length)];
}
function getDistance(mouseX,mouseY,circleX,circleY)
{
    return Math.sqrt(Math.pow(mouseX-circleX,2) + Math.pow(mouseY-circleY,2));
}
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
}
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

class Particle{
    constructor(x,y,r,dx,dy,color)
    {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.velocity = {
            x: dx,
            y: dy
        }
        this.mass = 1;
        this.opacity = 0;
    }
    
    draw(){
        c.beginPath();
        c.arc(this.x,this.y,this.r,0,Math.PI*2,true);
        c.save();
        c.globalAlpha = this.opacity;
        c.fillStyle = this.color;
        c.fill();
        c.restore();
        c.strokeStyle = this.color;
        c.stroke();
        c.closePath();  
    }

    update(particles){
        this.draw()
        for(let i=0; i<particles.length; ++i){
            if(this === particles[i]) continue;
            if(getDistance(this.x,this.y,particles[i].x,particles[i].y) - (this.r + particles[i].r) < 0){
                resolveCollision(this,particles[i])
            }
        }
        if(this.x + this.r > canvas.width || this.x - this.r < 0)
            this.velocity.x *= -1;
        if(this.y + this.r > canvas.height || this.y - this.r < 0)
            this.velocity.y *= -1;

        if(getDistance(mouse.x,mouse.y,this.x,this.y) < 120 && this.opacity < 0.2){
            this.opacity += 0.02
        }
        else if(this.opacity > 0){
            this.opacity -= 0.2;
            this.opacity = Math.max(0,this.opacity);
        }
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

function createParticles(n)
{
    const particles = [];
    function getXYR(){
        let R = 20;
        let X = randomIntFromRange(R, canvas.width-R);
        let Y = randomIntFromRange(R, canvas.height-R);
        let DX = randomIntFromRange(-5,5);
        let DY = randomIntFromRange(-5,5);
        let COLOR = randomColor(null,true);
        return {
            x: X,
            y: Y,
            r: R,
            dx: DX,
            dy: DY,
            color: COLOR,
        }
    }
    for(let i=0; i<n; ++i){
        let val = getXYR();
        if(i!=0){
            for(let j=0; j<particles.length; j++){
                if(getDistance(val.x,val.y,particles[j].x,particles[j].y) - (particles[j].r + val.r) < 0){
                    val = getXYR()
                    j = -1;
                }
            }
        }
        particles.push(new Particle(val.x,val.y,val.r,val.dx,val.dy,val.color));
    } 
    return particles;
}

function init(n=1)
{
    const particles = createParticles(n);
    function animate(){
        requestAnimationFrame(animate);
        c.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(particle=>particle.update(particles));
    }
    animate();
}
addEventListener('load',()=>init(150))
addEventListener('resize',()=>{
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init(10);
})
addEventListener('mousemove',({clientX,clientY})=>{
    mouse.x = clientX;
    mouse.y = clientY;
})