/**
 * paginate.js
 * Generic Mongoose pagination utility.
 *
 * @param {import('mongoose').Model} model     — Mongoose model to query
 * @param {object}  filter                     — MongoDB filter document
 * @param {object}  sort                       — MongoDB sort document  (e.g. { rating: -1 })
 * @param {number}  page                       — 1-based page number    (default: 1)
 * @param {number}  limit                      — Documents per page     (default: 20, max: 100)
 * @returns {Promise<{ data: any[], total: number, page: number, totalPages: number }>}
 */
const paginate = async (model, filter = {}, sort = {}, page = 1, limit = 20) => {
  // Clamp & coerce
  const safePage  = Math.max(1, parseInt(page,  10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip      = (safePage - 1) * safeLimit;

  // Run count and data query in parallel for performance
  const [total, data] = await Promise.all([
    model.countDocuments(filter),
    model.find(filter).sort(sort).skip(skip).limit(safeLimit).lean(),
  ]);

  return {
    data,
    total,
    page:       safePage,
    totalPages: Math.ceil(total / safeLimit),
  };
};

export default paginate;
