#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const API_BASE = 'http://localhost:3001'

async function quickApprove(streamId = '2', userId = 'demo-user') {
  try {
    console.log('🚀 Quick Approve Payment Tool')
    console.log('==============================\n')
    
    console.log(`📺 Stream ID: ${streamId}`)
    console.log(`👤 User ID: ${userId}`)
    
    // Step 1: Force approve payment
    console.log('\n🔄 Step 1: Approving payment...')
    const approveResponse = await fetch(`${API_BASE}/api/force-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId, userId })
    })
    
    const approveData = await approveResponse.json()
    
    if (!approveData.success) {
      throw new Error(`Failed to approve payment: ${approveData.error}`)
    }
    
    const { sessionId, trxId } = approveData.data
    console.log('✅ Payment approved successfully!')
    console.log(`🆔 Session ID: ${sessionId}`)
    console.log(`💳 Transaction ID: ${trxId}`)
    
    // Step 2: Verify access
    console.log('\n🔍 Step 2: Verifying access...')
    const accessResponse = await fetch(`${API_BASE}/api/check-access?sessionId=${sessionId}&streamId=${streamId}`)
    const accessData = await accessResponse.json()
    
    if (accessData.success && accessData.data.hasAccess) {
      console.log('✅ Access verified successfully!')
    } else {
      console.log('❌ Access verification failed')
    }
    
    // Step 3: Generate browser commands
    console.log('\n📝 Step 3: Browser setup commands:')
    console.log('=====================================')
    console.log('')
    console.log('// Copy and paste these commands in your browser console (F12):')
    console.log('')
    console.log('// Clear old session data')
    console.log("localStorage.removeItem('currentSessionId')")
    console.log("localStorage.removeItem('currentTrxId')")
    console.log('')
    console.log('// Set new session data')
    console.log(`localStorage.setItem('currentSessionId', '${sessionId}')`)
    console.log(`localStorage.setItem('currentTrxId', '${trxId}')`)
    console.log('')
    console.log('// Verify session data')
    console.log("console.log('Session ID:', localStorage.getItem('currentSessionId'))")
    console.log("console.log('Transaction ID:', localStorage.getItem('currentTrxId'))")
    console.log('')
    console.log('// Refresh the page')
    console.log('window.location.reload()')
    console.log('')
    console.log('✅ Ready! Now refresh the stream page or visit:')
    console.log(`🔗 http://localhost:3001/stream?id=${streamId}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Get stream ID from command line argument
const streamId = process.argv[2] || '2'

if (require.main === module) {
  quickApprove(streamId).catch(console.error)
}

module.exports = { quickApprove }
