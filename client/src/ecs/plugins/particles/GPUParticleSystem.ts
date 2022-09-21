/**
 * From: https://github.com/joshmarinacci/webxr-experiments/blob/master/particles/GPUParticleSystem2.js
 * Exammples: https://blog.mozvr.com/particles-go-wild-with-textures/
 */

import {
  Blending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  NormalBlending,
  Object3D,
  Points,
  RepeatWrapping,
  ShaderMaterial,
  Texture,
  Vector3,
} from "three";

const GPUParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uScale;
    uniform bool reverseTime;
    uniform float fadeIn;
    uniform float fadeOut;

    attribute vec3 positionStart;
    attribute float startTime;
    attribute vec3 velocity;
    attribute vec3 acceleration;
    attribute vec3 color;
    attribute vec3 endColor;
    attribute float size;
    attribute float lifeTime;

    varying vec4 vColor;
    varying vec4 vEndColor;
    varying float lifeLeft;
    varying float alpha;

    void main() {
        vColor = vec4( color, 1.0 );
        vEndColor = vec4( endColor, 1.0);
        vec3 newPosition;
        float timeElapsed = uTime - startTime;
        if(reverseTime) timeElapsed = lifeTime - timeElapsed;
        if(timeElapsed < fadeIn) {
            alpha = timeElapsed/fadeIn;
        } else if(timeElapsed > (lifeTime - fadeOut)) {
            alpha = 1.0 - (timeElapsed - (lifeTime-fadeOut))/fadeOut;
        } else {
            alpha = 1.0;
        }
        
        lifeLeft = 1.0 - ( timeElapsed / lifeTime );
        gl_PointSize = ( uScale * size ); // * lifeLeft;
        newPosition = positionStart 
            + (velocity * timeElapsed)
            + (acceleration * 0.5 * timeElapsed * timeElapsed)
            ;
        if (lifeLeft < 0.0) { 
            lifeLeft = 0.0; 
            gl_PointSize = 0.;
        }
        //while active use the new position
        if( timeElapsed > 0.0 ) {
            gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
        } else {
            //if dead use the initial position and set point size to 0
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            lifeLeft = 0.0;
            gl_PointSize = 0.;
        }
    }
    `,
  fragmentShader: `
    varying vec4 vColor;
    varying vec4 vEndColor;
    varying float lifeLeft;
    varying float alpha;
    uniform sampler2D tSprite;
    void main() {
        // flip Y, since textures are upside down
        vec2 coord = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
        vec4 tex = texture2D( tSprite, coord );

        // color based on particle texture and the lifeLeft. 
        // if lifeLeft is 0 then make invisible
        vec4 color = mix(vColor, vEndColor, 1.0-lifeLeft);
        gl_FragColor = vec4( color.rgb*tex.rgb, alpha * tex.a);
    }
    `,
};

const UPDATEABLE_ATTRIBUTES = [
  "positionStart",
  "startTime",
  "velocity",
  "acceleration",
  "color",
  "endColor",
  "size",
  "lifeTime",
];

type Options = {
  blending?: Blending;
  maxParticles?: number;
  onTick?: Function;
  reverseTime?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  texture?: Texture;
  onTop?: boolean;
};

export class GPUParticleSystem extends Object3D {
  blending: Blending;
  time: number;
  initialTime: number;
  offset: number;
  count: number;
  DPR: number;
  particleUpdate: boolean;
  onTick: Function;
  reverseTime: boolean;
  fadeIn: number;
  fadeOut: number;
  rand: number[];
  i: number;
  sprite: Texture;
  geometry: BufferGeometry;
  material: ShaderMaterial;
  particleSystem: Points;

  PARTICLE_COUNT: number;
  PARTICLE_CURSOR: number;

  constructor(options: Options = {}) {
    super();

    this.blending = options.blending ? options.blending : NormalBlending;
    this.PARTICLE_COUNT = options.maxParticles || 1000000;
    this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.offset = 0;
    this.count = 0;
    this.DPR = window.devicePixelRatio;
    this.particleUpdate = false;
    this.onTick = options.onTick;

    this.reverseTime = options.reverseTime;
    this.fadeIn = Math.max(options.fadeIn ?? 0, 0);
    // if (this.fadeIn === 0) this.fadeIn = 0.001;
    this.fadeOut = Math.max(options.fadeOut ?? 0, 0);
    // if (this.fadeOut === 0) this.fadeOut = 0.001;

    // preload a 10_000 random numbers from -0.5 to 0.5
    this.rand = [];
    let i;
    for (i = 10000; i > 0; i--) {
      this.rand.push(Math.random() - 0.5);
    }
    this.i = i;

    //setup the texture
    this.sprite = options.texture || null;
    if (!this.sprite) throw new Error("No particle sprite texture specified");
    this.sprite.wrapS = this.sprite.wrapT = RepeatWrapping;
    this.sprite.rotation = Math.PI / 4;

    const depth = options.onTop ?? true;

    //setup the shader material
    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: depth,
      depthTest: !depth,
      uniforms: {
        uTime: { value: 0.0 },
        uScale: { value: 1.0 },
        tSprite: { value: this.sprite },
        reverseTime: { value: this.reverseTime },
        fadeIn: { value: this.fadeIn },
        fadeOut: { value: this.fadeOut },
      },
      blending: this.blending,
      vertexShader: GPUParticleShader.vertexShader,
      fragmentShader: GPUParticleShader.fragmentShader,
    });

    // define defaults for all values
    const defaults = this.material.defaultAttributeValues;
    defaults.particlePositionsStartTime = [0, 0, 0, 0];
    defaults.particleVelColSizeLife = [0, 0, 0, 0];

    // geometry
    this.geometry = new BufferGeometry();

    //vec3 attributes
    this.geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "positionStart",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "velocity",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "acceleration",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "color",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      "endColor",
      new BufferAttribute(
        new Float32Array(this.PARTICLE_COUNT * 3),
        3
      ).setUsage(DynamicDrawUsage)
    );

    //scalar attributes
    this.geometry.setAttribute(
      "startTime",
      new BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
        DynamicDrawUsage
      )
    );
    this.geometry.setAttribute(
      "size",
      new BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
        DynamicDrawUsage
      )
    );
    this.geometry.setAttribute(
      "lifeTime",
      new BufferAttribute(new Float32Array(this.PARTICLE_COUNT), 1).setUsage(
        DynamicDrawUsage
      )
    );

    this.particleSystem = new Points(this.geometry, this.material);
    this.particleSystem.frustumCulled = false;
    this.add(this.particleSystem);
  }

  /*
      This updates the geometry on the shader if at least one particle has been spawned.
      It uses the offset and the count to determine which part of the data needs to actually
      be sent to the GPU. This ensures no more data than necessary is sent.
     */
  geometryUpdate() {
    if (this.particleUpdate === true) {
      this.particleUpdate = false;
      UPDATEABLE_ATTRIBUTES.forEach((name) => {
        const attr: BufferAttribute = this.geometry.getAttribute(
          name
        ) as BufferAttribute;
        if (this.offset + this.count < this.PARTICLE_COUNT) {
          attr.updateRange.offset = this.offset * attr.itemSize;
          attr.updateRange.count = this.count * attr.itemSize;
        } else {
          attr.updateRange.offset = 0;
          attr.updateRange.count = -1;
        }
        attr.needsUpdate = true;
      });
      this.offset = 0;
      this.count = 0;
    }
  }

  //use one of the random numbers
  random() {
    return ++this.i >= this.rand.length
      ? this.rand[(this.i = 1)]
      : this.rand[this.i];
  }

  update(ttime) {
    this.time = ttime / 1000;
    if (this.initialTime === undefined) this.initialTime = this.time;
    this.material.uniforms.uTime.value = this.time;
    if (this.onTick) this.onTick(this, this.time - this.initialTime);
    this.geometryUpdate();
  }

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.onTick = null;
  }

  /* spawn a particle

    This works by updating values inside of
    the attribute arrays, then updates the count and the PARTICLE_CURSOR and
    sets particleUpdate to true.

    Thus if spawnParticle is called three times in a row before rendering,
    then count will be 3 and the cursor will have moved by three.
     */
  spawnParticle(options) {
    let position = new Vector3();
    let velocity = new Vector3();
    let acceleration = new Vector3();
    let color = new Color();
    let endColor = new Color();

    const positionStartAttribute = this.geometry.getAttribute(
      "positionStart"
    ) as BufferAttribute;
    const startTimeAttribute = this.geometry.getAttribute(
      "startTime"
    ) as BufferAttribute;
    const velocityAttribute = this.geometry.getAttribute(
      "velocity"
    ) as BufferAttribute;
    const accelerationAttribute = this.geometry.getAttribute(
      "acceleration"
    ) as BufferAttribute;
    const colorAttribute = this.geometry.getAttribute(
      "color"
    ) as BufferAttribute;
    const endcolorAttribute = this.geometry.getAttribute(
      "endColor"
    ) as BufferAttribute;
    const sizeAttribute = this.geometry.getAttribute("size") as BufferAttribute;
    const lifeTimeAttribute = this.geometry.getAttribute(
      "lifeTime"
    ) as BufferAttribute;

    options = options || {};

    // setup reasonable default values for all arguments

    position =
      options.position !== undefined
        ? position.copy(options.position)
        : position.set(0, 0, 0);
    velocity =
      options.velocity !== undefined
        ? velocity.copy(options.velocity)
        : velocity.set(0, 0, 0);
    acceleration =
      options.acceleration !== undefined
        ? acceleration.copy(options.acceleration)
        : acceleration.set(0, 0, 0);
    color =
      options.color !== undefined
        ? color.copy(options.color)
        : color.set(0xffffff);
    endColor =
      options.endColor !== undefined
        ? endColor.copy(options.endColor)
        : endColor.copy(color);

    const lifetime = options.lifetime ?? 5;
    const sizeRandomness = options.sizeRandomness ?? 0;

    let size = options.size ?? 10;
    if (this.DPR !== undefined) size *= this.DPR;

    const i = this.PARTICLE_CURSOR;

    // position
    positionStartAttribute.setXYZ(i, position.x, position.y, position.z);

    velocityAttribute.setXYZ(i, velocity.x, velocity.y, velocity.z);

    accelerationAttribute.setXYZ(
      i,
      acceleration.x,
      acceleration.y,
      acceleration.z
    );

    colorAttribute.setXYZ(i, color.r, color.g, color.b);

    endcolorAttribute.setXYZ(i, endColor.r, endColor.g, endColor.b);

    //size, lifetime and starttime
    sizeAttribute.setX(i, size + this.random() * sizeRandomness);
    lifeTimeAttribute.setX(i, lifetime);
    startTimeAttribute.setX(i, this.time); // + this.random() * 2e-2);

    // offset
    if (this.offset === 0) this.offset = this.PARTICLE_CURSOR;
    // counter and cursor
    this.count++;
    this.PARTICLE_CURSOR++;
    //wrap the cursor around
    if (this.PARTICLE_CURSOR >= this.PARTICLE_COUNT) this.PARTICLE_CURSOR = 0;
    this.particleUpdate = true;
  }
}
