require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDb, saveDb, all, get, run } = require('./models/database');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const hrRoutes = require('./routes/hr');
const { router: adminRoutes } = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 生产环境：serve 前端静态文件
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA 回退：所有非 /api 路由返回 index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('📦 已启用前端静态文件服务');
}

// 初始化数据库（异步）
async function start() {
  try {
    await initDb();
    
    // 初始化种子数据
    const count = get('SELECT COUNT(*) as c FROM jobs').c;
    if (count === 0) {
      console.log('初始化种子数据...');
      seedData();
    }

    // 保存数据库
    saveDb();

    const server = app.listen(PORT, () => {
      console.log(`🚀 后端服务已启动: http://localhost:${PORT}`);
      console.log(`📊 API健康检查: http://localhost:${PORT}/api/health`);
    });
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`端口 ${PORT} 被占用，尝试 ${PORT + 1}`);
        app.listen(PORT + 1, () => {
          console.log(`🚀 后端服务已启动: http://localhost:${PORT + 1}`);
        });
      }
    });
  } catch (e) {
    console.error('启动失败:', e);
    process.exit(1);
  }
}

function seedData() {
  const { v4: uuidv4 } = require('uuid');
  
  const jobs = [
    // 微信事业群 (WXG)
    { title: '前端开发工程师', department: '微信事业群', city: '深圳/广州', education_req: '本科', major_req: '计算机科学,软件工程,电子信息', skills_req: 'React,Vue,TypeScript,JavaScript,CSS,HTML', responsibilities: '负责微信生态前端开发；参与前端架构设计与性能优化；与产品、设计紧密协作', apply_url: 'https://join.qq.com/detail?id=fe_001', salary_range: '30K-50K' },
    { title: '微信搜索-算法工程师', department: '微信事业群', city: '北京/深圳', education_req: '硕士', major_req: '计算机科学,人工智能,数学', skills_req: 'Python,搜索算法,NLP,深度学习,信息检索', responsibilities: '参与微信搜索引擎算法研发；优化搜索排序与相关性；推动LLM在搜索场景的应用', apply_url: 'https://join.qq.com/detail?id=wxg_search_001', salary_range: '40K-60K' },
    { title: '微信支付-后台开发工程师', department: '微信事业群', city: '深圳/广州', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'C++,Java,分布式系统,数据库,高并发', responsibilities: '参与微信支付后台系统开发；保障支付系统高可用与稳定性；优化交易链路性能', apply_url: 'https://join.qq.com/detail?id=wxg_pay_001', salary_range: '35K-55K' },
    // AI Lab
    { title: 'AI算法工程师', department: 'AI Lab', city: '深圳/北京', education_req: '硕士', major_req: '计算机科学,人工智能,数学,统计学', skills_req: 'Python,机器学习,深度学习,TensorFlow,PyTorch,NLP,CV', responsibilities: '参与NLP和CV算法研发；负责大模型训练与优化；推动AI技术落地', apply_url: 'https://join.qq.com/detail?id=ai_001', salary_range: '40K-65K' },
    { title: '多模态大模型算法工程师', department: 'AI Lab', city: '深圳/北京', education_req: '硕士', major_req: '计算机科学,人工智能,数学', skills_req: 'Python,多模态,深度学习,PyTorch,扩散模型,Transformer', responsibilities: '参与多模态大模型研发；推动视觉生成与理解技术突破；探索AI在视频、图像领域的创新应用', apply_url: 'https://join.qq.com/detail?id=ai_mm_001', salary_range: '45K-70K' },
    // 技术工程事业群 (TEG)
    { title: '后端开发工程师', department: '技术工程事业群', city: '深圳', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'Java,Go,C++,分布式系统,微服务', responsibilities: '负责腾讯云核心服务后端开发；设计高可用分布式系统', apply_url: 'https://join.qq.com/detail?id=be_001', salary_range: '35K-55K' },
    { title: '混元大模型推理研发工程师', department: '技术工程事业群', city: '深圳/北京/上海', education_req: '硕士', major_req: '计算机科学,人工智能,电子工程', skills_req: 'C++,CUDA,GPU优化,深度学习推理,模型压缩', responsibilities: '参与混元大模型推理引擎开发；优化GPU推理性能；推动模型部署与 Serving 能力建设', apply_url: 'https://join.qq.com/detail?id=teg_llm_001', salary_range: '45K-70K' },
    // PCG
    { title: '产品经理', department: 'PCG', city: '北京/深圳', education_req: '本科', major_req: '不限', skills_req: '产品设计,用户研究,数据分析,项目管理,沟通', responsibilities: '负责信息流产品功能规划；分析用户需求与市场趋势；协调研发团队推动产品迭代上线', apply_url: 'https://join.qq.com/detail?id=pm_001', salary_range: '25K-40K' },
    { title: 'QQ-多模态算法工程师', department: 'PCG', city: '深圳/北京', education_req: '硕士', major_req: '计算机科学,人工智能,信号处理', skills_req: 'Python,多模态,深度学习,PyTorch,CV,NLP', responsibilities: '参与QQ多模态大模型算法研发；推动AI技术在QQ产品场景落地；探索多模态交互创新', apply_url: 'https://join.qq.com/detail?id=pcg_ai_001', salary_range: '40K-60K' },
    // CSIG
    { title: '数据分析工程师', department: 'CSIG', city: '深圳/上海', education_req: '本科', major_req: '统计学,数学,计算机科学,经济学', skills_req: 'Python,SQL,数据分析,数据可视化,机器学习', responsibilities: '负责业务数据建模与分析；构建数据指标体系与监控看板；为产品决策提供数据支持', apply_url: 'https://join.qq.com/detail?id=da_001', salary_range: '28K-45K' },
    { title: '云计算架构师', department: 'CSIG', city: '深圳/北京', education_req: '硕士', major_req: '计算机科学,分布式系统,软件工程', skills_req: '云计算,Kubernetes,Docker,微服务架构', responsibilities: '设计腾讯云核心架构方案；推动云原生技术落地；负责大规模集群的稳定性与性能优化', apply_url: 'https://join.qq.com/detail?id=cloud_001', salary_range: '45K-70K' },
    { title: '元宝-Android开发工程师', department: 'CSIG', city: '深圳', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'Android,Java,Kotlin,UI开发,移动端架构', responsibilities: '参与腾讯元宝App Android端开发；优化客户端性能与用户体验；探索AI助手移动端交互创新', apply_url: 'https://join.qq.com/detail?id=csig_android_001', salary_range: '30K-50K' },
    { title: '云原生开发工程师', department: 'CSIG', city: '深圳/北京', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'Kubernetes,Docker,Go,微服务,DevOps', responsibilities: '参与腾讯云原生平台开发；构建云原生基础设施与工具链；推动容器化与Serverless技术落地', apply_url: 'https://join.qq.com/detail?id=csig_cloudnative_001', salary_range: '30K-50K' },
    // IEG
    { title: '游戏客户端开发工程师', department: 'IEG', city: '深圳/上海/成都', education_req: '本科', major_req: '计算机科学,软件工程,数字媒体', skills_req: 'C++,Unreal,Unity,图形学,游戏引擎', responsibilities: '参与游戏客户端核心功能开发；优化游戏渲染性能与内存管理；协助解决技术难题', apply_url: 'https://join.qq.com/detail?id=game_001', salary_range: '35K-55K' },
    { title: '游戏AI算法工程师', department: 'IEG', city: '深圳/上海', education_req: '硕士', major_req: '计算机科学,人工智能,游戏设计', skills_req: 'Python,强化学习,深度学习,游戏AI,PyTorch', responsibilities: '参与游戏AI算法研发；强化学习在游戏场景的应用；推动AI NPC与智能决策技术落地', apply_url: 'https://join.qq.com/detail?id=ieg_ai_001', salary_range: '40K-65K' },
    { title: '游戏服务端开发工程师', department: 'IEG', city: '深圳/成都', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'C++,Go,分布式系统,网络编程,数据库', responsibilities: '参与游戏服务端核心功能开发；设计高并发游戏服务器架构；保障服务端性能与稳定性', apply_url: 'https://join.qq.com/detail?id=ieg_server_001', salary_range: '35K-55K' },
    // 安全平台部
    { title: '安全工程师', department: '安全平台部', city: '深圳', education_req: '本科', major_req: '信息安全,计算机科学,网络工程', skills_req: '网络安全,渗透测试,安全审计,漏洞挖掘', responsibilities: '负责腾讯产品安全评估与渗透测试；建设安全防护体系；跟踪最新安全威胁与攻防技术', apply_url: 'https://join.qq.com/detail?id=sec_001', salary_range: '30K-50K' },
    // ISUX
    { title: '交互设计师', department: 'ISUX', city: '深圳', education_req: '本科', major_req: '设计学,人机交互,心理学', skills_req: 'UI设计,UX设计,Figma,设计系统,用户研究', responsibilities: '负责核心产品交互设计；建立和维护设计规范与组件库；推动设计驱动的产品创新', apply_url: 'https://join.qq.com/detail?id=ux_001', salary_range: '25K-40K' },
    // CDG
    { title: '金融科技-大模型算法工程师', department: 'CDG', city: '深圳', education_req: '硕士', major_req: '计算机科学,人工智能,金融工程', skills_req: 'Python,NLP,大模型,深度学习,风控', responsibilities: '参与金融科技领域大模型算法研发；推动AI在金融风控与智能客服场景落地；构建智能化金融服务平台', apply_url: 'https://join.qq.com/detail?id=cdg_fintech_001', salary_range: '40K-60K' },
    // OMG
    { title: '运营开发工程师', department: 'OMG', city: '北京', education_req: '本科', major_req: '计算机科学,软件工程', skills_req: 'Python,Go,数据分析,运营系统开发', responsibilities: '负责广告运营平台开发与维护；构建数据驱动的运营工具体系；优化运营效率与决策支持', apply_url: 'https://join.qq.com/detail?id=op_001', salary_range: '28K-45K' },
  ];

  for (const job of jobs) {
    const id = uuidv4();
    run(`INSERT INTO jobs (id, title, department, city, education_req, major_req, skills_req, responsibilities, apply_url, salary_range)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, ...Object.values(job)]);
  }

  // 用户
  const users = [
    { name: '张明远', phone: '13800001001', education: '硕士', major: '计算机科学与技术', skills: 'Python, 机器学习, 深度学习, TensorFlow, 数据分析, React', experience: '字节跳动AI算法实习生；腾讯微信支付数据分析实习生', projects: '基于Transformer的文本分类系统；电商用户画像平台' },
    { name: '李思琪', phone: '13800001002', education: '本科', major: '软件工程', skills: 'React, Vue, TypeScript, JavaScript, Node.js', experience: '美团前端开发实习生 - 负责商家端管理页面开发', projects: '开源UI组件库；校园社交小程序' },
    { name: '王浩然', phone: '13800001003', education: '硕士', major: '人工智能', skills: 'Python, PyTorch, NLP, CV, 深度学习, 大模型', experience: '微软亚洲研究院研究实习生 - 参与大语言模型训练', projects: '多模态对话系统；知识图谱问答系统' },
    { name: '陈雨萱', phone: '13800001004', education: '本科', major: '统计学', skills: 'Python, SQL, 数据分析, 数据可视化, 机器学习', experience: '京东数据分析实习生 - 负责用户行为分析', projects: '零售销售预测模型；数据可视化大屏' },
    { name: '刘子轩', phone: '13800001005', education: '硕士', major: '计算机科学', skills: 'Java, Go, 分布式系统, 微服务, Kubernetes', experience: '阿里云后端开发实习生 - 参与云服务架构开发', projects: '分布式任务调度系统；微服务网关' },
  ];

  for (const u of users) {
    const id = uuidv4();
    const parsed = JSON.stringify({ education: u.education, major: u.major, skills: u.skills, experience: u.experience, projects: u.projects });
    run('INSERT INTO users (id, name, phone, education, major, skills, experience, projects, resume_parsed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, u.name, u.phone, u.education, u.major, u.skills, u.experience, u.projects, parsed]);
  }

  // 每个部门一个HR
  const hrs = [
    { name: '陈HR', email: 'chen.hr@tencent.com', department: '微信事业群' },
    { name: '王HR', email: 'wang.hr@tencent.com', department: 'AI Lab' },
    { name: '李HR', email: 'li.hr@tencent.com', department: '技术工程事业群' },
    { name: '赵HR', email: 'zhao.hr@tencent.com', department: 'PCG' },
    { name: '孙HR', email: 'sun.hr@tencent.com', department: 'CSIG' },
    { name: '周HR', email: 'zhou.hr@tencent.com', department: 'IEG' },
    { name: '吴HR', email: 'wu.hr@tencent.com', department: '安全平台部' },
    { name: '郑HR', email: 'zheng.hr@tencent.com', department: 'ISUX' },
    { name: '冯HR', email: 'feng.hr@tencent.com', department: 'CDG' },
    { name: '钱HR', email: 'qian.hr@tencent.com', department: 'OMG' },
  ];
  for (const h of hrs) {
    run('INSERT INTO hr_users (id, name, email, department) VALUES (?, ?, ?, ?)', [uuidv4(), h.name, h.email, h.department]);
  }

  // 投递记录 - 为每个用户创建投递到不同部门的记录
  const allJobs = all('SELECT id, department FROM jobs');
  const allUsers = all('SELECT id FROM users');
  const allHrs = all('SELECT id, department FROM hr_users');
  
  if (allUsers.length > 0 && allJobs.length > 0 && allHrs.length > 0) {
    // 辅助函数：根据部门找HR
    const findHr = (dept) => allHrs.find(h => h.department === dept) || allHrs[0];
    
    // 用户1: 张明远 - 多方向投递
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[0].id, allJobs[0].id, 92, 'S', '{}', 'applied', findHr('微信事业群').id]);
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id, interview_time, interview_location, interview_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[0].id, allJobs[3].id, 95, 'S', '{}', 'invited', findHr('AI Lab').id, '2026-05-28 14:00', '深圳腾讯滨海大厦A座', '现场']);
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id, reject_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[0].id, allJobs[10].id, 68, 'C', '{}', 'rejected', findHr('CSIG').id, '技能匹配度不足']);
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[0].id, allJobs[5].id, 85, 'A', '{}', 'applied', findHr('技术工程事业群').id]);

    // 用户2: 李思琪 - 前端方向
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[1].id, allJobs[0].id, 88, 'A', '{}', 'applied', findHr('微信事业群').id]);

    // 用户3: 王浩然 - AI方向
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[2].id, allJobs[3].id, 90, 'S', '{}', 'applied', findHr('AI Lab').id]);
    run(`INSERT INTO applications (id, user_id, job_id, match_score, match_level, match_details, status, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[2].id, allJobs[15].id, 82, 'A', '{}', 'applied', findHr('IEG').id]);

    // 拒绝候选人池
    run(`INSERT INTO rejections (id, user_id, original_job_id, original_match_score, original_match_level, reject_reason, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[0].id, allJobs[10].id, 68, 'C', '专业技能匹配度不足', findHr('CSIG').id]);
    run(`INSERT INTO rejections (id, user_id, original_job_id, original_match_score, original_match_level, reject_reason, hr_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), allUsers[2].id, allJobs[7].id, 65, 'C', '项目经验不足', findHr('PCG').id]);
  }

  saveDb();
  console.log(`✅ 种子数据初始化完成: ${jobs.length}个岗位, ${users.length}个用户, ${hrs.length}个HR`);
}

start();
