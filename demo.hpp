#ifndef APP_DEMO_RL_HUMANOID_WALK_WEB_DEMO_HPP
#define APP_DEMO_RL_HUMANOID_WALK_WEB_DEMO_HPP

#include "common/io.hpp"
#include "learning/rl/autodiff_adapter.hpp"
#include "learning/rl/engine.hpp"
#include "learning/rl/objectives.hpp"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <random>
#include <stdexcept>
#include <vector>

namespace delta {
namespace go {
namespace optimz {
namespace demo_app {

namespace rl_humanoid_detail {

using scalar_t = double;
using loss_t = delta::go::optimz::learning::rl::autodiff_loss_handle<scalar_t>;

constexpr std::size_t kActions = 7u;
constexpr std::size_t kJoints = 6u;   // L: hip,knee,ankle; R: hip,knee,ankle
constexpr std::size_t kFeatures = 18u;
constexpr scalar_t kPi = 3.14159265358979323846;

struct vec3 {
    scalar_t x = 0.0;
    scalar_t y = 0.0;
    scalar_t z = 0.0;
};

struct obstacle {
    scalar_t x = 0.0;
    scalar_t width = 0.0;
    scalar_t height = 0.0;
    scalar_t depth = 0.0;
};

struct humanoid_state {
    scalar_t t = 0.0;
    scalar_t torso_x = 0.0;
    scalar_t torso_y = 0.0;
    scalar_t torso_z = 1.0;
    scalar_t torso_pitch = 0.0;
    scalar_t vx = 0.0;
    scalar_t vz = 0.0;
    scalar_t pitch_rate = 0.0;
    scalar_t target_vx = 0.0;
    scalar_t gait_phase = 0.0;
    std::array<scalar_t, kJoints> q{};
    std::array<scalar_t, kJoints> dq{};
    std::array<scalar_t, 2u> foot_contact{1.0, 1.0};
    std::array<scalar_t, 3u> imu_acc{};
    std::array<scalar_t, 3u> imu_gyro{};
    scalar_t obstacle_dx = 6.0;
    scalar_t obstacle_height = 0.0;
    scalar_t obstacle_width = 0.0;
    scalar_t toe_clearance = 0.0;
    scalar_t stumble = 0.0;
};

struct body_kinematics {
    vec3 pelvis{};
    vec3 torso_top{};
    vec3 l_hip{};
    vec3 l_knee{};
    vec3 l_ankle{};
    vec3 l_toe{};
    vec3 r_hip{};
    vec3 r_knee{};
    vec3 r_ankle{};
    vec3 r_toe{};
};

struct pose_frame {
    scalar_t t = 0.0;
    int action = 0;
    scalar_t reward = 0.0;
    scalar_t torso_x = 0.0;
    scalar_t torso_y = 0.0;
    scalar_t torso_z = 1.0;
    scalar_t torso_pitch = 0.0;
    scalar_t vx = 0.0;
    scalar_t target_vx = 0.0;
    std::array<scalar_t, kJoints> q{};
    std::array<scalar_t, 2u> foot_contact{};
    std::array<scalar_t, 3u> imu_acc{};
    std::array<scalar_t, 3u> imu_gyro{};
    std::array<std::array<scalar_t, 3u>, 10u> joints{};
};

struct episode_trace {
    std::vector<pose_frame> frames{};
    scalar_t mean_reward = 0.0;
    scalar_t final_x = 0.0;
    bool fell = false;
};

struct avoidance_eval {
    scalar_t mean_return = 0.0;
    scalar_t mean_final_x = 0.0;
    scalar_t mean_passed_obstacles = 0.0;
    scalar_t mean_collisions = 0.0;
    scalar_t success_rate = 0.0;
};

struct learning_stage {
    std::size_t iter = 0u;
    scalar_t curriculum = 1.0;
    episode_trace trace{};
    std::vector<obstacle> obstacles{};
};

struct training_bundle {
    std::vector<scalar_t> mean_return{};
    std::vector<scalar_t> actor_loss{};
    std::vector<scalar_t> critic_loss{};
    std::vector<scalar_t> policy_entropy{};
    std::array<scalar_t, kActions> before_action_prob{};
    std::array<scalar_t, kActions> after_action_prob{};
    std::size_t selected_after_iter = 0u;
    scalar_t selected_after_score = 0.0;
    scalar_t selected_after_curriculum = 1.0;
    avoidance_eval before_eval{};
    avoidance_eval after_eval{};
    episode_trace before{};
    episode_trace after{};
    std::vector<learning_stage> learning_path{};
    std::vector<obstacle> obstacles{};
};

[[nodiscard]] inline scalar_t clamp(const scalar_t x, const scalar_t lo,
                                    const scalar_t hi) {
    return std::max(lo, std::min(hi, x));
}

[[nodiscard]] inline scalar_t wrap_phase(scalar_t p) {
    while(p > kPi) {
        p -= 2.0 * kPi;
    }
    while(p < -kPi) {
        p += 2.0 * kPi;
    }
    return p;
}

[[nodiscard]] inline std::array<scalar_t, kFeatures>
extract_features(const humanoid_state & s) {
    std::array<scalar_t, kFeatures> f{};
    f[0] = 1.0;
    f[1] = s.torso_pitch;
    f[2] = s.pitch_rate;
    f[3] = s.vx - s.target_vx;
    f[4] = s.target_vx;
    f[5] = s.torso_z - 1.0;
    f[6] = s.q[0];
    f[7] = s.q[3];
    f[8] = s.q[1] - s.q[4];
    f[9] = s.foot_contact[0] - s.foot_contact[1];
    f[10] = std::sin(s.gait_phase);
    f[11] = std::cos(s.gait_phase);
    f[12] = 0.06 * s.imu_acc[0];
    f[13] = s.imu_gyro[1];
    f[14] = clamp(s.obstacle_dx / 3.0, -1.0, 1.0);
    f[15] = clamp(s.obstacle_height / 0.40, 0.0, 1.0);
    f[16] = clamp(s.obstacle_width / 1.00, 0.0, 1.0);
    f[17] = clamp(s.toe_clearance / 0.30, -1.0, 1.0);
    return f;
}

struct actor_critic_model {
    std::array<std::array<scalar_t, kFeatures>, kActions> policy_w{};
    std::array<scalar_t, kActions> policy_b{};
    std::array<scalar_t, kFeatures> value_w{};
    scalar_t value_b = 0.0;

    std::array<std::array<scalar_t, kFeatures>, kActions> grad_policy_w{};
    std::array<scalar_t, kActions> grad_policy_b{};
    std::array<scalar_t, kFeatures> grad_value_w{};
    scalar_t grad_value_b = 0.0;

    void randomize(const std::uint32_t seed) {
        std::mt19937 rng(seed);
        std::normal_distribution<scalar_t> dist(0.0, 0.05);
        for(std::size_t a = 0u; a < kActions; ++a) {
            for(std::size_t i = 0u; i < kFeatures; ++i) {
                policy_w[a][i] = dist(rng);
            }
            policy_b[a] = dist(rng);
        }
        for(std::size_t i = 0u; i < kFeatures; ++i) {
            value_w[i] = dist(rng);
        }
        value_b = 0.0;
    }

