// KPAY Payment Gateway Service
// Supports MTN Momo and Airtel Mobile Money

const KPAY_API_BASE_URL = 'https://api.kpay.co.zm';
const KPAY_MERCHANT_KEY = process.env.REACT_APP_KPAY_MERCHANT_KEY || 'your_merchant_key_here';
const KPAY_API_KEY = process.env.REACT_APP_KPAY_API_KEY || 'your_api_key_here';

export enum PaymentProvider {
  MTN_MOMO = 'mtn',
  AIRTEL_MONEY = 'airtel',
}

export interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  provider: PaymentProvider;
  orderRef: string;
  customerName: string;
  customerEmail?: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status?: string;
  message: string;
  data?: any;
}

// Initialize payment
export const initiatePayment = async (
  request: PaymentRequest
): Promise<PaymentResponse> => {
  try {
    const payload = {
      merchant_key: KPAY_MERCHANT_KEY,
      api_key: KPAY_API_KEY,
      amount: request.amount,
      phone_number: request.phoneNumber,
      provider: request.provider === PaymentProvider.MTN_MOMO ? 'mtn' : 'airtel',
      transaction_ref: request.orderRef,
      customer_name: request.customerName,
      customer_email: request.customerEmail || '',
      description: request.description,
      callback_url: 'https://your-app-backend.com/payment-callback',
    };

    const response = await fetch(`${KPAY_API_BASE_URL}/v1/payments/mobile-money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        transactionId: data.transaction_id,
        status: data.status,
        message: 'Payment initiated successfully',
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Payment initiation failed',
        data: data,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Payment error: ${error.message}`,
    };
  }
};

// Check payment status
export const checkPaymentStatus = async (
  transactionId: string
): Promise<PaymentResponse> => {
  try {
    const response = await fetch(
      `${KPAY_API_BASE_URL}/v1/payments/${transactionId}/status`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${KPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        status: data.status,
        message: 'Status retrieved successfully',
        data: data,
      };
    } else {
      return {
        success: false,
        message: data.message || 'Unable to retrieve status',
        data: data,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: `Error checking payment status: ${error.message}`,
    };
  }
};

// Format phone number to international format if needed
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');

  // If it starts with 0 (Zambia), replace with 260
  if (cleaned.startsWith('0')) {
    cleaned = '260' + cleaned.substring(1);
  }

  // If it doesn't start with 260 (Zambia code), add it
  if (!cleaned.startsWith('260')) {
    cleaned = '260' + cleaned;
  }

  return cleaned;
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const formatted = formatPhoneNumber(phoneNumber);

  // Should be valid Zambia phone number (260XXXXXXXXX format)
  return formatted.length === 12 && formatted.startsWith('260');
};

// Generate unique order reference
export const generateOrderRef = (): string => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
