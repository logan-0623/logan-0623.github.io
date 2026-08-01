# Double-Pendulum Retarget Energy Design

## Goal

Improve the double-pendulum demonstration so an `up-up` system can retarget directly to `up-down` without restarting the full swing-up sequence, while making the link and energy colors represent actual target readiness rather than angle or one-sided energy thresholds alone.

## Current Behavior and Root Cause

Angles are measured from upright. A stationary second link has potential energy `2 m₂ g L₂` when upright and `0` when downward, so the existing `up-down` target energy is physically consistent.

The display currently marks the energy bar green whenever `currentEnergy / targetEnergy > 0.95`. This one-sided comparison treats excess energy as success. During the reproduced `up-up → up-down` transition, the second link passes near the downward target at high angular speed while both the bar and link can appear green.

The retarget controller also carries too much kinetic energy into the downward capture region. With default parameters it saturates its force, loses the first upright link, enters `settling`, and restarts the complete swing-up sequence. The reverse `up-down → up-up` transition completes directly and already has regression coverage.

## Energy Diagnostics

Add reusable double-pendulum link-energy diagnostics to `dev/lib/invertedPendulum.mjs`. For each link, report its diagnostic energy, target energy, and absolute normalized error. Normalize by the link's full gravitational energy span instead of dividing by the target, because the downward target energy is zero.

The first link target remains upright. The second link target is upright for `up-up` and downward for `up-down`. These per-link values are diagnostics for target readiness; the existing coupled total mechanical-energy calculation remains the system energy reported by the simulator.

## Retarget Controller

Keep the public controller phase as `retarget` throughout a successful transition. For `up-up → up-down`, use target-aware gain scheduling within `doubleRetargetForce`:

1. Release the second link from upright with bounded energy-shaping authority while preserving first-link feedback.
2. As the second link enters the lower half-plane, reduce pumping and increase velocity damping so excess kinetic energy is removed before the downward target.
3. Near the target, blend toward the existing local `up-down` balance feedback. Enter `balance` only when both angle and angular-speed capture thresholds are satisfied.

Retain the existing safety fallback to `settling` when the first link is genuinely lost. Do not reset simulation state during a target change.

## Visual Feedback

Update `dev/components/InvertedPendulumFinal.tsx` to use the target-aware energy diagnostics. Green means the target angle, angular speed, and normalized energy error all satisfy the capture region. Yellow means the link is approaching that region. Red means it is outside the region or carries excessive kinetic energy.

The downward target is therefore green only when the second link is close to vertical down and moving slowly. A link below the horizontal line but moving quickly remains red. The total-energy bar may remain full when energy exceeds the target, but its color must not turn green unless the absolute energy error and target-state checks are satisfied.

## Files and Scope

- Modify `dev/lib/invertedPendulum.mjs` for energy diagnostics and retarget control.
- Modify `dev/components/InvertedPendulumFinal.tsx` for target-aware colors.
- Modify `dev/tests/inverted-pendulum.test.mjs` for controller and diagnostic regression coverage.
- Modify `dev/tests/academic-content.test.mjs` only if a focused source-level rendering assertion is needed.

Do not edit the published root assets, run `deploy.sh`, commit generated output, or push changes.

## Verification

Add a failing regression test for both the default `0.3 m` and longer `0.4 m` second links. Starting from a balanced `up-up` state, retarget to `up-down` and require that the controller reaches `balance` without entering `settling`, `kick`, or `swing-up`; the first-link error remains below the existing safety boundary; and both final link angles and angular speeds lie within the capture region.

Add deterministic diagnostic tests proving that a stationary downward second link is green-ready for `up-down`, while a horizontal link and a near-down link with high angular speed are not. Run the complete development test suite and Vite production build. Stop before deployment.
