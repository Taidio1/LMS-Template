const db = require('../config/database');

/**
 * GET /api/categories
 * Get all categories ordered by index
 */
const getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM course_categories ORDER BY order_index ASC');
        res.json(rows);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

/**
 * POST /api/categories
 * Create a new category
 */
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        // Get max order index
        const [max] = await db.execute('SELECT MAX(order_index) as maxIndex FROM course_categories');
        const nextIndex = (max[0].maxIndex || 0) + 1;

        const [result] = await db.execute(
            'INSERT INTO course_categories (name, order_index) VALUES (?, ?)',
            [name.trim(), nextIndex]
        );

        res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            order_index: nextIndex
        });
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Category already exists' });
        }
        res.status(500).json({ error: 'Failed to create category' });
    }
};

/**
 * PUT /api/categories/:id
 * Update category name
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        await db.execute('UPDATE course_categories SET name = ? WHERE id = ?', [name.trim(), id]);

        // Sync legacy category column in courses
        await db.execute('UPDATE courses SET category = ? WHERE category_id = ?', [name.trim(), id]);

        res.json({ id: parseInt(id), name: name.trim() });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

/**
 * DELETE /api/categories/:id
 * Delete category (set courses category_id to NULL)
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // Foreign key is ON DELETE SET NULL, so we can just delete
        await db.execute('DELETE FROM course_categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

/**
 * PUT /api/categories/reorder
 * Reorder categories
 */
const reorderCategories = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { categoryIds } = req.body; // Array of IDs in new order

        if (!Array.isArray(categoryIds)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        for (let i = 0; i < categoryIds.length; i++) {
            await connection.execute(
                'UPDATE course_categories SET order_index = ? WHERE id = ?',
                [i, categoryIds[i]]
            );
        }

        await connection.commit();
        res.json({ message: 'Categories reordered successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Reorder categories error:', error);
        res.status(500).json({ error: 'Failed to reorder categories' });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
};
