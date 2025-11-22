import { BookOpen, Code, Cpu, Award, Terminal, Layers, Brain } from "lucide-react";

export const PROFILE = {
  name: "Zihong Luo",
  email: "Z.Luo21@student.liverpool.ac.uk",
  website: "logan-0623.github.io",
  scholar: "https://scholar.google.com/citations?user=8SLtiQgAAAAJ&hl=zh-CN&authuser=1",
  title: "Embodied Intelligence Researcher",
  description: "Research-driven undergraduate transitioning from Multimodal Perception to Embodied Intelligence. Strong track record in representation learning (AAAI, BIBM, ICPR) and hands-on experience in VLA policy learning and robotic manipulation.",
  goal: "Seeking a Master’s program to bridge high-level AI reasoning and low-level control/dynamics.",
};

export const CODE_SNIPPETS = [
  "import torch",
  "import torch.nn as nn",
  "class RobotPolicy(nn.Module):",
  "    def __init__(self):",
  "        super().__init__()",
  "        self.encoder = VisionTransformer()",
  "    def forward(self, obs):",
  "        return self.act(obs)",
  "optimizer = torch.optim.Adam(model.parameters())",
  "def train_step(batch):",
  "    loss = criterion(pred, target)",
  "    loss.backward()",
  "ros2 launch robot_control start.launch.py",
  "std::vector<double> calculate_ik(Pose target);",
  "void update_pid(double error) {",
  "    integral += error * dt;",
  "    derivative = (error - prev) / dt;",
  "}",
  "ssh pi@192.168.1.105",
  "git commit -m 'Update VLA policy'",
  "docker-compose up -d",
  "const agent = new EmbodiedAgent();",
  "await agent.perceive(environment);",
  "if (collision) emergency_stop();",
  "q_new = q_current + J_pseudo * error;",
];

export const EDUCATION = [
  {
    school: "University of Liverpool (UoL)",
    location: "Liverpool, UK",
    degree: "BSc in Computing Science",
    gpa: "3.87/4.0",
    honors: "First Class Honours projected",
    period: "Expected Jun 2026",
  },
  {
    school: "Xi’an Jiaotong-Liverpool University (XJTLU)",
    location: "Suzhou, China",
    degree: "BSc in Information & Computing Science",
    gpa: "3.87/4.0",
    period: "Sep 2022 – Jun 2026",
  },
];

export const COURSEWORK = [
  "Machine Learning", "Deep Learning", "Computer Vision", "Knowledge Representation", "Numerical Analysis", "Applied Physics"
];

export const EXPERIENCE = [
  {
    id: 1,
    role: "Research Assistant",
    lab: "SmartLab, University of Liverpool",
    location: "Liverpool, UK",
    advisor: "Prof. Trendaferov",
    period: "Oct 2025 – Present",
    details: [
      "Project: High-level trajectory reasoning for robotic end-effectors.",
      "Proposed GVLA: A gripper-aware Vision-Language-Action policy using Mixture-of-Experts to fuse gripper morphology with visual input.",
      "Engineered a unified text bottleneck to align natural language with kinematic constraints.",
      "Demonstrated zero-shot transfer to unseen tools on real-robot benchmarks (Franka)."
    ]
  },
  {
    id: 2,
    role: "Algorithm Intern",
    lab: "Jifu Medical (AI Algorithm Group)",
    location: "Shenzhen, China",
    period: "Jun 2025 – Aug 2025",
    details: [
      "Led feasibility study extending clinical workflow from recognition to robotic manipulation.",
      "Deployed ACT and ALOHA frameworks; built control loop using LeRobot for data logging and teleoperation.",
      "Prototyped Sim-to-Real pipeline using NVIDIA Isaac Sim, mapping perception data to actionable policies."
    ]
  },
  {
    id: 3,
    role: "Research Assistant (Remote)",
    lab: "MBZUAI",
    location: "Abu Dhabi, UAE",
    advisor: "Prof. Imran Razzak",
    period: "Dec 2024 – Jul 2025",
    details: [
      "Developed Modality Prior Aligner using Medical LLMs to guide pixel-level segmentation.",
      "Designed fusion decoder with iterative mask optimization, bridging the gap between semantic reasoning and dense prediction.",
      "Paper submitted to BIBM 2025."
    ]
  },
  {
    id: 4,
    role: "Summer Research Assistant",
    lab: "University of Exeter",
    location: "Exeter, UK",
    advisor: "Prof. Yanda Meng",
    period: "Mar 2024 – Aug 2024",
    details: [
      "Contributed to IMDR, a framework for disentangling shared vs. specific modalities in noisy environments.",
      "Implemented proxy-learning modules to ensure robust representation under missing data.",
      "Outcome: Accepted at AAAI 2025 (Oral/Poster)."
    ]
  },
  {
    id: 5,
    role: "Research Contributor",
    lab: "Tongji University School of Medicine",
    location: "Shanghai, China",
    advisor: "Prof. Xiaoyun Xie",
    period: "Nov 2023 – Jan 2024",
    details: [
      "Built interpretable ML models for DPN/LEAD prediction using SHAP analysis for risk factor analysis."
    ]
  },
  {
    id: 6,
    role: "Research Assistant",
    lab: "XJTLU",
    location: "Suzhou, China",
    period: "Sep 2023 – Nov 2023",
    details: [
      "Developed encoder-decoder with Deep Belief Network for modality completion (ICPR 2024).",
      "Integrated image + temporal signals via spiking networks for anomaly detection (ICPR 2024)."
    ]
  }
];

