# Double-Pendulum Retarget Energy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `up-up → up-down` complete as a direct retarget and make pendulum colors reflect target angle, speed, and energy readiness.

**Architecture:** Add pure target-energy diagnostics and readiness classification to the existing physics module so both the controller and renderer use one definition. Keep the current controller state machine, but scale the downward retarget's bounded energy gain and correction authority from the link-length ratio before local-balance blending; then wire the pure readiness result into the canvas colors without changing deployment output.

**Tech Stack:** JavaScript physics module, React 18 with TypeScript, Canvas 2D, Node.js built-in test runner, Vite 6.

---

### Task 1: Add target-aware link-energy diagnostics

**Files:**
- Modify: `dev/tests/inverted-pendulum.test.mjs`
- Modify: `dev/lib/invertedPendulum.mjs:133-184`

- [x] **Step 1: Write failing diagnostic tests**

Add the import:

```js
import {
  createDoublePendulumController,
  createSinglePendulumController,
  doublePendulumEnergyDiagnostics,
  normalizeAngle,
  pendulumTargetReadiness,
  stepDoublePendulum,
  stepSinglePendulum,
} from '../lib/invertedPendulum.mjs';
```

Add these tests after `doubleParameters`:

```js
test('treats a stationary downward second link as ready for up-down', () => {
  const diagnostics = doublePendulumEnergyDiagnostics(
    {
      x: 0,
      xDot: 0,
      theta1: 0,
      theta1Dot: 0,
      theta2: Math.PI,
      theta2Dot: 0,
    },
    doubleParameters,
    'up-down',
  );

  assert.ok(diagnostics.second.energy < 1e-12);
  assert.equal(diagnostics.second.targetEnergy, 0);
  assert.ok(diagnostics.second.normalizedError < 1e-12);
  assert.equal(
    pendulumTargetReadiness(0, 0, diagnostics.second.normalizedError),
    'ready',
  );
});

test('rejects horizontal and fast near-down states as target-ready', () => {
  const horizontal = doublePendulumEnergyDiagnostics(
    {
      x: 0,
      xDot: 0,
      theta1: 0,
      theta1Dot: 0,
      theta2: Math.PI / 2,
      theta2Dot: 0,
    },
    doubleParameters,
    'up-down',
  );
  const fastNearDown = doublePendulumEnergyDiagnostics(
    {
      x: 0,
      xDot: 0,
      theta1: 0,
      theta1Dot: 0,
      theta2: Math.PI - 0.1,
      theta2Dot: 10,
    },
    doubleParameters,
    'up-down',
  );

  assert.equal(
    pendulumTargetReadiness(Math.PI / 2, 0, horizontal.second.normalizedError),
    'outside',
  );
  assert.equal(
    pendulumTargetReadiness(0.1, 10, fastNearDown.second.normalizedError),
    'outside',
  );
});
```

- [x] **Step 2: Run the diagnostic tests to verify they fail**

Run:

```bash
npm --prefix dev test
```

Expected: FAIL because `doublePendulumEnergyDiagnostics` and `pendulumTargetReadiness` are not exported.

- [x] **Step 3: Implement the pure diagnostics**

Add after `doublePendulumEnergy` in `dev/lib/invertedPendulum.mjs`:

```js
export const doublePendulumEnergyDiagnostics = (
  state,
  parameters,
  balanceTarget = 'up-up',
) => {
  const {
    firstMass,
    secondMass,
    firstLength,
    secondLength,
    gravity,
  } = parameters;
  const firstAssemblyMass = firstMass + secondMass;
  const firstEnergySpan = 2 * firstAssemblyMass * gravity * firstLength;
  const secondEnergySpan = 2 * secondMass * gravity * secondLength;
  const firstEnergy =
    0.5 * firstAssemblyMass * firstLength * firstLength
      * state.theta1Dot * state.theta1Dot
    + firstAssemblyMass * gravity * firstLength * (1 + Math.cos(state.theta1));
  const secondEnergy =
    0.5 * secondMass * secondLength * secondLength
      * state.theta2Dot * state.theta2Dot
    + secondMass * gravity * secondLength * (1 + Math.cos(state.theta2));
  const secondTargetEnergy = balanceTarget === 'up-down' ? 0 : secondEnergySpan;

  return {
    first: {
      energy: firstEnergy,
      targetEnergy: firstEnergySpan,
      normalizedError: Math.abs(firstEnergy - firstEnergySpan) / firstEnergySpan,
    },
    second: {
      energy: secondEnergy,
      targetEnergy: secondTargetEnergy,
      normalizedError: Math.abs(secondEnergy - secondTargetEnergy) / secondEnergySpan,
    },
  };
};

export const pendulumTargetReadiness = (
  angleError,
  angularSpeed,
  normalizedEnergyError,
) => {
  const absoluteAngleError = Math.abs(angleError);
  const absoluteAngularSpeed = Math.abs(angularSpeed);

  if (
    absoluteAngleError < 0.2
    && absoluteAngularSpeed < 1.5
    && normalizedEnergyError < 0.1
  ) return 'ready';

  if (
    absoluteAngleError < 0.5
    && absoluteAngularSpeed < 4
    && normalizedEnergyError < 0.35
  ) return 'approaching';

  return 'outside';
};
```

