# KPAY Payment Integration Guide

This guide explains how to set up and use the KPAY payment gateway integration in your Grocery App.

## Overview

The app now supports payment processing through KPAY payment gateway with the following mobile money providers:
- **MTN Momo** - Gold colored option
- **Airtel Money** - Red colored option

## Setup Instructions

### 1. Get KPAY Credentials

1. Visit [KPAY Developer Portal](https://kpay.co.zm/developer)
2. Create a merchant account
3. Get your:
   - **Merchant Key** (Merchant ID)
   - **API Key** (API Secret)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project (or use environment configuration):

```bash
REACT_APP_KPAY_MERCHANT_KEY=your_merchant_key_here
REACT_APP_KPAY_API_KEY=your_api_key_here
```

To use environment variables in your app, you'll need to configure them in your build process or update the `kpayService.ts` file directly.

### 3. Update Backend Callback URL

In `src/services/kpayService.ts`, update the callback URL:

```typescript
callback_url: 'https://your-app-backend.com/payment-callback',
```

This is where KPAY will send payment confirmation webhooks.

## How to Use

### Customer Payment Flow

1. **Add Items to Cart** - Customer adds products to their shopping cart
2. **Press Checkout** - Opens the payment method selection modal
3. **Enter Details** - Customer enters:
   - Full Name
   - Phone Number (in Zambian format: +260XXXXXXXXX or 0XXXXXXXXX)
4. **Select Payment Method** - Choose MTN Momo or Airtel Money
5. **Confirm Payment** - Press "Pay Now"
6. **Mobile Money Prompt** - Customer receives a prompt on their phone to confirm payment
7. **Order Confirmation** - Upon successful payment, customer receives order reference

### Phone Number Format

The app accepts Zambian phone numbers in multiple formats:

- `+260 761 234 567` (International with spaces)
- `+260761234567` (International compact)
- `0761234567` (Local format)
- `261234567` (Without country code)

All formats are automatically converted to the standard format: `260761234567`

## File Structure

```
src/
├── services/
│   └── kpayService.ts          # KPAY API integration
└── screens/
    └── CartScreen.tsx           # Updated with payment modal
```

## API Functions

### `initiatePayment(request: PaymentRequest)`

Initiates a mobile money payment request.

**Parameters:**
- `amount` (number) - Amount in USD
- `phoneNumber` (string) - Customer phone number
- `provider` (PaymentProvider) - MTN_MOMO or AIRTEL_MONEY
- `orderRef` (string) - Unique order reference
- `customerName` (string) - Customer full name
- `customerEmail` (string, optional) - Customer email
- `description` (string) - Payment description

**Returns:**
- `success` (boolean) - Payment initiation status
- `transactionId` (string) - Transaction ID if successful
- `message` (string) - Status message

### `checkPaymentStatus(transactionId: string)`

Checks the status of a payment transaction.

**Returns:**
- `success` (boolean) - Request status
- `status` (string) - Payment status (pending, completed, failed)
- `message` (string) - Status message

### `formatPhoneNumber(phoneNumber: string)`

Converts phone numbers to international format.

### `validatePhoneNumber(phoneNumber: string)`

Validates if a phone number is a valid Zambian number.

### `generateOrderRef()`

Generates a unique order reference ID.

## Payment States

The payment modal has the following states:

- **Idle** - Waiting for user input
- **Processing** - Payment request being sent to KPAY
- **Pending** - Waiting for customer to confirm on phone
- **Complete** - Order placed successfully
- **Error** - Payment failed or invalid input

## Error Handling

The app handles various error scenarios:

- **Empty Cart** - Alert user to add items
- **Invalid Phone Number** - Display phone format requirements
- **Missing Customer Info** - Require name and phone number
- **Payment Failure** - Show error message from KPAY
- **Network Error** - Handle connection issues gracefully

## Testing

### Test Phone Numbers (if provided by KPAY)

Contact KPAY support for test phone numbers and credentials for sandbox testing.

### Manual Testing

1. Use valid Zambian phone numbers
2. Verify payment prompts appear on the phone
3. Check transaction IDs in KPAY dashboard
4. Monitor callback webhooks on your backend

## Security Considerations

1. **Never hardcode credentials** - Always use environment variables
2. **Use HTTPS** - Ensure all API calls use HTTPS
3. **Validate inputs** - Phone numbers and amounts are validated before sending
4. **Secure storage** - Don't store sensitive payment data in AsyncStorage
5. **Order references** - Use unique references (timestamp + random) to prevent duplicates
6. **PCI Compliance** - Phone numbers are not stored; only order references are saved

## Backend Integration

You should implement a backend service to:

1. **Store Orders** - Save order details with payment status
2. **Handle Webhooks** - Receive and process KPAY payment confirmations
3. **Verify Payments** - Verify payment status before fulfilling orders
4. **Generate Invoices** - Create order invoices/receipts

Example webhook handler:

```typescript
// POST /payment-callback
{
  transaction_id: "kpay_xxx_xxx",
  order_ref: "ORD-1234567890-abc123def",
  status: "completed",
  amount: 50.00,
  phone_number: "260761234567",
  timestamp: "2024-01-04T10:30:00Z"
}
```

## Troubleshooting

### Payment Modal Doesn't Appear

- Check that checkout button is pressed
- Verify CartScreen component is properly imported
- Check console for errors

### Payment Always Fails

- Verify KPAY credentials in environment variables
- Check phone number format
- Ensure API endpoints are correct
- Test with KPAY sandbox first

### No Payment Prompt on Phone

- Verify phone number is correct and active
- Check that phone has data/network connection
- Confirm payment provider (MTN/Airtel) is available on phone
- Check KPAY dashboard for transaction status

## Resources

- [KPAY Developer Documentation](https://kpay.co.zm/developer)
- [KPAY API Reference](https://kpay.co.zm/api-documentation)
- [React Native Fetch API](https://reactnative.dev/docs/network)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/)

## Support

For issues with:
- **KPAY API** - Contact KPAY support
- **App Integration** - Review the code in `src/services/kpayService.ts` and `src/screens/CartScreen.tsx`
- **Testing** - Use KPAY's test environment with provided test credentials
