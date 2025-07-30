---
layout: page
title: LeRobot SO101 Robotic Arm Control - Implementation & Reproduction
permalink: /lerobot-so101/
---

# LeRobot SO101 Robotic Arm Control
*Implementation and Reproduction Project - 2025*

## Project Overview

This project focuses on implementing and reproducing the LeRobot framework for SO101 dual-arm manipulation, featuring teleoperation with leader-follower configuration and synchronized dual-camera data collection.

## Hardware Setup

### Equipment List
- **SO101 Robotic Arms:** Leader arm (5V) and Follower arm (12V)
- **Dual Camera System:** Front camera (index 1) and Wrist camera (index 3)
- **Communication:** USB serial ports (COM5 for leader, COM6 for follower)

## Implementation Details

### 1. Environment Setup
```bash
conda activate lerobot
cd src
```

### 2. Port Detection & Calibration
```bash
# Detect communication ports
python -m lerobot.find_port

# Calibrate follower arm (12V)
python -m lerobot.calibrate --robot.type=so101_follower --robot.port=COM6 --robot.id=my_awesome_follower_arm

# Calibrate leader arm (5V)
python -m lerobot.calibrate --teleop.type=so101_leader --teleop.port=COM5 --teleop.id=my_awesome_leader_arm
```

### 3. Teleoperation with Dual Cameras
```bash
python -m lerobot.teleoperate \
  --robot.type=so101_follower \
  --robot.port=COM6 \
  --robot.id=my_awesome_follower_arm \
  --teleop.type=so101_leader \
  --teleop.port=COM5 \
  --teleop.id=my_awesome_leader_arm \
  --robot.cameras='{"front": {"type": "opencv", "index_or_path": 1, "width": 640, "height": 480, "fps": 30, "warmup_s": 2}, "wrist": {"type": "opencv", "index_or_path": 3, "width": 640, "height": 480, "fps": 30, "warmup_s": 2}}' \
  --display_data=true
```

### 4. Dataset Recording
```bash
python -m lerobot.record \
    --robot.type=so101_follower \
    --robot.port=COM6 \
    --robot.id=my_awesome_follower_arm \
    --robot.cameras='{"front": {"type": "opencv", "index_or_path": 1, "width": 640, "height": 480, "fps": 30, "warmup_s": 2}, "wrist": {"type": "opencv", "index_or_path": 3, "width": 640, "height": 480, "fps": 30, "warmup_s": 2}}' \
    --teleop.type=so101_leader \
    --teleop.port=COM5 \
    --teleop.id=my_awesome_leader_arm \
    --display_data=true \
    --dataset.repo_id=logan-0623/record-test \
    --dataset.num_episodes=5 \
    --dataset.single_task="Grab the white cube"
```

### 5. Replay an Episode
A useful feature is the replay function, which allows you to replay any episode that you've recorded or episodes from any dataset out there. This function helps you test the repeatability of your robot's actions and assess transferability across robots of the same model.

You can replay the first episode on your robot with either the command below or with the API example:

```bash
python -m lerobot.replay \
    --robot.type=so101_follower \
    --robot.port=COM6 \
    --robot.id=my_awesome_follower_arm \
    --dataset.repo_id=logan-0623/record-test \
    --dataset.episode=0  # choose the episode you want to replay
```

Your robot should replicate movements similar to those you recorded. This feature is essential for:
- Testing repeatability of recorded actions
- Validating data quality before training
- Debugging motion sequences

### 6. Train a Policy
To train a policy to control your robot, use the `python -m lerobot.scripts.train` script. A few arguments are required. Here is an example command:

```bash
python -m lerobot.scripts.train \
  --dataset.repo_id=logan-0623/record-test \
  --policy.type=act \
  --output_dir=outputs/train/act_so101_test \
  --job_name=act_so101_test \
  --policy.device=cuda \
  --wandb.enable=true \
  --policy.repo_id=logan-0623/my_policy
```

**Command Explanation:**
- `--dataset.repo_id`: HuggingFace dataset repository containing recorded episodes
- `--policy.type=act`: Use ACT (Action Chunking with Transformers) policy
- `--output_dir`: Local directory to save training outputs and checkpoints
- `--job_name`: Experiment name for tracking and logging
- `--policy.device=cuda`: Use GPU for training acceleration
- `--wandb.enable=true`: Enable Weights & Biases logging for experiment tracking
- `--policy.repo_id`: HuggingFace repository to upload trained policy

### 7. Evaluate Trained Policy
After training, evaluate the policy performance:

```bash
python -m lerobot.scripts.eval \
    --robot.type=so101_follower \
    --robot.port=COM6 \
    --robot.id=my_awesome_follower_arm \
    --policy.repo_id=logan-0623/my_policy \
    --eval.num_episodes=10 \
    --eval.max_episode_steps=250
```

## Key Technical Achievements

### 1. Dual-Camera Video Synchronization
- Successfully implemented synchronized video capture from front and wrist cameras
- Achieved temporal alignment between camera feeds and robotic arm movements
- Ensured consistent 30fps recording across both camera streams

### 2. Leader-Follower Teleoperation
- Configured real-time teleoperation between leader and follower arms
- Implemented precise motion mapping and control
- Achieved smooth and responsive arm movements

### 3. Dataset Collection & Upload
- Recorded 5 test episodes with synchronized dual-camera data
- Successfully uploaded datasets to HuggingFace Hub
- Integrated with HuggingFace ecosystem for model training

## Technical Challenges & Solutions

### Camera Index Configuration
**Challenge:** Determining correct camera indices for dual-camera setup

**Solution:** Systematic testing of different index combinations (0,1,3) to identify optimal configuration

### Data Synchronization
**Challenge:** Ensuring temporal alignment between camera feeds and arm movements

**Solution:** Implemented warmup periods and consistent FPS settings across all data streams

## Project Progress
- ✅ SO101 dual-camera video synchronization
- ✅ Robotic arm teleoperation with dual cameras
- ✅ Recorded 50 test episodes with synchronized data
- ✅  Model training and testing with focus on robustness
- 📋 Large-scale dataset recording with controlled scenarios
- 📋 Dataset upload to HuggingFace Hub for training
- 📋 Background sensitivity analysis

## Related Resources

- [Official LeRobot Documentation](https://huggingface.co/docs/lerobot/)
- [LeRobot GitHub Repository](https://github.com/huggingface/lerobot)
- [SO101 Setup Tutorial](https://huggingface.co/docs/lerobot/so101)

## Control Methods in Robotic Arm Trajectory Tracking

### Classical Control Approaches
- **PID Control:** Proportional-Integral-Derivative control for precise position tracking
- **Model Predictive Control (MPC):** Model-based control considering system constraints
- **Fuzzy Control:** Expert knowledge-based adaptive control
- **Neural Network Control:** Learning-based control through neural networks
- **Visual Feedback Control:** Closed-loop control using visual sensors

---

*This project demonstrates the practical implementation of modern robotic control systems and contributes to the advancement of teleoperated manipulation research.*