    void zero_grad() {
        for(auto & row : grad_policy_w) {
            row.fill(0.0);
        }
        grad_policy_b.fill(0.0);
        grad_value_w.fill(0.0);
        grad_value_b = 0.0;
    }

    [[nodiscard]] std::array<scalar_t, kActions>
    logits(const std::array<scalar_t, kFeatures> & f) const {
        std::array<scalar_t, kActions> out{};
        for(std::size_t a = 0u; a < kActions; ++a) {
            scalar_t z = policy_b[a];
            for(std::size_t i = 0u; i < kFeatures; ++i) {
                z += policy_w[a][i] * f[i];
            }
            out[a] = z;
        }
        return out;
    }

    [[nodiscard]] std::array<scalar_t, kActions>
    probs(const std::array<scalar_t, kFeatures> & f) const {
        const auto z = logits(f);
        scalar_t max_z = z[0];
        for(std::size_t a = 1u; a < kActions; ++a) {
            max_z = std::max(max_z, z[a]);
        }
        std::array<scalar_t, kActions> p{};
        scalar_t denom = 0.0;
        for(std::size_t a = 0u; a < kActions; ++a) {
            p[a] = std::exp(z[a] - max_z);
            denom += p[a];
        }
        denom = std::max<scalar_t>(1e-12, denom);
        for(auto & pa : p) {
            pa /= denom;
        }
        return p;
    }

    [[nodiscard]] scalar_t
    value(const std::array<scalar_t, kFeatures> & f) const {
        scalar_t v = value_b;
        for(std::size_t i = 0u; i < kFeatures; ++i) {
            v += value_w[i] * f[i];
        }
        return v;
    }

    [[nodiscard]] std::array<scalar_t, kActions>
    action_prob_from_state(const humanoid_state & s) const {
        return probs(extract_features(s));
    }

    void step(const scalar_t learning_rate, const scalar_t grad_clip,
              const scalar_t l2_decay) {
        auto clamp_grad = [grad_clip](const scalar_t g) {
            return clamp(g, -grad_clip, grad_clip);
        };
        for(std::size_t a = 0u; a < kActions; ++a) {
            for(std::size_t i = 0u; i < kFeatures; ++i) {
                const auto g =
                    clamp_grad(grad_policy_w[a][i] + l2_decay * policy_w[a][i]);
                policy_w[a][i] -= learning_rate * g;
            }
            policy_b[a] -= learning_rate * clamp_grad(grad_policy_b[a]);
        }
        for(std::size_t i = 0u; i < kFeatures; ++i) {
            const auto g =
                clamp_grad(grad_value_w[i] + l2_decay * value_w[i]);
            value_w[i] -= learning_rate * g;
        }
        value_b -= learning_rate * clamp_grad(grad_value_b);
    }
};

class policy {
public:
    explicit policy(const actor_critic_model & model, const std::uint32_t seed)
        : model_(&model), rng_(seed) {}

    [[nodiscard]] delta::go::optimz::learning::rl::policy_sample<int, scalar_t>
    sample(const humanoid_state & s) {
        const auto p = model_->action_prob_from_state(s);
        std::discrete_distribution<int> dist(p.begin(), p.end());
        const auto a = dist(rng_);
        return {a, log_prob(s, a)};
    }

    [[nodiscard]] scalar_t log_prob(const humanoid_state & s,
                                    const int & action) const {
        const auto p = model_->action_prob_from_state(s);
        const auto idx = static_cast<std::size_t>(std::clamp(
            action, 0, static_cast<int>(kActions) - 1));
        return std::log(std::max<scalar_t>(1e-12, p[idx]));
    }

    [[nodiscard]] scalar_t entropy(const humanoid_state & s) const {
        const auto p = model_->action_prob_from_state(s);
        scalar_t h = 0.0;
        for(const auto pa : p) {
            const auto q = std::max<scalar_t>(1e-12, pa);
            h += -q * std::log(q);
        }
        return h;
    }

    [[nodiscard]] int greedy_action(const humanoid_state & s) const {
        const auto p = model_->action_prob_from_state(s);
        std::size_t best = 0u;
        for(std::size_t a = 1u; a < kActions; ++a) {
            if(p[a] > p[best]) {
                best = a;
            }
        }
        return static_cast<int>(best);
    }

private:
    const actor_critic_model * model_ = nullptr;
    std::mt19937 rng_{};
};

struct value_fn {
    const actor_critic_model * model = nullptr;

    [[nodiscard]] scalar_t value(const humanoid_state & s) const {
        return model->value(extract_features(s));
    }
};

[[nodiscard]] inline body_kinematics
forward_kinematics(const humanoid_state & s) {
    constexpr scalar_t hip_y = 0.11;
    constexpr scalar_t torso_len = 0.35;
    constexpr scalar_t l_thigh = 0.45;
    constexpr scalar_t l_shin = 0.43;
    constexpr scalar_t l_foot = 0.18;

    auto leg_points = [&](const scalar_t y, const scalar_t hip,
                          const scalar_t knee, const scalar_t ankle) {
        const auto a0 = s.torso_pitch + hip;
        const auto a1 = a0 + knee;
        const auto a2 = a1 + ankle;
        const vec3 hip_p{s.torso_x, y, s.torso_z - 0.05};
        const vec3 knee_p{
            hip_p.x + l_thigh * std::sin(a0),
            y,
            hip_p.z - l_thigh * std::cos(a0)};
        const vec3 ankle_p{
            knee_p.x + l_shin * std::sin(a1),
            y,
            knee_p.z - l_shin * std::cos(a1)};
        const vec3 toe_p{
            ankle_p.x + l_foot * std::sin(a2),
            y,
            ankle_p.z - l_foot * std::cos(a2)};
        return std::array<vec3, 4u>{hip_p, knee_p, ankle_p, toe_p};
    };

    const auto l = leg_points(+hip_y, s.q[0], s.q[1], s.q[2]);
    const auto r = leg_points(-hip_y, s.q[3], s.q[4], s.q[5]);

    body_kinematics out{};
    out.pelvis = vec3{s.torso_x, s.torso_y, s.torso_z};
    out.torso_top = vec3{
        s.torso_x + torso_len * std::sin(s.torso_pitch),
        s.torso_y,
        s.torso_z + torso_len * std::cos(s.torso_pitch)};

    out.l_hip = l[0];
    out.l_knee = l[1];
    out.l_ankle = l[2];
    out.l_toe = l[3];

    out.r_hip = r[0];
    out.r_knee = r[1];
    out.r_ankle = r[2];
    out.r_toe = r[3];
    return out;
}

[[nodiscard]] inline std::vector<obstacle> default_obstacles() {
    return std::vector<obstacle>{
        obstacle{2.1, 0.52, 0.09, 0.34},
        obstacle{3.4, 0.48, 0.10, 0.36},
        obstacle{4.8, 0.60, 0.13, 0.38},
        obstacle{6.2, 0.54, 0.11, 0.36},
        obstacle{7.6, 0.58, 0.14, 0.40},
        obstacle{9.0, 0.52, 0.12, 0.38},
    };
}

class humanoid_env {
public:
    explicit humanoid_env(const std::uint32_t seed = 20260411u,
                          const scalar_t process_noise_std = 0.02)
        : rng_(seed),
          target_v_dist_(0.38, 0.78),
          phase_dist_(-kPi, kPi),
          noise_(0.0, 1.0),
          process_noise_std_(process_noise_std),
          base_obstacles_(default_obstacles()) {
        set_curriculum_level(1.0);
    }

