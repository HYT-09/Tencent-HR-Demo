/**
 * 文件文本提取工具
 * 支持 PDF、DOCX、TXT 格式
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * 根据文件扩展名提取文本内容
 * @param {Buffer} buffer - 文件 Buffer
 * @param {string} filename - 原始文件名（用于判断格式）
 * @returns {Promise<string>} 提取的文本内容
 */
async function extractTextFromFile(buffer, filename) {
  const ext = (filename || '').toLowerCase();

  if (ext.endsWith('.pdf')) {
    return extractFromPDF(buffer);
  } else if (ext.endsWith('.docx') || ext.endsWith('.doc')) {
    return extractFromDOCX(buffer);
  } else if (ext.endsWith('.txt')) {
    return buffer.toString('utf-8');
  } else {
    // 未知格式，尝试当文本读取
    try {
      return buffer.toString('utf-8');
    } catch {
      throw new Error('不支持的文件格式，请上传 PDF、DOCX 或 TXT 文件');
    }
  }
}

async function extractFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (err) {
    console.error('PDF 解析失败:', err.message);
    throw new Error('PDF 文件解析失败，请尝试粘贴文本方式上传');
  }
}

async function extractFromDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (err) {
    console.error('DOCX 解析失败:', err.message);
    throw new Error('Word 文件解析失败，请尝试粘贴文本方式上传');
  }
}

module.exports = { extractTextFromFile };
