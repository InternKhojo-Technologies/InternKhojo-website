// Pure physics for a field of floating pills on water.
// No DOM, no React, no dependencies. All state lives in flat Float32Arrays
// so the animation loop can step ~120 pills without allocating per frame.

export interface FluidOptions {
  boundX: number;
  boundY: number;
  damping: number;
  current: number;
  wakeRadius: number;
  wakePush: number;
  swirl: number;
  spring: number;
  maxSpeed: number;
}

export interface CursorBoat {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
}

export interface FluidField {
  readonly count: number;
  readonly pos: Float32Array;
  readonly vel: Float32Array;
  readonly home: Float32Array;
  opts: FluidOptions;
}

// Cursor speeds below this are treated as still (no wake).
const WAKE_EPSILON = 1e-4;
// Cursor speed (px per 60fps-step) at which the wake push saturates.
// Faster flicks push no harder than this; slower moves scale linearly.
const WAKE_SPEED_REF = 8;

export function defaultFluidOptions(): FluidOptions {
  return {
    boundX: 650,
    boundY: 350,
    damping: 0.94,
    current: 0.06,
    wakeRadius: 180,
    wakePush: 0.35,
    swirl: 0.12,
    spring: 0.0015,
    maxSpeed: 6,
  };
}

export function createFluidField(
  homes: Float32Array,
  opts?: Partial<FluidOptions>,
): FluidField {
  const count = Math.floor(homes.length / 2);
  const pos = new Float32Array(homes);
  const vel = new Float32Array(count * 2);
  const home = new Float32Array(homes);
  return { count, pos, vel, home, opts: { ...defaultFluidOptions(), ...opts } };
}

export function scatterFluid(
  f: FluidField,
  rangeX: number,
  rangeY: number,
): void {
  const pos = f.pos;
  for (let i = 0; i < f.count; i++) {
    const ix = i * 2;
    pos[ix] = (Math.random() * 2 - 1) * rangeX;
    pos[ix + 1] = (Math.random() * 2 - 1) * rangeY;
  }
}

export function stepFluid(
  f: FluidField,
  cursor: CursorBoat | null,
  timeMs: number,
  dtSteps: number,
): void {
  if (dtSteps <= 0 || f.count === 0) return;

  const pos = f.pos;
  const vel = f.vel;
  const home = f.home;
  const boundX = f.opts.boundX;
  const boundY = f.opts.boundY;
  const currentStep = f.opts.current * dtSteps;
  const springStep = f.opts.spring * dtSteps;
  const wakeRadius = f.opts.wakeRadius;
  const wakeRadiusSq = wakeRadius * wakeRadius;
  const wakePush = f.opts.wakePush;
  const swirl = f.opts.swirl;
  const maxSpeed = f.opts.maxSpeed;
  const maxSpeedSq = maxSpeed * maxSpeed;
  const dampFactor = Math.pow(f.opts.damping, dtSteps);
  const t = timeMs;

  // Cursor velocity direction + clamped speed influence, hoisted out of the loop.
  let hasWake = false;
  let cvx = 0;
  let cvy = 0;
  let wakeScale = 0;
  let swirlScale = 0;
  if (cursor !== null && cursor.speed > WAKE_EPSILON) {
    const invSpeed = 1 / cursor.speed;
    cvx = cursor.vx * invSpeed;
    cvy = cursor.vy * invSpeed;
    const speedFactor =
      cursor.speed >= WAKE_SPEED_REF ? 1 : cursor.speed / WAKE_SPEED_REF;
    wakeScale = wakePush * speedFactor;
    swirlScale = swirl * speedFactor;
    hasWake = true;
  }

  for (let i = 0; i < f.count; i++) {
    const ix = i * 2;
    const iy = ix + 1;
    let x = pos[ix];
    let y = pos[iy];
    let vx = vel[ix];
    let vy = vel[iy];

    // 1. Ambient current: layered sine drift, small amplitude.
    const cx =
      Math.sin(y * 0.004 + t * 0.0006) +
      0.5 * Math.sin((x + y) * 0.002 - t * 0.0004);
    const cy =
      Math.cos(x * 0.004 - t * 0.0005) +
      0.5 * Math.cos((x - y) * 0.002 + t * 0.0004);
    vx += currentStep * cx;
    vy += currentStep * cy;

    // 2. Wake: directional push along cursor motion + radial push away
    //    from the cursor + tangential swirl around it, all with linear
    //    falloff to the wake radius.
    if (hasWake && cursor !== null) {
      const dx = x - cursor.x;
      const dy = y - cursor.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < wakeRadiusSq) {
        const d = Math.sqrt(d2);
        const falloff = 1 - d / wakeRadius;
        // Directional push along the cursor's travel direction.
        vx += cvx * wakeScale * falloff;
        vy += cvy * wakeScale * falloff;
        if (d > 1e-4) {
          const invD = 1 / d;
          const nx = dx * invD;
          const ny = dy * invD;
          // Radial push away from the cursor.
          vx += nx * wakeScale * falloff;
          vy += ny * wakeScale * falloff;
          // Tangential swirl around the cursor.
          const swirlStep = swirlScale * falloff;
          vx += -ny * swirlStep;
          vy += nx * swirlStep;
        }
      }
    }

    // 3. Weak spring settling back toward home.
    vx += (home[ix] - x) * springStep;
    vy += (home[iy] - y) * springStep;

    // 4. Viscous damping.
    vx *= dampFactor;
    vy *= dampFactor;

    // 5. Clamp speed.
    const speedSq = vx * vx + vy * vy;
    if (speedSq > maxSpeedSq) {
      const scale = maxSpeed / Math.sqrt(speedSq);
      vx *= scale;
      vy *= scale;
    }

    // 6. Integrate + soft reflective bounds.
    x += vx * dtSteps;
    y += vy * dtSteps;
    if (x > boundX) {
      x = boundX;
      vx *= -0.6;
    } else if (x < -boundX) {
      x = -boundX;
      vx *= -0.6;
    }
    if (y > boundY) {
      y = boundY;
      vy *= -0.6;
    } else if (y < -boundY) {
      y = -boundY;
      vy *= -0.6;
    }

    pos[ix] = x;
    pos[iy] = y;
    vel[ix] = vx;
    vel[iy] = vy;
  }
}