    void set_curriculum_level(const scalar_t level) {
        curriculum_level_ = clamp(level, 0.2, 1.0);
        obstacles_ = base_obstacles_;
        for(auto & ob : obstacles_) {
            ob.height *= curriculum_level_;
            ob.width = clamp(ob.width * (0.85 + 0.30 * curriculum_level_), 0.16, 0.60);
            ob.depth = clamp(ob.depth * (0.80 + 0.28 * curriculum_level_), 0.22, 0.52);
        }
    }

    [[nodiscard]] scalar_t curriculum_level() const noexcept {
        return curriculum_level_;
    }

    [[nodiscard]] scalar_t collision_events() const noexcept {
        return collision_events_;
    }

    [[nodiscard]] scalar_t last_step_collision() const noexcept {
        return last_step_collision_;
    }

    [[nodiscard]] humanoid_state reset() {
        step_idx_ = 0u;
        state_ = humanoid_state{};
        state_.t = 0.0;
        state_.torso_x = 0.0;
        state_.torso_y = 0.0;
        state_.torso_z = 1.0;
        state_.torso_pitch = 0.0;
        state_.vx = 0.0;
        state_.vz = 0.0;
        state_.pitch_rate = 0.0;
        state_.target_vx = target_v_dist_(rng_);
        state_.gait_phase = phase_dist_(rng_);
        state_.q = {0.08, -0.52, 0.40, -0.08, -0.52, 0.40};
        state_.dq.fill(0.0);
        state_.foot_contact = {1.0, 1.0};
        state_.imu_acc = {0.0, 0.0, 9.81};
        state_.imu_gyro.fill(0.0);
        state_.stumble = 0.0;
        collision_events_ = 0.0;
        last_step_collision_ = 0.0;
        refresh_obstacle_observation(forward_kinematics(state_));
        return state_;
    }

    [[nodiscard]]
    delta::go::optimz::learning::rl::environment_step<humanoid_state, scalar_t>
    step(const int & action) {
        const auto prev = state_;
        const auto action_idx = std::clamp(action, 0, static_cast<int>(kActions) - 1);
        const auto target = action_joint_targets(action_idx);

        for(std::size_t j = 0u; j < kJoints; ++j) {
            const auto err = target[j] - state_.q[j];
            const auto u = 6.4 * err - 1.35 * state_.dq[j];
            state_.dq[j] += dt_ * (u + 0.10 * sample_noise());
            state_.q[j] += dt_ * state_.dq[j];
        }
        clamp_joint_limits();

        state_.gait_phase = wrap_phase(state_.gait_phase + dt_ * (2.4 + 0.4 * state_.target_vx));
        auto kin = forward_kinematics(state_);
        state_.foot_contact[0] = point_is_supported(kin.l_toe, 0.03) ? 1.0 : 0.0;
        state_.foot_contact[1] = point_is_supported(kin.r_toe, 0.03) ? 1.0 : 0.0;
        refresh_obstacle_observation(kin);
        const auto near_factor = obstacle_near_factor();
        const bool near_obstacle = (state_.obstacle_dx > 0.0) &&
                                   (state_.obstacle_dx < 0.80);
        if(near_obstacle && action_idx == 5) {
            state_.dq[0] += 0.10;
            state_.dq[1] += 0.12;
            state_.dq[2] += 0.16;
            state_.vx += 0.02;
        } else if(near_obstacle && action_idx == 6) {
            state_.dq[3] += 0.10;
            state_.dq[4] += 0.12;
            state_.dq[5] += 0.16;
            state_.vx += 0.02;
        }

        const auto phase_push = phase_action_push(action_idx, state_.gait_phase);
        const auto support = 0.5 * (state_.foot_contact[0] + state_.foot_contact[1]);
        const auto stride = (state_.q[3] - state_.q[0]) + 0.35 * (state_.dq[3] - state_.dq[0]);

        const auto ax = 1.20 * phase_push + 0.85 * stride + 0.30 * support
                        - 0.75 * state_.vx - 1.15 * state_.torso_pitch
                        + 0.14 * sample_noise();
        state_.vx = clamp(state_.vx + dt_ * ax, -0.6, 2.0);
        state_.torso_x += dt_ * state_.vx;

        const auto pitch_acc = 0.90 * (state_.q[0] + state_.q[3])
                               + 0.45 * (state_.q[1] + state_.q[4])
                               - 1.85 * state_.torso_pitch - 0.58 * state_.pitch_rate
                               + ((action_idx == 4) ? -0.65 * state_.torso_pitch : 0.0)
                               + 0.09 * sample_noise();
        state_.pitch_rate += dt_ * pitch_acc;
        state_.torso_pitch =
            clamp(wrap_phase(state_.torso_pitch + dt_ * state_.pitch_rate), -1.25, 1.25);

        const auto leg_ext = 0.5 * (std::cos(state_.q[1]) + std::cos(state_.q[4]));
        state_.torso_z = clamp(0.86 + 0.23 * leg_ext - 0.11 * std::abs(state_.torso_pitch)
                                   + 0.03 * std::sin(state_.gait_phase),
                               0.45, 1.24);
        state_.vz = (state_.torso_z - prev.torso_z) / dt_;
        kin = enforce_rigid_contact();
        state_.foot_contact[0] = point_is_supported(kin.l_toe, 0.03) ? 1.0 : 0.0;
        state_.foot_contact[1] = point_is_supported(kin.r_toe, 0.03) ? 1.0 : 0.0;
        refresh_obstacle_observation(kin);
        const auto clearance_bonus = obstacle_clearance_bonus();
        const auto stumble_hit = obstacle_stumble(kin);
        last_step_collision_ = stumble_hit;
        collision_events_ += stumble_hit;
        const auto collision_penalty = near_factor * stumble_hit;

        const auto stumble_delta = update_stumble(stumble_hit);
        update_imu(prev, ax);

        state_.t += dt_;
        ++step_idx_;

        const bool terminated = (state_.torso_z < 0.40) ||
                                (std::abs(state_.torso_pitch) > 1.35) ||
                                (state_.stumble > 4.5);
        const bool truncated = step_idx_ >= max_steps_;

        const auto reward =
            compute_reward(prev, state_, stumble_delta, clearance_bonus, collision_penalty);
        return {state_, reward, terminated, !terminated && truncated};
    }

    [[nodiscard]] const std::vector<obstacle> & obstacles() const noexcept {
        return obstacles_;
    }

private:
    static constexpr std::size_t max_steps_ = 900u;
    static constexpr scalar_t dt_ = 0.04;