- [x] **Step 4: Run the diagnostic tests to verify they pass**

Run:

```bash
npm --prefix dev test
```

Expected: PASS, including the new stationary-down, horizontal, and high-speed cases.

- [x] **Step 5: Keep the verified changes in the private source tree**

Do not commit because `dev/` is intentionally ignored and remains private development source.

### Task 2: Reproduce and fix direct `up-up → up-down` retargeting

**Files:**
- Modify: `dev/tests/inverted-pendulum.test.mjs`
- Modify: `dev/lib/invertedPendulum.mjs:510-560`

- [x] **Step 1: Write the failing direct-retarget regression test**

Add after the existing `retargets a balanced up-down pendulum directly to up-up` test:

```js
test('retargets a balanced up-up pendulum directly to up-down', () => {
  for (const secondLength of [0.15, 0.3, 0.4]) {
    const transitionParameters = { ...doubleParameters, secondLength };
    let state = {
      x: 0,
      xDot: 0,
      theta1: 0.01,
      theta1Dot: 0,
      theta2: -0.01,
      theta2Dot: 0,
    };
    const controller = createDoublePendulumController('balance', 'up-up');

    for (let index = 0; index < 5_000; index += 1) {
      state = stepDoublePendulum(
        state,
        transitionParameters,
        controller,
        0.001,
      ).state;
    }

    invertedPendulum.retargetDoublePendulumController(controller, 'up-down');

    const transitionPhases = new Set([controller.phase]);
    let maximumFirstLinkError = 0;

    for (let index = 0; index < 15_000; index += 1) {
      const result = stepDoublePendulum(
        state,
        transitionParameters,
        controller,
        0.001,
      );
      state = result.state;
      transitionPhases.add(result.phase);
      maximumFirstLinkError = Math.max(
        maximumFirstLinkError,
        Math.abs(normalizeAngle(state.theta1)),
      );
    }

    assert.equal(controller.phase, 'balance');
    assert.equal(transitionPhases.has('settling'), false);
    assert.equal(transitionPhases.has('kick'), false);
    assert.equal(transitionPhases.has('swing-up'), false);
    assert.ok(maximumFirstLinkError < 0.9);
    assert.ok(Math.abs(normalizeAngle(state.theta1)) < 0.1);
    assert.ok(Math.abs(normalizeAngle(state.theta2 - Math.PI)) < 0.1);
    assert.ok(Math.abs(state.theta1Dot) < 0.3);
    assert.ok(Math.abs(state.theta2Dot) < 0.3);
  }
});
```

- [x] **Step 2: Run the test to verify the current controller fails**

Run:

```bash
npm --prefix dev test
```

Expected: FAIL because the transition visits `settling`, `kick`, or `swing-up` before recovering.

- [x] **Step 3: Add length-scaled energy correction and capture blending**

Replace `doubleRetargetForce` with:

