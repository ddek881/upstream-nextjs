#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const API_BASE = 'http://localhost:3001'

async function approvePayment(streamId = '2', userId = 'demo-user') {
  try {
    console.log('🔐 Payment Approval Tool')
    console.log('========================\n')
    
    console.log(`📺 Stream ID: ${streamId}`)
    console.log(`👤 User ID: ${userId}`)
    
    // Step 1: Force approve payment
    console.log('\n🔄 Approving payment...')
    const response = await fetch(`${API_BASE}/api/force-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId, userId })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Payment approved successfully!')
      console.log(`💳 Transaction ID: ${data.data.trxId}`)
      console.log(`💰 Amount: Rp ${data.data.amount.toLocaleString()}`)
      console.log(`⏰ Expires: ${new Date(data.data.expiresAt).toLocaleString('id-ID')}`)
      
      // Step 2: Verify access
      console.log('\n🔍 Verifying access...')
      const accessResponse = await fetch(`${API_BASE}/api/check-access?userId=${userId}&streamId=${streamId}`)
      const accessData = await accessResponse.json()
      
      if (accessData.success && accessData.data.hasAccess) {
        console.log('✅ Access verified successfully!')
        
        console.log('\n📝 Browser setup commands:')
        console.log('==========================')
        console.log('')
        console.log('// Copy and paste these commands in your browser console (F12):')
        console.log('')
        console.log('// Set user ID')
        console.log(`localStorage.setItem('currentUserId', '${userId}')`)
        console.log('')
        console.log('// Verify user ID')
        console.log("console.log('User ID:', localStorage.getItem('currentUserId'))")
        console.log('')
        console.log('// Refresh the page')
        console.log('window.location.reload()')
        console.log('')
        console.log('✅ Ready! Now refresh the stream page or visit:')
        console.log(`🔗 http://localhost:3001/stream?id=${streamId}`)
        
      } else {
        console.log('❌ Access verification failed')
        console.log('📋 Response:', accessData)
      }
      
    } else {
      console.log('❌ Failed to approve payment:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Get stream ID from command line argument
const streamId = process.argv[2] || '2'

if (require.main === module) {
  approvePayment(streamId).catch(console.error)
}

module.exports = { approvePayment }

