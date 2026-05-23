/**
 * 腾讯混元大模型 AI 工具
 * 使用 OpenAI 兼容接口调用
 */

const API_KEY = process.env.HUNYUAN_API_KEY;
const BASE_URL = process.env.HUNYUAN_BASE_URL || 'https://api.hunyuan.cloud.tencent.com/v1';
const MODEL = process.env.HUNYUAN_MODEL || 'hunyuan-turbos-latest';

// 判断是否已配置 AI
function isAIConfigured() {
  return !!API_KEY;
}

/**
 * 调用混元大模型 ChatCompletions
 */
async function chat(messages, options = {}) {
  if (!API_KEY) {
    throw new Error('未配置 HUNYUAN_API_KEY');
  }

  const body = {
    model: options.model || MODEL,
    messages,
    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens || 1024,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`混元 API 错误 ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI 返回内容为空');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * 从 JSON 字符串中提取有效 JSON（兼容 markdown 代码块包裹）
 */
function extractJSON(text) {
  // 尝试提取 ```json ... ``` 包裹的内容
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try { return JSON.parse(codeBlockMatch[1].trim()); } catch {}
  }

  // 尝试提取 { ... } 范围
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try { return JSON.parse(braceMatch[0]); } catch {}
  }

  // 直接解析
  try { return JSON.parse(text); } catch {}

  return null;
}

/**
 * 简历解析：从文本中提取结构化信息
 * @param {string} resumeText - 简历纯文本
 * @returns {Promise<Object>} 解析结果
 */
async function parseResumeByText(resumeText) {
  if (!resumeText || resumeText.trim().length < 10) {
    throw new Error('简历文本内容过短，无法解析');
  }

  const prompt = `请从以下简历文本中提取结构化信息，严格按 JSON 格式返回，不要添加任何其他文字：

{
  "education": "学历（大专/本科/硕士/博士）",
  "major": "专业全称（标准化为中国教育部专业目录名称）",
  "major_category": "专业大类（如：计算机类、电子信息类、数学类、统计学类、管理科学与工程类等）",
  "skills": "核心技能（逗号分隔，如：Python,机器学习,数据分析）",
  "experience": "实习/工作经历概要（50字内）",
  "projects": "项目经历概要（50字内）",
  "university": "毕业院校",
  "gpa": "GPA（如有，没有则填空字符串）"
}

简历文本：
${resumeText.slice(0, 4000)}`;

  const content = await chat([
    { role: 'system', content: '你是一个专业的简历信息提取助手，擅长从中文简历中提取结构化数据。请始终返回纯 JSON，不要添加任何解释文字。' },
    { role: 'user', content: prompt },
  ]);

  const result = extractJSON(content);
  if (!result) {
    throw new Error('AI 返回格式无法解析');
  }

  // 确保必要字段存在
  return {
    education: result.education || '',
    major: result.major || '',
    major_category: result.major_category || '',
    skills: result.skills || '',
    experience: result.experience || '',
    projects: result.projects || '',
    university: result.university || '',
    gpa: result.gpa || '',
  };
}

/**
 * 专业匹配：用 AI 判断用户专业与岗位要求专业的匹配度
 * @param {string} userMajor - 用户专业
 * @param {string} majorCategory - 专业大类
 * @param {string} reqMajor - 岗位要求专业（逗号分隔）
 * @returns {Promise<{score: number, reason: string}>}
 */
async function matchMajorScore(userMajor, majorCategory, reqMajor) {
  if (!reqMajor || reqMajor === '不限') return { score: 1, reason: '岗位不限专业' };
  if (!userMajor) return { score: 0, reason: '用户未填写专业' };

  const prompt = `判断用户专业与岗位要求专业的匹配度。

用户专业：${userMajor}${majorCategory ? `（属于${majorCategory}）` : ''}
岗位要求专业：${reqMajor}

请返回 JSON 格式（不要添加其他文字）：
{
  "score": 0到1之间的数值（0=完全不匹配，0.5=部分匹配，1=完全匹配。相关专业如同属一个大类应给予0.6-0.8，相同专业1.0），
  "reason": "匹配原因简述（20字内）"
}`;

  const content = await chat([
    { role: 'system', content: '你是一个专业匹配评估助手，精通中国高等教育专业分类体系。请始终返回纯 JSON。' },
    { role: 'user', content: prompt },
  ], { maxTokens: 256 });

  const result = extractJSON(content);
  if (!result || typeof result.score !== 'number') {
    throw new Error('AI 返回格式无法解析');
  }

  return {
    score: Math.max(0, Math.min(1, result.score)),
    reason: result.reason || '',
  };
}

module.exports = {
  isAIConfigured,
  parseResumeByText,
  matchMajorScore,
  chat,
};