```js
const doubleRetargetForce = (state, parameters, controller) => {
  const {
    secondMass,
    firstLength,
    secondLength,
  } = parameters;
  const diagnostics = doublePendulumEnergyDiagnostics(
    state,
    parameters,
    controller.balanceTarget,
  );
  const targetAngle = controller.balanceTarget === 'up-up' ? 0 : Math.PI;
  const targetError = normalizeAngle(state.theta2 - targetAngle);
  const zeroForce = doubleDerivatives(state, 0, parameters);
  const unitForce = doubleDerivatives(state, 1, parameters);
  const forceAuthority = unitForce.theta1Dot - zeroForce.theta1Dot;

  if (controller.balanceTarget === 'up-down') {
    const energyError = diagnostics.second.energy
      - diagnostics.second.targetEnergy;
    const energyVelocity = secondMass * secondLength
      * state.theta2Dot * Math.cos(state.theta2);
    const pumpingDirection = Math.abs(energyVelocity) > 0.01
      ? Math.sign(energyVelocity)
      : controller.retargetDirection;
    const lengthWeight = clamp(
      (secondLength / firstLength - 0.375) / 0.375,
      0,
      1,
    );
    const energyGain = 30 + 10 * lengthWeight;
    const energyCorrectionLimit = 24 - 6 * lengthWeight;
    const energyCorrection = clamp(
      energyGain * energyError * pumpingDirection,
      -energyCorrectionLimit,
      energyCorrectionLimit,
    );
    const desiredFirstAcceleration =
      -120 * normalizeAngle(state.theta1)
      - 8 * state.theta1Dot
      + energyCorrection;
    const energyShapingForce = clamp(
      (desiredFirstAcceleration - zeroForce.theta1Dot) / forceAuthority,
      -80,
      80,
    );
    const angleBlend = clamp((0.7 - Math.abs(targetError)) / 0.5, 0, 1);
    const speedBlend = clamp((6 - Math.abs(state.theta2Dot)) / 4.5, 0, 1);
    const captureBlend = angleBlend * speedBlend;
    const captureForce = doubleBalanceForce(state, parameters, controller);

    return clamp(
      energyShapingForce * (1 - captureBlend) + captureForce * captureBlend,
      -80,
      80,
    );
  }

  const energyError = diagnostics.second.energy
    - diagnostics.second.targetEnergy;
  const energyVelocity = secondMass * secondLength
    * state.theta2Dot * Math.cos(state.theta2);
  const pumpingDirection = Math.abs(energyVelocity) > 0.01
    ? Math.sign(energyVelocity)
    : controller.retargetDirection;
  const lengthWeight = clamp(
    (secondLength / firstLength - 0.75) / 0.25,
    0,
    1,
  );
  const energyGain = 40 - 10 * lengthWeight;
  const captureDampingGain = -4 + 7 * lengthWeight;
  const desiredFirstAcceleration =
    -100 * normalizeAngle(state.theta1)
    - 5 * state.theta1Dot
    + energyGain * energyError * pumpingDirection
    + (Math.abs(targetError) < 0.6
      ? captureDampingGain * state.theta2Dot
      : 0);

  return clamp(
    (desiredFirstAcceleration - zeroForce.theta1Dot) / forceAuthority,
    -80,
    80,
  );
};
```

This preserves the existing length-adaptive `up-down → up-up` behavior below the new target-specific branch.

- [x] **Step 4: Run the full test suite and inspect the transition**

Run:

```bash
npm --prefix dev test
```

Expected: PASS. All three second-link lengths complete `retarget → balance` without fallback, and the existing reverse-retarget and disturbance tests remain green.

- [x] **Step 5: Keep the verified controller changes in the private source tree**

Do not commit because `dev/` is intentionally ignored and remains private development source.

### Task 3: Drive canvas colors from target readiness

**Files:**
- Modify: `dev/tests/academic-content.test.mjs`
- Modify: `dev/components/InvertedPendulumFinal.tsx:1-420`

- [x] **Step 1: Write a failing source-wiring test**

Add beside the existing inverted-pendulum content assertions:

```js
test('colors the double pendulum from target-aware energy readiness', () => {
  assert.match(invertedPendulum, /doublePendulumEnergyDiagnostics/);
  assert.match(invertedPendulum, /pendulumTargetReadiness/);
  assert.match(invertedPendulum, /READINESS_COLORS/);
  assert.doesNotMatch(invertedPendulum, /eRatio > 0\.95/);
});
```

- [x] **Step 2: Run the source-wiring test to verify it fails**

Run:

```bash
npm --prefix dev test
```

Expected: FAIL because the component does not yet import or use the target-aware helpers.

- [x] **Step 3: Import the diagnostics and define the color mapping**

Extend the physics import in `dev/components/InvertedPendulumFinal.tsx`:

