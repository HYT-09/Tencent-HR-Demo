const { v4: uuidv4 } = require('uuid');

function seed(db) {
  // 岗位数据
  const jobs = [
    {
      id: uuidv4(), title: '前端开发工程师', department: '微信事业群', city: '深圳/广州',
      education_req: '本科', major_req: '计算机科学,软件工程,电子信息',
      skills_req: 'React,Vue,TypeScript,JavaScript,CSS,HTML',
      responsibilities: '负责微信生态前端开发，包括小程序、H5页面等；参与前端架构设计与性能优化；与产品、设计紧密协作，提升用户体验',
      apply_url: 'https://join.qq.com/detail?id=fe_001', salary_range: '30K-50K'
    },
    {
      id: uuidv4(), title: 'AI算法工程师', department: 'AI Lab', city: '深圳/北京',
      education_req: '硕士', major_req: '计算机科学,人工智能,数学,统计学',
      skills_req: 'Python,机器学习,深度学习,TensorFlow,PyTorch,NLP,CV',
      responsibilities: '参与自然语言处理和计算机视觉算法研发；负责大模型训练与优化；推动AI技术在腾讯产品中的落地应用',
      apply_url: 'https://join.qq.com/detail?id=ai_001', salary_range: '40K-65K'
    },
    {
      id: uuidv4(), title: '后端开发工程师', department: '技术工程事业群', city: '深圳',
      education_req: '本科', major_req: '计算机科学,软件工程',
      skills_req: 'Java,Go,C++,分布式系统,微服务,数据库',
      responsibilities: '负责腾讯云核心服务后端开发；设计高可用、高性能分布式系统；参与技术架构演进与基础设施建设',
      apply_url: 'https://join.qq.com/detail?id=be_001', salary_range: '35K-55K'
    },
    {
      id: uuidv4(), title: '产品经理', department: 'PCG', city: '北京/深圳',
      education_req: '本科', major_req: '不限',
      skills_req: '产品设计,用户研究,数据分析,项目管理,沟通',
      responsibilities: '负责信息流产品功能规划与设计；分析用户需求与市场趋势；协调研发团队推动产品迭代上线',
      apply_url: 'https://join.qq.com/detail?id=pm_001', salary_range: '25K-40K'
    },
    {
      id: uuidv4(), title: '数据分析工程师', department: 'CSIG', city: '深圳/上海',
      education_req: '本科', major_req: '统计学,数学,计算机科学,经济学',
      skills_req: 'Python,SQL,数据分析,数据可视化,机器学习',
      responsibilities: '负责业务数据建模与分析；构建数据指标体系与监控看板；为产品决策提供数据支持',
      apply_url: 'https://join.qq.com/detail?id=da_001', salary_range: '28K-45K'
    },
    {
      id: uuidv4(), title: '游戏客户端开发工程师', department: 'IEG', city: '深圳/上海/成都',
      education_req: '本科', major_req: '计算机科学,软件工程,数字媒体',
      skills_req: 'C++,Unreal,Unity,图形学,游戏引擎',
      responsibilities: '参与游戏客户端核心功能开发；优化游戏渲染性能与内存管理；协助解决技术难题',
      apply_url: 'https://join.qq.com/detail?id=game_001', salary_range: '35K-55K'
    },
    {
      id: uuidv4(), title: '安全工程师', department: '安全平台部', city: '深圳',
      education_req: '本科', major_req: '信息安全,计算机科学,网络工程',
      skills_req: '网络安全,渗透测试,安全审计,漏洞挖掘',
      responsibilities: '负责腾讯产品安全评估与渗透测试；建设安全防护体系；跟踪最新安全威胁与攻防技术',
      apply_url: 'https://join.qq.com/detail?id=sec_001', salary_range: '30K-50K'
    },
    {
      id: uuidv4(), title: '交互设计师', department: 'ISUX', city: '深圳',
      education_req: '本科', major_req: '设计学,人机交互,心理学',
      skills_req: 'UI设计,UX设计,Figma,设计系统,用户研究',
      responsibilities: '负责核心产品交互设计；建立和维护设计规范与组件库；推动设计驱动的产品创新',
      apply_url: 'https://join.qq.com/detail?id=ux_001', salary_range: '25K-40K'
    },
    {
      id: uuidv4(), title: '运营开发工程师', department: 'OMG', city: '北京',
      education_req: '本科', major_req: '计算机科学,软件工程',
      skills_req: 'Python,Go,数据分析,运营系统开发',
      responsibilities: '负责广告运营平台开发与维护；构建数据驱动的运营工具体系；优化运营效率与决策支持',
      apply_url: 'https://join.qq.com/detail?id=op_001', salary_range: '28K-45K'
    },
    {
      id: uuidv4(), title: '云计算架构师', department: 'CSIG', city: '深圳/北京',
      education_req: '硕士', major_req: '计算机科学,软件工程,分布式系统',
      skills_req: '云计算,分布式系统,Kubernetes,Docker,微服务架构',
      responsibilities: '设计腾讯云核心架构方案；推动云原生技术落地；负责大规模集群的稳定性与性能优化',
      apply_url: 'https://join.qq.com/detail?id=cloud_001', salary_range: '45K-70K'
    }
  ];

  const insertJob = db.prepare(`
    INSERT INTO jobs (id, title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const job of jobs) {
    insertJob.run(job.id, job.title, job.department, job.city, job.education_req,
      job.major_req, job.skills_req, job.responsibilities, job.apply_url, job.salary_range);
  }

  // 用户数据
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, phone, education, major, skills, experience, projects, resume_parsed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    {
      id: uuidv4(), name: '张明远', phone: '13800001001', education: '硕士', major: '计算机科学与技术',
      skills: 'Python, 机器学习, 深度学习, TensorFlow, 数据分析, React',
      experience: '字节跳动AI算法实习生（2025.06-2025.12）- 参与推荐系统算法优化；腾讯微信支付数据分析实习生（2024.12-2025.05）',
      projects: '基于Transformer的文本分类系统；电商用户画像与智能推荐平台'
    },
    {
      id: uuidv4(), name: '李思琪', phone: '13800001002', education: '本科', major: '软件工程',
      skills: 'React, Vue, TypeScript, JavaScript, CSS, Node.js',
      experience: '美团前端开发实习生（2025.03-2025.09）- 负责商家端管理页面开发',
      projects: '开源UI组件库；校园社交小程序'
    },
    {
      id: uuidv4(), name: '王浩然', phone: '13800001003', education: '硕士', major: '人工智能',
      skills: 'Python, PyTorch, NLP, CV, 深度学习, 大模型',
      experience: '微软亚洲研究院研究实习生（2025.01-2025.07）- 参与大语言模型训练',
      projects: '多模态对话系统；知识图谱问答系统'
    },
    {
      id: uuidv4(), name: '陈雨萱', phone: '13800001004', education: '本科', major: '统计学',
      skills: 'Python, SQL, 数据分析, 数据可视化, Tableau, 机器学习',
      experience: '京东数据分析实习生（2025.05-2025.11）- 负责用户行为分析与报表建设',
      projects: '零售销售预测模型；数据可视化大屏'
    },
    {
      id: uuidv4(), name: '刘子轩', phone: '13800001005', education: '硕士', major: '计算机科学',
      skills: 'Java, Go, 分布式系统, 微服务, Kubernetes, 数据库',
      experience: '阿里云后端开发实习生（2025.02-2025.08）- 参与云服务后端架构开发',
      projects: '分布式任务调度系统；微服务网关'
    }
  ];

  for (const u of users) {
    const parsed = JSON.stringify({
      education: u.education, major: u.major, skills: u.skills,
      experience: u.experience, projects: u.projects
    });
    insertUser.run(u.id, u.name, u.phone, u.education, u.major, u.skills, u.experience, u.projects, parsed);
  }

  // HR用户
  const insertHr = db.prepare('INSERT INTO hr_users (id, name, email, department) VALUES (?, ?, ?, ?)');
  insertHr.run(uuidv4(), '陈HR', 'chen.hr@tencent.com', '微信事业群');
  insertHr.run(uuidv4(), '王HR', 'wang.hr@tencent.com', 'AI Lab');
  insertHr.run(uuidv4(), '李HR', 'li.hr@tencent.com', '技术工程事业群');

  // 投递记录
  const insertApp = db.prepare(`
    INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 为第一个用户创建投递记录
  const user1 = users[0];
  const hr1 = db.prepare('SELECT * FROM hr_users LIMIT 1').get();
  
  insertApp.run(uuidv4(), user1.id, jobs[0].id, 92, 'S', JSON.stringify({total:92}), 'applied', hr1.id);
  insertApp.run(uuidv4(), user1.id, jobs[1].id, 95, 'S', JSON.stringify({total:95}), 'invited', hr1.id);
  insertApp.run(uuidv4(), user1.id, jobs[4].id, 78, 'B', JSON.stringify({total:78}), 'rejected', hr1.id);
  insertApp.run(uuidv4(), user1.id, jobs[2].id, 85, 'A', JSON.stringify({total:85}), 'applied', hr1.id);
  insertApp.run(uuidv4(), user1.id, jobs[9].id, 88, 'A', JSON.stringify({total:88}), 'applied', hr1.id);

  // 为第二个用户创建投递记录
  const user2 = users[1];
  insertApp.run(uuidv4(), user2.id, jobs[0].id, 90, 'S', JSON.stringify({total:90}), 'invited', hr1.id);
  insertApp.run(uuidv4(), user2.id, jobs[3].id, 75, 'B', JSON.stringify({total:75}), 'applied', hr1.id);

  // 已拒绝候选人池
  const insertReject = db.prepare(`
    INSERT INTO rejections (id, user_id, original_job_id, original_match_score, original_match_level, reject_reason, hr_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertReject.run(uuidv4(), user1.id, jobs[4].id, 78, 'B', '专业技能匹配度不足', hr1.id);
  insertReject.run(uuidv4(), user2.id, jobs[3].id, 75, 'B', '项目经验不足', hr1.id);

  console.log(`✅ 种子数据初始化完成: ${jobs.length}个岗位, ${users.length}个用户`);
}

module.exports = seed;
