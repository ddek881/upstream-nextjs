#!/bin/bash

# Script untuk test flow pembayaran QRIS
# Usage: ./test-payment-flow.sh

echo "🧪 Test Payment Flow - Free Trial & QRIS"
echo "========================================"

# Test 1: Check stream premium
echo ""
echo "1. Checking premium streams..."
curl -s "http://localhost:3000/api/streams" | jq '.[] | select(.is_paid == true) | {title, price, id}' | head -10

# Test 2: Generate QRIS
echo ""
echo "2. Testing QRIS generation..."
STREAM_ID=$(curl -s "http://localhost:3000/api/streams" | jq -r '.[] | select(.is_paid == true) | .id' | head -1)

if [ -n "$STREAM_ID" ] && [ "$STREAM_ID" != "null" ]; then
    echo "Using stream ID: $STREAM_ID"
    
    QRIS_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/generate-qris" \
        -H "Content-Type: application/json" \
        -d "{\"streamId\":\"$STREAM_ID\",\"amount\":1000}")
    
    echo "QRIS Response: $QRIS_RESPONSE"
    
    # Extract trxId if successful
    TRX_ID=$(echo $QRIS_RESPONSE | jq -r '.data.trxId // empty')
    
    if [ -n "$TRX_ID" ] && [ "$TRX_ID" != "null" ]; then
        echo "Transaction ID: $TRX_ID"
        
        # Test 3: Check payment status
        echo ""
        echo "3. Testing payment status check..."
        sleep 2
        
        STATUS_RESPONSE=$(curl -s "http://localhost:3000/api/payment-callback?trxId=$TRX_ID")
        echo "Status Response: $STATUS_RESPONSE"
        
    else
        echo "❌ Failed to generate QRIS"
    fi
else
    echo "❌ No premium streams found"
fi

# Test 4: Check database
echo ""
echo "4. Checking payment records in database..."
source .env.local
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

psql "postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" << EOF
SELECT 
    trx_id,
    amount,
    status,
    created_at,
    expired_at
FROM payments 
ORDER BY created_at DESC 
LIMIT 5;
EOF

echo ""
echo "✅ Payment flow test completed!"
echo ""
echo "📱 To test the full flow:"
echo "1. Open http://localhost:3000"
echo "2. Click 'Free Trial 7s' on any premium stream"
echo "3. Wait 7 seconds for auto-redirect"
echo "4. Test QRIS payment page"