    std::mt19937 rng_{};
    std::uniform_real_distribution<scalar_t> target_v_dist_{};
    std::uniform_real_distribution<scalar_t> phase_dist_{};
    std::normal_distribution<scalar_t> noise_{};
    scalar_t process_noise_std_ = 0.02;
    scalar_t curriculum_level_ = 1.0;
    std::vector<obstacle> base_obstacles_{};
    std::vector<obstacle> obstacles_{};
    humanoid_state state_{};
    std::size_t step_idx_ = 0u;
    scalar_t collision_events_ = 0.0;
    scalar_t last_step_collision_ = 0.0;

    [[nodiscard]] scalar_t sample_noise() {
        return process_noise_std_ * noise_(rng_);
    }

    [[nodiscard]] static std::array<scalar_t, kJoints>
    action_joint_targets(const int action) {
        switch(action) {
        case 1:
            return {+0.34, -0.90, +0.62, -0.24, -0.18, +0.14};
        case 2:
            return {-0.24, -0.18, +0.14, +0.34, -0.90, +0.62};
        case 3:
            return {-0.16, -0.38, +0.24, +0.16, -0.38, +0.24};
        case 4:
            return {0.00, -0.62, +0.50, 0.00, -0.62, +0.50};
        case 5:  // high-step left (obstacle crossing)
            return {+0.62, -0.02, +0.92, -0.08, -0.88, +0.42};
        case 6:  // high-step right (obstacle crossing)
            return {-0.08, -0.88, +0.42, +0.62, -0.02, +0.92};
        default:
            return {0.00, -0.52, +0.40, 0.00, -0.52, +0.40};
        }
    }

    [[nodiscard]] static scalar_t phase_action_push(const int action,
                                                    const scalar_t phase) {
        const auto s = std::sin(phase);
        switch(action) {
        case 1:
            return +s;
        case 2:
            return -s;
        case 3:
            return 0.22;
        case 4:
            return -0.20;
        case 5:
            return +0.42 + 0.28 * s;
        case 6:
            return +0.42 - 0.28 * s;
        default:
            return 0.12 * s;
        }
    }

    void refresh_obstacle_observation(const body_kinematics & kin) {
        scalar_t best_dx = 6.0;
        scalar_t best_h = 0.0;
        scalar_t best_w = 0.0;
        for(const auto & ob : obstacles_) {
            const auto dx = ob.x - state_.torso_x;
            if(dx < -ob.width) {
                continue;
            }
            if(dx < best_dx) {
                best_dx = dx;
                best_h = ob.height;
                best_w = ob.width;
            }
        }

        const auto toe_z = std::max(kin.l_toe.z, kin.r_toe.z);
        state_.obstacle_dx = best_dx;
        state_.obstacle_height = best_h;
        state_.obstacle_width = best_w;
        if(best_h > 0.0) {
            state_.toe_clearance = toe_z - (best_h + 0.02);
        } else {
            state_.toe_clearance = 0.0;
        }
    }

    [[nodiscard]] scalar_t obstacle_near_factor() const {
        if(state_.obstacle_height <= 0.0) {
            return 0.0;
        }
        const auto dx = std::max<scalar_t>(0.0, state_.obstacle_dx);
        return std::exp(-2.8 * dx * dx);
    }

    [[nodiscard]] scalar_t obstacle_clearance_bonus() const {
        if(state_.obstacle_height <= 0.0) {
            return 0.0;
        }
        const auto near = obstacle_near_factor();
        const auto clearance = clamp(state_.toe_clearance, -0.20, 0.40);
        return near * std::max<scalar_t>(0.0, clearance);
    }

    [[nodiscard]] scalar_t support_surface_z(const vec3 & p) const {
        scalar_t z = 0.0;
        for(const auto & ob : obstacles_) {
            const auto x_lo = ob.x - 0.5 * ob.width;
            const auto x_hi = ob.x + 0.5 * ob.width;
            const auto y_lo = -0.5 * ob.depth;
            const auto y_hi = +0.5 * ob.depth;
            if((p.x >= x_lo) && (p.x <= x_hi) && (p.y >= y_lo) && (p.y <= y_hi)) {
                z = std::max(z, ob.height);
            }
        }
        return z;
    }

    [[nodiscard]] bool point_is_supported(const vec3 & p, const scalar_t tol) const {
        const auto z = support_surface_z(p);
        return std::abs(p.z - z) <= tol;
    }

    [[nodiscard]] body_kinematics enforce_rigid_contact() {
        auto kin = forward_kinematics(state_);
        constexpr scalar_t kContactEps = 1e-4;
        for(std::size_t iter = 0u; iter < 3u; ++iter) {
            scalar_t lift = 0.0;
            const auto l_toe_pen = support_surface_z(kin.l_toe) - kin.l_toe.z;
            const auto r_toe_pen = support_surface_z(kin.r_toe) - kin.r_toe.z;
            const auto l_ank_pen = support_surface_z(kin.l_ankle) - kin.l_ankle.z;
            const auto r_ank_pen = support_surface_z(kin.r_ankle) - kin.r_ankle.z;
            lift = std::max(lift, l_toe_pen);
            lift = std::max(lift, r_toe_pen);
            lift = std::max(lift, l_ank_pen);
            lift = std::max(lift, r_ank_pen);
            if(lift <= 0.0) {
                break;
            }
            state_.torso_z = clamp(state_.torso_z + lift + kContactEps, 0.45, 1.24);
            state_.vz = std::max<scalar_t>(0.0, state_.vz);
            kin = forward_kinematics(state_);
        }
        return kin;
    }

    void clamp_joint_limits() {
        static constexpr std::array<scalar_t, kJoints> lo{
            -0.85, -1.20, -0.40, -0.85, -1.20, -0.40};
        static constexpr std::array<scalar_t, kJoints> hi{
            +0.88, +0.30, +1.00, +0.88, +0.30, +1.00};

        for(std::size_t j = 0u; j < kJoints; ++j) {
            const auto q_old = state_.q[j];
            state_.q[j] = clamp(state_.q[j], lo[j], hi[j]);
            if(state_.q[j] != q_old) {
                state_.dq[j] *= 0.2;
            }
        }
    }

    [[nodiscard]] scalar_t obstacle_stumble(const body_kinematics & kin) {
        scalar_t hit = 0.0;
        for(const auto & obs : obstacles_) {
            const auto x_lo = obs.x - 0.5 * obs.width;
            const auto x_hi = obs.x + 0.5 * obs.width;
            const auto y_lo = -0.5 * obs.depth;
            const auto y_hi = +0.5 * obs.depth;
            const bool l_toe_pen =
                (kin.l_toe.x >= x_lo) && (kin.l_toe.x <= x_hi) &&
                (kin.l_toe.y >= y_lo) && (kin.l_toe.y <= y_hi) &&
                (kin.l_toe.z < obs.height - 0.004);
            const bool r_toe_pen =
                (kin.r_toe.x >= x_lo) && (kin.r_toe.x <= x_hi) &&
                (kin.r_toe.y >= y_lo) && (kin.r_toe.y <= y_hi) &&
                (kin.r_toe.z < obs.height - 0.004);
            const bool l_ank_pen =
                (kin.l_ankle.x >= x_lo) && (kin.l_ankle.x <= x_hi) &&
                (kin.l_ankle.y >= y_lo) && (kin.l_ankle.y <= y_hi) &&
                (kin.l_ankle.z < obs.height - 0.010);
            const bool r_ank_pen =
                (kin.r_ankle.x >= x_lo) && (kin.r_ankle.x <= x_hi) &&
                (kin.r_ankle.y >= y_lo) && (kin.r_ankle.y <= y_hi) &&
                (kin.r_ankle.z < obs.height - 0.010);
            if(l_toe_pen || r_toe_pen || l_ank_pen || r_ank_pen) {
                hit += 1.0;
            }
        }
        if(hit > 0.0) {
            state_.vx *= 0.62;
            state_.pitch_rate += 0.20 * hit;
        }
        return hit;
    }

