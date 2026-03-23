// Tính cosine similarity giữa 2 vector
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function rankBySimilarity<T extends { embedding: number[] }>(
  targetEmbedding: number[], 
  items: T[]
): (T & { matchScore: number })[] {
  if (!targetEmbedding || targetEmbedding.length === 0) {
    // Không có embedding, trả về random hoặc giữ nguyên kèm score = 0
    return items.map(item => ({ ...item, matchScore: 0 }));
  }

  const scored = items.map(item => ({
    ...item,
    matchScore: Math.round(cosineSimilarity(targetEmbedding, item.embedding) * 100)
  }));

  // Sắp xếp giảm dần theo matchScore
  return scored.sort((a, b) => b.matchScore - a.matchScore);
}