export const PUBLICATIONS = [
  {
    title: "PG-SAM: Prior-Guided SAM with Medical for Multi-organ Segmentation",
    venue: "BIBM 2025",
    authors: "Yiheng Zhong*, Zihong Luo*, et al.",
    status: "Submitted",
    link: "https://arxiv.org/abs/2503.18227"
  },
  {
    title: "Incomplete Modality Disentangled Representation for Ophthalmic Diagnosis",
    venue: "AAAI 2025",
    authors: "Chengzhi Liu*, Zile Huang*, Zihong Luo, et al.",
    status: "Oral/Poster",
    link: "https://imdr-aaai.github.io/"
  },
  {
    title: "ARIF: Adaptive Attention-Based Cross-Modal Representation Integration",
    venue: "ICANN 2024",
    authors: "Chengzhi Liu*, Zihong Luo*, et al.",
    status: "SpringerLink",
    link: "https://link.springer.com/chapter/10.1007/978-3-031-72347-6_1"
  },
  {
    title: "MTSA-SNN: Multimodal Time Series via Spiking Neural Networks",
    venue: "ICPR 2024",
    authors: "Chengzhi Liu*, Zihong Luo*, et al.",
    status: "arXiv",
    link: "https://arxiv.org/abs/2402.05423"
  },
  {
    title: "MC-DBN: Modality Completion with Deep Belief Networks",
    venue: "ICPR 2024",
    authors: "Zihong Luo*, Chengzhi Liu*, et al.",
    status: "arXiv",
    link: "https://arxiv.org/abs/2402.09782"
  },
  {
    title: "Interpretable ML for Peripheral Neuropathy & LEAD",
    venue: "BMC Medical Informatics 2024",
    authors: "Ya Wu, Danmeng Dong, Zihong Luo, et al.",
    status: "SpringerLink",
    link: "https://link.springer.com/article/10.1186/s12911-024-02595-z"
  }
];

export const PROJECTS = [
  {
    title: "LeRobot SO-101 Implementation",
    tags: ["Python", "PyTorch", "LeRobot"],
    year: "2025",
    description: "Implemented dual-arm teleoperation and data collection pipelines; synchronized dual-camera streams for imitation learning. Recorded and validated 50+ episodes for manipulation tasks.",
    icon: Terminal
  },
  {
    title: "Bipedal Wheeled Robot Reproduction",
    tags: ["C++", "Arduino", "ESP32", "Control Theory"],
    year: "2025",
    description: "Built a self-balancing wheel-legged robot from scratch. Implemented Inverse Kinematics (IK) for 5-link leg structure and cascaded PID controllers for balance using IMU feedback.",
    icon: Cpu
  }
];

export const SKILLS = [
  { category: "AI & Compute", items: ["Python", "PyTorch", "TensorFlow", "OpenCV", "Transformers", "LLMs"], icon: Brain },
  { category: "Robotics & Sim", items: ["ROS/ROS2", "Isaac Sim", "MuJoCo", "LeRobot", "URDF", "Kinematics (IK/FK)"], icon: Layers },
  { category: "Hardware", items: ["C++", "Arduino", "Raspberry Pi", "Sensors (IMU, LiDAR)"], icon: Cpu },
];

export const AWARDS = [
  "International Quant Championship (Top 0.1%, UK Finals)",
  "Biology Olympiad (Provincial 1st Prize)"
];