```tsx
import {
  createDoublePendulumController,
  createSinglePendulumController,
  doublePendulumEnergyDiagnostics,
  normalizeAngle,
  pendulumTargetReadiness,
  retargetDoublePendulumController,
  stepDoublePendulum,
  stepSinglePendulum,
} from '../lib/invertedPendulum.mjs';
```

Add after `PHASE_LABELS`:

```tsx
const READINESS_COLORS = {
  ready: '#22c55e',
  approaching: '#eab308',
  outside: '#ef4444',
} as const;

type EnergyReadiness = keyof typeof READINESS_COLORS;
```

- [x] **Step 4: Calculate readiness once per rendered frame**

After `const t1n = normalizeAngle(s.theta1);`, add:

```tsx
      const doubleEnergyDiagnostics = pendulumType === 'double'
        ? doublePendulumEnergyDiagnostics(
          {
            x: s.x,
            xDot: s.x_dot,
            theta1: s.theta1,
            theta1Dot: s.theta1_dot,
            theta2: s.theta2,
            theta2Dot: s.theta2_dot,
          },
          {
            cartMass,
            firstMass: pendMass1,
            secondMass: pendMass2,
            firstLength: pendLength1,
            secondLength: pendLength2,
            gravity: g,
            friction: b,
          },
          doubleBalanceTarget,
        )
        : null;
      const firstReadiness = doubleEnergyDiagnostics
        ? pendulumTargetReadiness(
          t1n,
          s.theta1_dot,
          doubleEnergyDiagnostics.first.normalizedError,
        ) as EnergyReadiness
        : null;
      let combinedReadiness: EnergyReadiness | null = null;
      let color1 = firstReadiness
        ? READINESS_COLORS[firstReadiness]
        : Math.abs(t1n) < 0.2
          ? READINESS_COLORS.ready
          : Math.abs(t1n) < 0.5
            ? READINESS_COLORS.approaching
            : READINESS_COLORS.outside;
```

Replace the second-link angle-only color with:

```tsx
        const secondReadiness = pendulumTargetReadiness(
          theta2Error,
          s.theta2_dot,
          doubleEnergyDiagnostics!.second.normalizedError,
        ) as EnergyReadiness;
        const color2 = READINESS_COLORS[secondReadiness];
        combinedReadiness = firstReadiness === 'outside' || secondReadiness === 'outside'
          ? 'outside'
          : firstReadiness === 'approaching' || secondReadiness === 'approaching'
            ? 'approaching'
            : 'ready';
```

- [x] **Step 5: Make the energy bar use readiness instead of a one-sided ratio**

Before drawing the energy bar, calculate:

```tsx
        const energyReadiness: EnergyReadiness = combinedReadiness
          ?? (Math.abs(energyRef.current - targetEnergyRef.current)
              / Math.max(targetEnergyRef.current, Number.EPSILON) < 0.05
            ? 'ready'
            : 'outside');
```

Replace:

```tsx
ctx.fillStyle = eRatio > 0.95 ? '#22c55e' : '#3b82f6';
```

with:

```tsx
ctx.fillStyle = READINESS_COLORS[energyReadiness];
```

- [x] **Step 6: Run the full development test suite**

Run:

```bash
npm --prefix dev test
```

Expected: PASS with no failures.

### Task 4: Build and stop before deployment

**Files:**
- Verify: `dev/dist/projects.html`
- Verify: `dev/dist/assets/InvertedPendulumFinal-*.js`

- [x] **Step 1: Build the private development site**

Run:

```bash
npm --prefix dev run build
```

Expected: Vite exits successfully and writes the private build to `dev/dist`.

- [x] **Step 2: Verify the generated private bundle**

Run:

```bash
rg -n "doublePendulumEnergyDiagnostics|ready|approaching|outside" dev/lib/invertedPendulum.mjs dev/components/InvertedPendulumFinal.tsx
rg -l "up-down" dev/dist/assets/InvertedPendulumFinal-*.js
```

Expected: the source contains the diagnostics and readiness states, and one generated inverted-pendulum bundle contains the target logic.

- [x] **Step 3: Confirm published files were not touched**

Run:

```bash
git status --short
```

Expected: no published root HTML or asset change caused by this implementation; pre-existing unrelated changes remain untouched.

- [x] **Step 4: Hand off deployment**

Report test and build evidence. Do not run `deploy.sh`, commit generated output, or push; the user will deploy separately.
