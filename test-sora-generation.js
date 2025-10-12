/**
 * Test script for Sora API video generation
 * Tests the complete workflow: generate video -> poll status -> verify completion
 */

require('dotenv').config()

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const API_BASE_URL = 'http://localhost:3002'

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY not found in .env file')
  process.exit(1)
}

console.log('🔑 OpenAI API Key found:', OPENAI_API_KEY.substring(0, 20) + '...')
console.log('🌐 Testing against:', API_BASE_URL)
console.log('')

async function testDirectSoraAPI() {
  console.log('📡 Testing direct OpenAI Sora API call...')

  try {
    // Use FormData instead of JSON as per the Sora API requirements
    const formData = new FormData()
    formData.append('prompt', 'A serene sunset over calm ocean waters, with gentle waves reflecting golden and orange hues from the sky.')
    formData.append('model', 'sora-2')
    formData.append('size', '1280x720')
    formData.append('seconds', '4')

    const response = await fetch('https://api.openai.com/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Do not set Content-Type - it will be set automatically with the correct boundary for FormData
      },
      body: formData
    })

    const contentType = response.headers.get('content-type')
    console.log('Response status:', response.status)
    console.log('Response content-type:', contentType)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Sora API Error:', response.status, response.statusText)
      console.error('Error details:', errorText)
      return null
    }

    const data = await response.json()
    console.log('✅ Sora API Response:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('❌ Error calling Sora API:', error.message)
    return null
  }
}

async function pollVideoStatus(jobId) {
  console.log(`\n🔄 Polling status for job: ${jobId}`)

  let attempts = 0
  const maxAttempts = 60 // 5 minutes max (5 second intervals)

  while (attempts < maxAttempts) {
    attempts++

    try {
      const response = await fetch(`https://api.openai.com/v1/videos/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Status check failed:`, errorText)
        return null
      }

      const status = await response.json()
      console.log(`[${attempts}] Status: ${status.status}${status.progress ? ` (${status.progress}%)` : ''}`)

      if (status.status === 'completed') {
        console.log('✅ Video generation completed!')
        console.log('Video URL:', status.download_url || status.video_url || 'N/A')
        return status
      } else if (status.status === 'failed') {
        console.error('❌ Video generation failed:', status.error || 'Unknown error')
        return null
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000))

    } catch (error) {
      console.error(`❌ Error polling status:`, error.message)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }

  console.error('❌ Timeout: Video generation took too long')
  return null
}

async function main() {
  console.log('🚀 Starting Sora API Video Generation Test\n')
  console.log('=' .repeat(60))

  // Test 1: Direct Sora API call
  const generationResult = await testDirectSoraAPI()

  if (!generationResult) {
    console.log('\n❌ Test failed: Could not initiate video generation')
    process.exit(1)
  }

  // Extract job ID from response
  const jobId = generationResult.id

  if (!jobId) {
    console.log('\n❌ Test failed: No job ID in response')
    console.log('Response:', generationResult)
    process.exit(1)
  }

  console.log(`\n✅ Video generation initiated successfully!`)
  console.log(`Job ID: ${jobId}`)

  // Test 2: Poll for completion
  const finalStatus = await pollVideoStatus(jobId)

  if (!finalStatus) {
    console.log('\n❌ Test failed: Video generation did not complete')
    process.exit(1)
  }

  console.log('\n' + '=' .repeat(60))
  console.log('✅ ALL TESTS PASSED!')
  console.log('=' .repeat(60))
  console.log('\n📊 Test Summary:')
  console.log(`  ✓ OpenAI Sora API is accessible`)
  console.log(`  ✓ Video generation request succeeded`)
  console.log(`  ✓ Status polling works correctly`)
  console.log(`  ✓ Video completed successfully`)
  console.log(`\n🎬 Video is ready at: ${finalStatus.download_url || finalStatus.video_url || 'N/A'}`)
}

main().catch(error => {
  console.error('\n❌ Unexpected error:', error)
  process.exit(1)
})
