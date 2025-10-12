/**
 * Test to find the correct Sora API status endpoint
 */

require('dotenv').config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const JOB_ID = 'video_68ebb02083ac81918012e956de3ddf2102a14a61a0ed4718'

async function testEndpoint(url, description) {
  console.log(`\n Testing: ${description}`)
  console.log(`Endpoint: ${url}`)

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      }
    })

    console.log(`Status: ${response.status}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}`)

    if (response.ok) {
      const data = await response.json()
      console.log('✅ SUCCESS! Response:', JSON.stringify(data, null, 2))
      return true
    } else {
      const text = await response.text()
      console.log(`❌ Error response:`, text.substring(0, 200))
      return false
    }
  } catch (error) {
    console.log(`❌ Request failed:`, error.message)
    return false
  }
}

async function main() {
  console.log('🔍 Testing different Sora API status endpoints...\n')
  console.log('Job ID:', JOB_ID)
  console.log('='.repeat(60))

  const endpoints = [
    [`https://api.openai.com/v1/videos/${JOB_ID}`, 'GET /v1/videos/{id}'],
    [`https://api.openai.com/v1/video/generations/${JOB_ID}`, 'GET /v1/video/generations/{id}'],
    [`https://api.openai.com/v1/videos/${JOB_ID}/status`, 'GET /v1/videos/{id}/status'],
    [`https://api.openai.com/v1/videos/generations/${JOB_ID}`, 'GET /v1/videos/generations/{id}'],
  ]

  for (const [url, description] of endpoints) {
    const success = await testEndpoint(url, description)
    if (success) {
      console.log('\n' + '='.repeat(60))
      console.log(`✅ FOUND WORKING ENDPOINT: ${url}`)
      console.log('='.repeat(60))
      break
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

main().catch(console.error)