    [[nodiscard]] scalar_t update_stumble(const scalar_t stumble_hit) {
        scalar_t delta = 0.0;
        if(stumble_hit > 0.0) {
            delta += 0.35 * stumble_hit;
        }
        if(state_.torso_z < 0.66) {
            delta += 0.20;
        }
        if(std::abs(state_.torso_pitch) > 0.62) {
            delta += 0.18;
        }
        delta = std::max<scalar_t>(0.0, delta - 0.05 * (state_.foot_contact[0] + state_.foot_contact[1]));
        state_.stumble = clamp(state_.stumble + delta, 0.0, 5.0);
        return delta;
    }

    void update_imu(const humanoid_state & prev, const scalar_t ax) {
        state_.imu_acc[0] = ax + 0.06 * sample_noise();
        state_.imu_acc[1] = 0.0;
        state_.imu_acc[2] = (state_.vz - prev.vz) / dt_ + 9.81;
        state_.imu_gyro[0] = 0.0;
        state_.imu_gyro[1] = state_.pitch_rate + 0.02 * sample_noise();
        state_.imu_gyro[2] = 0.0;
    }

    [[nodiscard]] static scalar_t
    compute_reward(const humanoid_state & prev, const humanoid_state & now,
                   const scalar_t stumble_delta,
                   const scalar_t clearance_bonus,
                   const scalar_t collision_penalty) {
        const auto speed_err = now.vx - now.target_vx;
        const auto r_speed = std::exp(-4.6 * speed_err * speed_err);
        const auto r_posture = std::exp(-6.0 * now.torso_pitch * now.torso_pitch);
        const auto h_err = now.torso_z - 1.0;
        const auto r_height = std::exp(-10.0 * h_err * h_err);
        const auto progress = std::max<scalar_t>(0.0, now.torso_x - prev.torso_x);
        const auto support = 0.5 * (now.foot_contact[0] + now.foot_contact[1]);
        const auto near =
            (now.obstacle_height > 0.0)
                ? std::exp(-2.0 * std::max<scalar_t>(0.0, now.obstacle_dx) *
                           std::max<scalar_t>(0.0, now.obstacle_dx))
                : 0.0;
        const auto slow_penalty =
            near * std::max<scalar_t>(0.0, 0.35 - now.vx);

        scalar_t energy = 0.0;
        for(const auto dq : now.dq) {
            energy += dq * dq;
        }

        return 0.85 * r_speed + 0.92 * r_posture + 0.45 * r_height +
               0.10 * support + 1.35 * progress - 0.010 * energy +
               2.60 * clearance_bonus - 2.20 * collision_penalty -
               0.50 * stumble_delta - 0.30 * slow_penalty;
    }
};

class objective {
public:
    explicit objective(actor_critic_model & model)
        : model_(&model) {}

