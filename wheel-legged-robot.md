---
layout: page
title: Wheel-Legged Robot Research and Development
permalink: /robotics/wheel-legged-robot/
---

# 轮足机器人研究与开发

## 概述

轮足机器人（Wheel-Legged Robot）是一种结合了轮式移动和足式移动优势的混合移动机器人。这种设计能够在平坦地面上实现高效的轮式移动，同时在复杂地形中利用腿部机构进行越障和适应性移动。

## 技术特点

### 1. 混合移动机制
- **轮式模式：** 在平坦地面上高效移动，速度快、能耗低
- **足式模式：** 在复杂地形中进行精确控制和越障
- **混合模式：** 同时利用轮子和腿部进行协调运动

### 2. 关键技术挑战
- **模式切换控制：** 在不同移动模式间平滑切换
- **地形感知：** 实时识别地面条件并选择最优移动策略
- **动力学建模：** 复杂的多体动力学系统建模
- **稳定性控制：** 保证在各种工况下的稳定性

## 控制算法实现

### 1. 主控制循环详解（完整版本）

这是轮足机器人的完整控制系统，集成了IMU姿态反馈、无刷电机控制和腿部运动控制：

```cpp
void loop() {
  // 1. 获取传感器数据
  BLDCData = motors.getBLDCData();    // 读取电机数据（速度、位置等）
  getMPUValue();                      // 读取IMU数据（姿态角、角速度）
  getRCValue();                       // 读取遥控器数据

  // 2. 遥控器指令映射
  robotMotion.turn = map(RCValue[0], RCCHANNEL_MIN, RCCHANNEL_MAX, -5, 5);        // 转向指令
  targetSpeed = map(RCValue[1], RCCHANNEL_MIN, RCCHANNEL_MAX, -20, 20);           // 速度指令
  Y_demand = map(RCValue[2], RCCHANNEL3_MIN, RCCHANNEL3_MAX, lowest, highest);    // 高度指令
  Phi = map(RCValue[3], RCCHANNEL_MIN, RCCHANNEL_MAX, -1*rollLimit, rollLimit);   // 滚转角指令

  // 3. 轮子平衡控制（核心算法）
  float speedAvg = (M0Dir*BLDCData.M0_Vel + M1Dir*BLDCData.M1_Vel)/2;            // 计算平均速度
  float targetAngle = PID_VEL(targetSpeed - speedAvg);                           // 速度PID控制
  float turnTorque = turnKp * (robotMotion.turn-robotPose.GyroZ);                // 转向力矩控制
  float torque1 = kp1*(targetAngle - robotPose.pitch) + turnTorque;              // 左轮力矩
  float torque2 = kp1*(targetAngle - robotPose.pitch) - turnTorque;              // 右轮力矩
  motors.setTargets(M0Dir*torque1, M1Dir*torque2);                               // 设置电机目标力矩

  // 4. 腿部姿态控制
  X = 0;                                                    // X坐标固定为0
  Y = Y + Kp_Y * (Y_demand - Y);                           // 高度渐进控制
  
  uint16_t Remoter_Input = Y;                              // 当前高度
  float E_H = (L/2) * sin(Phi*(PI/180));                   // 手动滚转补偿
  stab_roll = stab_roll + Kp_roll * (0 - robotPose.roll);  // 自动滚转稳定PID
  float L_Height = Remoter_Input + stab_roll;              // 左腿高度（自动稳定）
  float R_Height = Remoter_Input - stab_roll;              // 右腿高度（自动稳定）

  // 5. 逆运动学求解
  IKParam.XLeft = X;      IKParam.XRight = X;
  IKParam.YLeft = L_Height; IKParam.YRight = R_Height;
  inverseKinematics();                                     // 执行逆运动学计算
}
```

#### 控制系统架构分析：

**1. 多传感器融合**
- **IMU数据：** 实时姿态角（pitch, roll, yaw）和角速度
- **编码器数据：** 轮子转速反馈
- **遥控器数据：** 人工指令输入

**2. 分层控制策略**
- **上层：** 运动规划和模式切换
- **中层：** 平衡控制和姿态稳定
- **下层：** 关节角度控制和电机驱动

