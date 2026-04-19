import { getDemoProducts, normalizeProduct } from '@/lib/catalog';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatMonthKey(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
}

function formatDayKey(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function createRecentMonths(count) {
    return Array.from({ length: count }, (_, index) => {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - (count - index - 1));
        return {
            key: formatMonthKey(date),
            label: date.toLocaleString('default', { month: 'short' }),
            date,
        };
    });
}

function createRecentDays(count) {
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(Date.now() - (count - index - 1) * DAY_MS);
        return {
            key: formatDayKey(date),
            label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            date,
        };
    });
}

function getBucketConfig(period) {
    if (period === '7days') {
        return { type: 'day', buckets: createRecentDays(7) };
    }

    if (period === '30days') {
        return { type: 'day', buckets: createRecentDays(30) };
    }

    if (period === '1year') {
        return { type: 'month', buckets: createRecentMonths(12) };
    }

    return { type: 'month', buckets: createRecentMonths(9) };
}

function getOrderBucketKey(date, bucketType) {
    const orderDate = new Date(date);
    return bucketType === 'day' ? formatDayKey(orderDate) : formatMonthKey(orderDate);
}

function getProductCategoryName(product) {
    return product?.category?.name || product?.categoryName || product?.category || 'Unknown';
}

function getProductCategorySlug(product) {
    return product?.category?.slug || product?.categorySlug || product?.category || 'unknown';
}

function buildCategoryCount(products) {
    const counts = new Map();

    for (const product of products) {
        const slug = getProductCategorySlug(product);
        counts.set(slug, (counts.get(slug) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([slug, count]) => ({
        _id: slug,
        count,
    }));
}

export function buildDemoDashboardStats() {
    const demoProducts = getDemoProducts();
    const monthlySales = createRecentMonths(9).map((bucket, index) => ({
        _id: bucket.key,
        revenue: 120000 + index * 18000,
        orders: 8 + index * 2,
    }));

    return {
        totalRevenue: monthlySales.reduce((sum, month) => sum + month.revenue, 0),
        totalOrders: monthlySales.reduce((sum, month) => sum + month.orders, 0),
        totalProducts: demoProducts.length,
        totalCustomers: 24,
        lowStockProducts: demoProducts
            .filter((product) => product.stock <= 10)
            .slice(0, 5)
            .map(normalizeProduct),
        recentOrders: [],
        monthlySales,
        categoryStats: buildCategoryCount(demoProducts),
    };
}

export function buildDemoAnalytics(period) {
    const { buckets } = getBucketConfig(period);
    const demoProducts = getDemoProducts();

    const revenueTrend = buckets.map((bucket, index) => ({
        _id: bucket.label,
        revenue: period === '7days' || period === '30days'
            ? 8000 + index * 1200
            : 120000 + index * 15000,
        orders: period === '7days' || period === '30days'
            ? 2 + (index % 4)
            : 8 + index,
    }));

    const customerGrowth = buckets.map((bucket, index) => ({
        _id: bucket.label,
        newCustomers: period === '7days' || period === '30days' ? 1 + (index % 3) : 4 + index,
    }));

    const categoryRevenueMap = new Map();
    for (const product of demoProducts) {
        const category = getProductCategorySlug(product);
        categoryRevenueMap.set(category, (categoryRevenueMap.get(category) || 0) + product.price * 2);
    }

    return {
        revenueTrend,
        customerGrowth,
        bestSellers: demoProducts
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, 5)
            .map(normalizeProduct),
        categoryRevenue: Array.from(categoryRevenueMap.entries()).map(([category, revenue]) => ({
            _id: category,
            revenue,
        })),
        avgOrderValue: Math.round(
            revenueTrend.reduce((sum, bucket) => sum + bucket.revenue, 0) /
            Math.max(1, revenueTrend.reduce((sum, bucket) => sum + bucket.orders, 0))
        ),
    };
}

export function buildDashboardStats({ orders = [], products = [], users = [] }) {
    const normalizedProducts = products.map(normalizeProduct);
    const monthlyBuckets = createRecentMonths(9);
    const monthlyMap = new Map(monthlyBuckets.map((bucket) => [bucket.key, { _id: bucket.key, revenue: 0, orders: 0 }]));

    for (const order of orders) {
        const key = getOrderBucketKey(order.createdAt, 'month');
        const bucket = monthlyMap.get(key);
        if (!bucket) {
            continue;
        }

        bucket.revenue += order.totalAmount || 0;
        bucket.orders += 1;
    }

    const recentOrders = orders
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    return {
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalOrders: orders.length,
        totalProducts: normalizedProducts.length,
        totalCustomers: users.length,
        lowStockProducts: normalizedProducts
            .filter((product) => Number(product.stock || 0) <= 10)
            .sort((a, b) => (a.stock || 0) - (b.stock || 0))
            .slice(0, 5),
        recentOrders,
        monthlySales: monthlyBuckets.map((bucket) => monthlyMap.get(bucket.key)),
        categoryStats: buildCategoryCount(normalizedProducts),
    };
}

export function buildAnalytics({ period, orders = [], products = [], users = [] }) {
    const normalizedProducts = products.map(normalizeProduct);
    const productMap = new Map(normalizedProducts.map((product) => [String(product._id), product]));
    const { type, buckets } = getBucketConfig(period);
    const revenueMap = new Map(buckets.map((bucket) => [bucket.key, { _id: bucket.label, revenue: 0, orders: 0 }]));
    const customerMap = new Map(buckets.map((bucket) => [bucket.key, { _id: bucket.label, newCustomers: 0 }]));
    const categoryRevenueMap = new Map();

    for (const order of orders) {
        const key = getOrderBucketKey(order.createdAt, type);
        const bucket = revenueMap.get(key);
        if (bucket) {
            bucket.revenue += order.totalAmount || 0;
            bucket.orders += 1;
        }

        for (const item of order.items || []) {
            const product = productMap.get(String(item.product)) || productMap.get(String(item.product?._id));
            const category = getProductCategorySlug(product);
            categoryRevenueMap.set(
                category,
                (categoryRevenueMap.get(category) || 0) + ((item.price || 0) * (item.quantity || 0))
            );
        }
    }

    for (const user of users) {
        const key = getOrderBucketKey(user.createdAt, type);
        const bucket = customerMap.get(key);
        if (bucket) {
            bucket.newCustomers += 1;
        }
    }

    return {
        revenueTrend: buckets.map((bucket) => revenueMap.get(bucket.key)),
        customerGrowth: buckets.map((bucket) => customerMap.get(bucket.key)),
        bestSellers: normalizedProducts
            .sort((a, b) => (b.sold || 0) - (a.sold || 0))
            .slice(0, 5),
        categoryRevenue: Array.from(categoryRevenueMap.entries()).map(([category, revenue]) => ({
            _id: category,
            revenue,
        })),
        avgOrderValue: orders.length
            ? Math.round(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length)
            : 0,
    };
}
