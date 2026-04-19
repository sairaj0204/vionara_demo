import axios from 'axios';

let shiprocketToken = null;
let tokenExpiry = null;

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/payload';

/**
 * Get or refresh Shiprocket Auth Token
 */
export async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error('Shiprocket credentials are not configured.');
    }

    // Return cached token if valid
    if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
        return shiprocketToken;
    }

    try {
        const response = await axios.post(`${SHIPROCKET_API_URL}/user/login`, {
            email,
            password
        });

        if (response.data && response.data.token) {
            shiprocketToken = response.data.token;
            
            // Shiprocket tokens usually expire in 10 days, we'll cache for 9 days
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 9);
            tokenExpiry = expiryDate;

            return shiprocketToken;
        } else {
            throw new Error('Failed to get token from Shiprocket');
        }
    } catch (error) {
        console.error("SHIPROCKET AUTH ERROR:", {
            error: error?.response?.data || error.message,
            email: email ? 'Provided' : 'Missing',
        });
        throw new Error('Could not authenticate with Shiprocket');
    }
}

/**
 * Create a Shiprocket Custom Order
 * @param {Object} order - The MongoDB order object populated with items
 */
export async function createShiprocketOrder(order) {
    try {
        const token = await getShiprocketToken();
        
        // Prepare items array
        const orderItems = order.items.map(item => ({
            name: item.name,
            sku: item.product.toString(), // usually SKU but we use object id as fallback
            units: item.quantity,
            selling_price: item.price,
            discount: 0,
            tax: 0,
            hsn: ""
        }));

        const payload = {
            order_id: order.orderNumber,
            order_date: new Date(order.createdAt).toISOString().split('T')[0],
            pickup_location: "Primary", // Requires proper setup in Shiprocket
            billing_customer_name: order.shippingAddress.fullName.split(' ')[0],
            billing_last_name: order.shippingAddress.fullName.split(' ').slice(1).join(' ') || "",
            billing_address: order.shippingAddress.addressLine1,
            billing_address_2: order.shippingAddress.addressLine2 || "",
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_email: order.user?.email || "customer@example.com",
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: true,
            order_items: orderItems,
            payment_method: order.paymentInfo?.method === 'cod' ? 'COD' : 'Prepaid',
            sub_total: order.itemsTotal,
            length: 10,  // fallback dimensions
            breadth: 10,
            height: 10,
            weight: 0.5   // fallback weight
        };

        const response = await axios.post(`${SHIPROCKET_API_URL}/custom/orders/create/return-awb`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.status_code === 1) {
            const shiprocketResponse = response.data;
            return {
                success: true,
                shiprocketOrderId: shiprocketResponse.order_id,
                shipmentId: shiprocketResponse.shipment_id,
                awbCode: shiprocketResponse.awb_code,
                courierName: shiprocketResponse.courier_name,
                trackingUrl: `https://shiprocket.co/tracking/${shiprocketResponse.awb_code}`
            };
        } else {
            console.error('Shiprocket Create Order response error:', response.data);
            return { success: false, message: 'Invalid response from Shiprocket' };
        }
    } catch (error) {
        console.error("SHIPROCKET CREATE ORDER ERROR:", {
            error: error?.response?.data || error.message,
            orderId: order?.orderNumber,
        });
        return { success: false, message: error.message };
    }
}