**3. 双重平衡机制**
- **轮子平衡：** 通过调节轮子力矩保持前后平衡
- **腿部平衡：** 通过调节腿长保持左右平衡

### 2. 逆运动学算法详解

逆运动学是将期望的足端位置转换为关节角度的核心算法：

#### 数学模型基础：
```cpp
// 连杆参数定义（在bipedal_data.h中）
L1, L2, L3, L4, L5  // 五段连杆长度
```

#### 求解过程详解：

**步骤1：建立几何约束方程**
```cpp
// 左腿约束方程系数
float aLeft = 2 * IKParam.XLeft * L1;
float bLeft = 2 * IKParam.YLeft * L1;
float cLeft = IKParam.XLeft² + IKParam.YLeft² + L1² - L2²;
float dLeft = 2 * L4 * (IKParam.XLeft - L5);
float eLeft = 2 * L4 * IKParam.YLeft;
float fLeft = (IKParam.XLeft - L5)² + L4² + IKParam.YLeft² - L3²;
```

**步骤2：使用反正切函数求解关节角**
```cpp
// 求解α角的两个可能解
alpha1 = 2 * atan((bLeft + sqrt(aLeft² + bLeft² - cLeft²)) / (aLeft + cLeft));
alpha2 = 2 * atan((bLeft - sqrt(aLeft² + bLeft² - cLeft²)) / (aLeft + cLeft));

// 求解β角的两个可能解
beta1 = 2 * atan((eLeft + sqrt(dLeft² + eLeft² - fLeft²)) / (dLeft + fLeft));
beta2 = 2 * atan((eLeft - sqrt(dLeft² + eLeft² - fLeft²)) / (dLeft + fLeft));
```

**步骤3：角度解的筛选与验证**
```cpp
// 角度标准化到[0, 2π]
alpha1 = (alpha1 >= 0) ? alpha1 : (alpha1 + 2 * PI);
alpha2 = (alpha2 >= 0) ? alpha2 : (alpha2 + 2 * PI);

// 根据物理约束选择合适解
if(alpha1 >= PI/4) IKParam.alphaLeft = alpha1;
else IKParam.alphaLeft = alpha2;

if(beta1 >= 0 && beta1 <= PI/4) IKParam.betaLeft = beta1;
else IKParam.betaLeft = beta2;
```

**步骤4：坐标系转换与舵机映射**
```cpp
// 弧度转角度
alphaLeftToAngle = (int)((IKParam.alphaLeft / 6.28) * 360);
betaLeftToAngle = (int)((IKParam.betaLeft / 6.28) * 360);

// 考虑机械结构的舵机角度映射
servoLeftFront = 90 + betaLeftToAngle;     // 左前关节
servoLeftRear = 90 + alphaLeftToAngle;     // 左后关节
servoRightFront = 270 - betaRightToAngle;  // 右前关节（镜像）
servoRightRear = 270 - alphaRightToAngle;  // 右后关节（镜像）
```

#### 算法特点：
1. **双解处理：** 每个关节角都有两个数学解，需要根据物理约束选择
2. **镜像对称：** 左右腿采用镜像映射，简化控制逻辑
3. **角度约束：** 通过范围检查确保关节角在可达工作空间内
4. **实时计算：** 算法复杂度低，适合实时控制应用

### 3. 平衡控制策略

#### 轮式平衡控制：
```cpp
// 倒立摆平衡原理
float targetAngle = PID_VEL(targetSpeed - speedAvg);        // 速度环
float torque = kp1 * (targetAngle - robotPose.pitch);       // 角度环
```

#### 腿部姿态稳定：
```cpp
// 自适应滚转补偿
stab_roll = stab_roll + Kp_roll * (0 - robotPose.roll);
```

这种设计实现了轮足机器人的核心功能：在轮式高速移动的同时保持姿态稳定。

## 相关资源

- [动手学ROS2 - 书](https://fishros.com/d2lros2/#/)

---

*本文档整理了轮足机器人的核心技术、应用现状和发展趋势，为相关研究提供参考。*

*Last updated: January 2025*