    template <class Batch, class PolicyT, class ValueFnT>
    [[nodiscard]] auto operator()(const Batch & batch, PolicyT &, ValueFnT &) const {
        using bundle_t = delta::go::optimz::learning::rl::loss_bundle<loss_t>;

        struct sample_term {
            std::array<scalar_t, kFeatures> feature{};
            int action = 0;
            scalar_t advantage = 0.0;
            scalar_t target = 0.0;
        };

        std::vector<sample_term> terms{};
        terms.reserve(batch.rollout.num_steps());

        scalar_t actor_loss = 0.0;
        scalar_t critic_loss = 0.0;
        scalar_t entropy_bonus = 0.0;

        for(std::size_t i = 0u; i < batch.rollout.trajectories.size(); ++i) {
            const auto & traj = batch.rollout.trajectories[i];
            for(std::size_t t = 0u; t < traj.size(); ++t) {
                const auto & tr = traj[t];
                const auto f = extract_features(tr.state);
                const auto p = model_->probs(f);
                const auto idx = static_cast<std::size_t>(std::clamp(
                    tr.action, 0, static_cast<int>(kActions) - 1));
                const auto lp = std::log(std::max<scalar_t>(1e-12, p[idx]));
                const auto adv = static_cast<scalar_t>(batch.advantages[i][t]);
                const auto target = static_cast<scalar_t>(batch.targets[i][t]);
                const auto v = model_->value(f);

                actor_loss += -lp * adv;
                const auto dv = v - target;
                critic_loss += 0.5 * dv * dv;
                for(const auto pa : p) {
                    const auto q = std::max<scalar_t>(1e-12, pa);
                    entropy_bonus += -q * std::log(q);
                }
                terms.push_back(sample_term{f, tr.action, adv, target});
            }
        }

        const auto n = static_cast<scalar_t>(std::max<std::size_t>(1u, terms.size()));
        actor_loss /= n;
        critic_loss /= n;
        entropy_bonus /= n;
        const auto total = actor_loss + critic_coef_ * critic_loss -
                           entropy_coef_ * entropy_bonus;

        auto backward = [this, terms = std::move(terms), n]() {
            for(const auto & term : terms) {
                const auto p = model_->probs(term.feature);
                for(std::size_t j = 0u; j < kActions; ++j) {
                    const auto indicator =
                        (static_cast<int>(j) == term.action) ? 1.0 : 0.0;
                    scalar_t dlogit =
                        -(term.advantage / n) * (indicator - p[j]);

                    scalar_t dH_dzj = 0.0;
                    for(std::size_t i = 0u; i < kActions; ++i) {
                        const auto pi = p[i];
                        const auto dpi_dzj =
                            pi * (((i == j) ? 1.0 : 0.0) - p[j]);
                        dH_dzj +=
                            -(std::log(std::max<scalar_t>(1e-12, pi)) + 1.0) * dpi_dzj;
                    }
                    dlogit += -(entropy_coef_ / n) * dH_dzj;

                    for(std::size_t k = 0u; k < kFeatures; ++k) {
                        model_->grad_policy_w[j][k] += dlogit * term.feature[k];
                    }
                    model_->grad_policy_b[j] += dlogit;
                }

                const auto v = model_->value(term.feature);
                const auto dv = (critic_coef_ / n) * (v - term.target);
                for(std::size_t k = 0u; k < kFeatures; ++k) {
                    model_->grad_value_w[k] += dv * term.feature[k];
                }
                model_->grad_value_b += dv;
            }
        };

        bundle_t out{};
        out.actor_loss = loss_t::value_only(actor_loss);
        out.critic_loss = loss_t::value_only(critic_loss);
        out.entropy_bonus = loss_t::value_only(entropy_bonus);
        out.total_loss = loss_t::with_backward(total, std::move(backward));
        return out;
    }

private:
    actor_critic_model * model_ = nullptr;
    scalar_t critic_coef_ = 0.72;
    scalar_t entropy_coef_ = 0.01;
};

[[nodiscard]] inline std::array<scalar_t, 3u> to_xyz(const vec3 & p) {
    return {p.x, p.y, p.z};
}

[[nodiscard]] inline pose_frame
capture_pose_frame(const humanoid_state & s, const int action,
                   const scalar_t reward,
                   const scalar_t world_x_offset = 0.0) {
    const auto kin = forward_kinematics(s);
    pose_frame f{};
    f.t = s.t;
    f.action = action;
    f.reward = reward;
    f.torso_x = s.torso_x + world_x_offset;
    f.torso_y = s.torso_y;
    f.torso_z = s.torso_z;
    f.torso_pitch = s.torso_pitch;
    f.vx = s.vx;
    f.target_vx = s.target_vx;
    f.q = s.q;
    f.foot_contact = s.foot_contact;
    f.imu_acc = s.imu_acc;
    f.imu_gyro = s.imu_gyro;
    f.joints = {
        std::array<scalar_t, 3u>{kin.pelvis.x + world_x_offset, kin.pelvis.y,
                                 kin.pelvis.z},
        std::array<scalar_t, 3u>{kin.torso_top.x + world_x_offset, kin.torso_top.y,
                                 kin.torso_top.z},
        std::array<scalar_t, 3u>{kin.l_hip.x + world_x_offset, kin.l_hip.y,
                                 kin.l_hip.z},
        std::array<scalar_t, 3u>{kin.l_knee.x + world_x_offset, kin.l_knee.y,
                                 kin.l_knee.z},
        std::array<scalar_t, 3u>{kin.l_ankle.x + world_x_offset, kin.l_ankle.y,
                                 kin.l_ankle.z},
        std::array<scalar_t, 3u>{kin.l_toe.x + world_x_offset, kin.l_toe.y,
                                 kin.l_toe.z},
        std::array<scalar_t, 3u>{kin.r_hip.x + world_x_offset, kin.r_hip.y,
                                 kin.r_hip.z},
        std::array<scalar_t, 3u>{kin.r_knee.x + world_x_offset, kin.r_knee.y,
                                 kin.r_knee.z},
        std::array<scalar_t, 3u>{kin.r_ankle.x + world_x_offset, kin.r_ankle.y,
                                 kin.r_ankle.z},
        std::array<scalar_t, 3u>{kin.r_toe.x + world_x_offset, kin.r_toe.y,
                                 kin.r_toe.z},
    };
    return f;
}

[[nodiscard]] inline scalar_t
mean_tail(const std::vector<scalar_t> & xs, const std::size_t n) {
    if(xs.empty()) {
        return 0.0;
    }
    const auto begin = (xs.size() > n) ? (xs.size() - n) : 0u;
    scalar_t s = 0.0;
    for(std::size_t i = begin; i < xs.size(); ++i) {
        s += xs[i];
    }
    return s / static_cast<scalar_t>(xs.size() - begin);
}

[[nodiscard]] inline scalar_t
curriculum_schedule(const std::size_t iter, const std::size_t total_iters) {
    if(total_iters <= 1u) {
        return 1.0;
    }
    const auto p =
        static_cast<scalar_t>(iter) / static_cast<scalar_t>(total_iters - 1u);
    if(p < 0.35) {
        return 0.28 + 0.52 * (p / 0.35);
    }
    return 0.80 + 0.20 * ((p - 0.35) / 0.65);
}

[[nodiscard]] inline scalar_t
after_checkpoint_score(const episode_trace & tr) {
    return tr.final_x + 0.35 * tr.mean_reward - (tr.fell ? 1.50 : 0.0);
}

[[nodiscard]] inline std::size_t
count_passed_obstacles(const scalar_t x,
                       const std::vector<obstacle> & obstacles) {
    std::size_t n = 0u;
    for(const auto & ob : obstacles) {
        if(x > (ob.x + 0.5 * ob.width)) {
            ++n;
        }
    }
    return n;
}

[[nodiscard]] inline avoidance_eval
evaluate_avoidance(const actor_critic_model & model, const scalar_t curriculum,
                   const std::uint32_t seed, const std::size_t episodes = 18u) {
    avoidance_eval out{};
    policy pol(model, seed + 41u);
    for(std::size_t ep = 0u; ep < episodes; ++ep) {
        humanoid_env env(seed + static_cast<std::uint32_t>(ep), 0.012);
        env.set_curriculum_level(curriculum);
        auto s = env.reset();
        scalar_t ret = 0.0;
        bool fell = false;
        for(std::size_t t = 0u; t < 900u; ++t) {
            const int action = pol.greedy_action(s);
            const auto step = env.step(action);
            ret += step.reward;
            s = step.next_state;
            if(step.done()) {
                fell = step.terminated;
                break;
            }
        }

        const auto passed = static_cast<scalar_t>(
            count_passed_obstacles(s.torso_x, env.obstacles()));
        out.mean_return += ret;
        out.mean_final_x += s.torso_x;
        out.mean_passed_obstacles += passed;
        out.mean_collisions += env.collision_events();
        const bool success =
            (!fell) && (passed >= static_cast<scalar_t>(env.obstacles().size()));
        out.success_rate += success ? 1.0 : 0.0;
    }

    const auto inv = 1.0 / static_cast<scalar_t>(std::max<std::size_t>(1u, episodes));
    out.mean_return *= inv;
    out.mean_final_x *= inv;
    out.mean_passed_obstacles *= inv;
    out.mean_collisions *= inv;
    out.success_rate *= inv;
    return out;
}

[[nodiscard]] inline scalar_t
avoidance_checkpoint_score(const avoidance_eval & e) {
    return 18.0 * e.mean_passed_obstacles + 6.0 * e.success_rate -
           0.35 * e.mean_collisions + 0.12 * e.mean_final_x;
}

[[nodiscard]] inline scalar_t
estimate_policy_entropy(const actor_critic_model & model,
                        const std::uint32_t seed) {
    humanoid_env probe(seed, 0.0);
    policy pol(model, seed + 17u);
    scalar_t h = 0.0;
    constexpr std::size_t kProbeStates = 12u;
    for(std::size_t i = 0u; i < kProbeStates; ++i) {
        const auto s = probe.reset();
        h += pol.entropy(s);
    }
    return h / static_cast<scalar_t>(kProbeStates);
}

[[nodiscard]] inline episode_trace
rollout_episode(const actor_critic_model & model, const bool greedy,
                const std::uint32_t seed,
                const scalar_t curriculum_level = 1.0,
                const std::size_t fixed_frames = 900u) {
    humanoid_env env(seed, 0.0);
    env.set_curriculum_level(curriculum_level);
    policy pol(model, seed + 31u);
    episode_trace out{};
    auto s = env.reset();
    scalar_t world_x_offset = 0.0;
    scalar_t reward_sum = 0.0;
    out.frames.reserve(fixed_frames);

    for(std::size_t t = 0u; t < fixed_frames; ++t) {
        const int action = greedy ? pol.greedy_action(s) : pol.sample(s).action;
        const auto step = env.step(action);
        reward_sum += step.reward;
        out.frames.push_back(
            capture_pose_frame(step.next_state, action, step.reward, world_x_offset));
        s = step.next_state;
        if(step.done()) {
            out.fell = out.fell || step.terminated;
            world_x_offset += std::max<scalar_t>(0.40, s.torso_x + 0.35);
            s = env.reset();
        }
    }

    out.final_x = world_x_offset + s.torso_x;
    out.mean_reward = reward_sum / static_cast<scalar_t>(fixed_frames);
    return out;
}

[[nodiscard]] inline training_bundle run_training(const bool verbose) {
    training_bundle out{};

    actor_critic_model model{};
    model.randomize(20260412u);
    const auto model_before = model;

    delta::go::optimz::learning::rl::on_policy_config<scalar_t> cfg{};
    cfg.trajectories_per_iter = 24u;
    cfg.rollout_horizon = 220u;
    cfg.gamma = 0.985;
    cfg.gae_lambda = 0.95;
    cfg.bootstrap_terminal_state = false;
    delta::go::optimz::learning::rl::on_policy_actor_critic_engine<scalar_t> engine(cfg);

    humanoid_env env(20260413u, 0.024);
    policy pol(model, 20260414u);
    value_fn val{&model};
    objective obj(model);

    scalar_t lr = 0.024;
    auto opt = delta::go::optimz::learning::rl::make_callback_optimizer<loss_t>(
        [&model]() { model.zero_grad(); },
        [&model, &lr]() { model.step(lr, 3.5, 4e-5); });

    constexpr std::size_t kIters = 260u;
    constexpr std::size_t kEvalFrames = 900u;
    constexpr std::size_t kStageStride = 20u;
    out.mean_return.reserve(kIters);
    out.actor_loss.reserve(kIters);
    out.critic_loss.reserve(kIters);
    out.policy_entropy.reserve(kIters);
    out.learning_path.reserve(1u + (kIters / kStageStride) + 2u);
    actor_critic_model selected_after_model = model_before;
    scalar_t selected_curriculum = 1.0;
    auto stage0_trace =
        rollout_episode(model_before, true, 20262000u, 0.28, kEvalFrames);
    humanoid_env stage0_env(20262000u, 0.0);
    stage0_env.set_curriculum_level(0.28);
    out.learning_path.push_back(
        learning_stage{0u, 0.28, stage0_trace, stage0_env.obstacles()});
    out.before_eval = evaluate_avoidance(model_before, 1.0, 20264000u);
    out.selected_after_iter = 0u;
    out.selected_after_score = avoidance_checkpoint_score(out.before_eval);
    out.selected_after_curriculum = 1.0;

    for(std::size_t i = 0u; i < kIters; ++i) {
        const auto curriculum = curriculum_schedule(i, kIters);
        env.set_curriculum_level(curriculum);
        lr = 0.024 / (1.0 + 0.012 * static_cast<scalar_t>(i));
        const auto report = engine.iterate(env, pol, val, obj, opt);
        out.mean_return.push_back(report.mean_return);
        out.actor_loss.push_back(report.actor_loss.value());
        out.critic_loss.push_back(report.critic_loss.value());
        out.policy_entropy.push_back(estimate_policy_entropy(model, 20261000u + static_cast<std::uint32_t>(i)));

        if(((i + 1u) % kStageStride) == 0u || (i + 1u) == kIters) {
            auto stage_trace = rollout_episode(
                model, true, 20262001u + static_cast<std::uint32_t>(i),
                curriculum, kEvalFrames);
            humanoid_env stage_env(20263000u + static_cast<std::uint32_t>(i), 0.0);
            stage_env.set_curriculum_level(curriculum);
            out.learning_path.push_back(learning_stage{
                i + 1u,
                curriculum,
                stage_trace,
                stage_env.obstacles()});

            const auto eval =
                evaluate_avoidance(model, 1.0, 20265000u + static_cast<std::uint32_t>(i),
                                   16u);
            const auto score = avoidance_checkpoint_score(eval);
            if(score > out.selected_after_score) {
                out.selected_after_score = score;
                out.selected_after_iter = i + 1u;
                selected_after_model = model;
                selected_curriculum = curriculum;
            }
        }
    }

    humanoid_env probe(20260416u, 0.0);
    probe.set_curriculum_level(1.0);
    const auto probe_state = probe.reset();
    out.before_action_prob = model_before.action_prob_from_state(probe_state);
    out.after_action_prob = selected_after_model.action_prob_from_state(probe_state);
    out.before = rollout_episode(model_before, true, 20260417u, 1.0, kEvalFrames);
    out.after = rollout_episode(selected_after_model, true, 20260418u, 1.0,
                                kEvalFrames);
    out.after_eval = evaluate_avoidance(selected_after_model, 1.0, 20266000u);
    out.selected_after_curriculum = selected_curriculum;
    out.obstacles = probe.obstacles();

    if(verbose) {
        auto print_prob = [](const char * tag,
                             const std::array<scalar_t, kActions> & prob) {
            std::cout << "  " << tag << "=[";
            for(std::size_t i = 0u; i < prob.size(); ++i) {
                if(i) {
                    std::cout << ", ";
                }
                std::cout << prob[i];
            }
            std::cout << "]\n";
        };
        std::cout << "[rl-humanoid-walk] train_tail_mean_return="
                  << mean_tail(out.mean_return, 12u) << "\n";
        print_prob("action_prob_before", out.before_action_prob);
        print_prob("action_prob_after", out.after_action_prob);
        std::cout << "  before(mean_reward=" << out.before.mean_reward
                  << ", final_x=" << out.before.final_x
                  << ", fell=" << (out.before.fell ? "true" : "false") << ")\n";
        std::cout << "  after(mean_reward=" << out.after.mean_reward
                  << ", final_x=" << out.after.final_x
                  << ", fell=" << (out.after.fell ? "true" : "false") << ")\n";
        std::cout << "  selected_after_iter=" << out.selected_after_iter
                  << ", selected_after_score=" << out.selected_after_score
                  << ", selected_after_curriculum="
                  << out.selected_after_curriculum
                  << "\n";
        std::cout << "  before_eval(pass=" << out.before_eval.mean_passed_obstacles
                  << ", collisions=" << out.before_eval.mean_collisions
                  << ", success=" << out.before_eval.success_rate << ")\n";
        std::cout << "  after_eval(pass=" << out.after_eval.mean_passed_obstacles
                  << ", collisions=" << out.after_eval.mean_collisions
                  << ", success=" << out.after_eval.success_rate << ")\n";
        std::cout << "  learning_path_stages=" << out.learning_path.size() << "\n";
    }

    return out;
}

inline void write_pose_frame_json(std::ofstream & out, const pose_frame & f) {
    out << "{";
    out << "\"t\":" << f.t << ",";
    out << "\"action\":" << f.action << ",";
    out << "\"reward\":" << f.reward << ",";
    out << "\"torso\":[" << f.torso_x << "," << f.torso_y << "," << f.torso_z << "],";
    out << "\"torso_pitch\":" << f.torso_pitch << ",";
    out << "\"vx\":" << f.vx << ",";
    out << "\"target_vx\":" << f.target_vx << ",";
    out << "\"q\":";
    delta::go::app::common::write_fixed_array(out, f.q);
    out << ",\"foot_contact\":";
    delta::go::app::common::write_fixed_array(out, f.foot_contact);
    out << ",\"imu_acc\":";
    delta::go::app::common::write_fixed_array(out, f.imu_acc);
    out << ",\"imu_gyro\":";
    delta::go::app::common::write_fixed_array(out, f.imu_gyro);
    out << ",\"joints\":[";
    for(std::size_t i = 0u; i < f.joints.size(); ++i) {
        if(i) {
            out << ",";
        }
        out << "[" << f.joints[i][0] << "," << f.joints[i][1] << ","
            << f.joints[i][2] << "]";
    }
    out << "]";
    out << "}";
}

inline void write_trace_json(std::ofstream & out, const episode_trace & tr) {
    out << "{";
    out << "\"mean_reward\":" << tr.mean_reward << ",";
    out << "\"final_x\":" << tr.final_x << ",";
    out << "\"fell\":" << (tr.fell ? "true" : "false") << ",";
    out << "\"frames\":[";
    for(std::size_t i = 0u; i < tr.frames.size(); ++i) {
        if(i) {
            out << ",";
        }
        write_pose_frame_json(out, tr.frames[i]);
    }
    out << "]";
    out << "}";
}

inline void write_learning_stage_json(std::ofstream & out,
                                      const learning_stage & stage) {
    out << "{";
    out << "\"iter\":" << stage.iter << ",";
    out << "\"curriculum\":" << stage.curriculum << ",";
    out << "\"obstacles\":[";
    for(std::size_t i = 0u; i < stage.obstacles.size(); ++i) {
        if(i) {
            out << ",";
        }
        const auto & ob = stage.obstacles[i];
        out << "{\"x\":" << ob.x << ",\"width\":" << ob.width
            << ",\"height\":" << ob.height << ",\"depth\":" << ob.depth << "}";
    }
    out << "],";
    out << "\"trace\":";
    write_trace_json(out, stage.trace);
    out << "}";
}

[[nodiscard]] inline bool
write_payload_json(const std::filesystem::path & out_path,
                   const training_bundle & bundle) {
    return delta::go::app::common::export_json(
        out_path, [&](std::ofstream & out) {
            out << "{\n";
            out << "  \"meta\": {\n";
            out << "    \"generator\": \"app_demo_rl_humanoid_walk\",\n";
            out << "    \"backend\": \"optimz.learning.rl.on_policy_actor_critic_engine\",\n";
            out << "    \"state\": \"simulated_humanoid_3d_proxy\",\n";
            out << "    \"action_count\": " << kActions << ",\n";
            out << "    \"feature_count\": " << kFeatures << "\n";
            out << "  },\n";
            out << "  \"training\": {\n";
            out << "    \"mean_return\": ";
            delta::go::app::common::write_numeric_array(out, bundle.mean_return);
            out << ",\n";
            out << "    \"actor_loss\": ";
            delta::go::app::common::write_numeric_array(out, bundle.actor_loss);
            out << ",\n";
            out << "    \"critic_loss\": ";
            delta::go::app::common::write_numeric_array(out, bundle.critic_loss);
            out << ",\n";
            out << "    \"policy_entropy\": ";
            delta::go::app::common::write_numeric_array(out, bundle.policy_entropy);
            out << "\n";
            out << "  },\n";
            out << "  \"action_prob\": {\n";
            out << "    \"before\": ";
            delta::go::app::common::write_fixed_array(out, bundle.before_action_prob);
            out << ",\n";
            out << "    \"after\": ";
            delta::go::app::common::write_fixed_array(out, bundle.after_action_prob);
            out << "\n";
            out << "  },\n";
            out << "  \"selection\": {\n";
            out << "    \"selected_after_iter\": " << bundle.selected_after_iter
                << ",\n";
            out << "    \"selected_after_score\": " << bundle.selected_after_score
                << ",\n";
            out << "    \"selected_after_curriculum\": "
                << bundle.selected_after_curriculum << "\n";
            out << "  },\n";
            out << "  \"evaluation\": {\n";
            out << "    \"before\": {\"mean_return\":" << bundle.before_eval.mean_return
                << ",\"mean_final_x\":" << bundle.before_eval.mean_final_x
                << ",\"mean_passed_obstacles\":"
                << bundle.before_eval.mean_passed_obstacles
                << ",\"mean_collisions\":" << bundle.before_eval.mean_collisions
                << ",\"success_rate\":" << bundle.before_eval.success_rate
                << "},\n";
            out << "    \"after\": {\"mean_return\":" << bundle.after_eval.mean_return
                << ",\"mean_final_x\":" << bundle.after_eval.mean_final_x
                << ",\"mean_passed_obstacles\":"
                << bundle.after_eval.mean_passed_obstacles
                << ",\"mean_collisions\":" << bundle.after_eval.mean_collisions
                << ",\"success_rate\":" << bundle.after_eval.success_rate
                << "}\n";
            out << "  },\n";
            out << "  \"obstacles\": [";
            for(std::size_t i = 0u; i < bundle.obstacles.size(); ++i) {
                if(i) {
                    out << ",";
                }
                const auto & ob = bundle.obstacles[i];
                out << "{\"x\":" << ob.x << ",\"width\":" << ob.width
                    << ",\"height\":" << ob.height << ",\"depth\":" << ob.depth
                    << "}";
            }
            out << "],\n";
            out << "  \"trace\": {\n";
            out << "    \"before\": ";
            write_trace_json(out, bundle.before);
            out << ",\n";
            out << "    \"after\": ";
            write_trace_json(out, bundle.after);
            out << "\n";
            out << "  },\n";
            out << "  \"learning_path\": [";
            for(std::size_t i = 0u; i < bundle.learning_path.size(); ++i) {
                if(i) {
                    out << ",";
                }
                write_learning_stage_json(out, bundle.learning_path[i]);
            }
            out << "]\n";
            out << "}\n";
        });
}

[[nodiscard]] inline std::filesystem::path default_json_out_path() {
    return delta::go::app::common::detect_repo_root_from_cwd() / "App" /
           "demo_rl_humanoid_walk" / "rl_humanoid_walk_data.json";
}

}  // namespace rl_humanoid_detail

inline bool
export_rl_humanoid_walk_web_json(const std::filesystem::path & out_path) {
    const auto bundle = rl_humanoid_detail::run_training(true);
    if(!rl_humanoid_detail::write_payload_json(out_path, bundle)) {
        std::cerr << "[rl-humanoid-walk] failed to write: "
                  << out_path.string() << "\n";
        return false;
    }
    std::cout << "[rl-humanoid-walk] wrote json: " << out_path.string() << "\n";
    return true;
}

inline void run_rl_humanoid_walk_web_demo() {
    const auto out = rl_humanoid_detail::default_json_out_path();
    if(!export_rl_humanoid_walk_web_json(out)) {
        throw std::logic_error("run_rl_humanoid_walk_web_demo: export failed");
    }
}

}  // namespace demo_app
}  // namespace optimz
}  // namespace go
}  // namespace delta

#endif  // APP_DEMO_RL_HUMANOID_WALK_WEB_DEMO_HPP
