import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { prisma } from '@/lib/prisma'

const GROK_API_URL = process.env.GROK_API_URL || 'https://api.x.ai/v1'
const GROK_API_KEY = process.env.GROK_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { userId, job, contacts, previousMessages, feedback } = await request.json()

    if (!userId || !job || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'User ID, job information, and contacts are required' },
        { status: 400 }
      )
    }

    const isRevision = !!feedback && Object.keys(feedback).length > 0

    if (!GROK_API_KEY) {
      return NextResponse.json(
        { error: 'Grok API key not configured' },
        { status: 500 }
      )
    }

    // Get user profile and application questions
    const [profile, applicationQuestions] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      prisma.jobApplicationQuestion.findUnique({
        where: { userId },
      })
    ])

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile first.' },
        { status: 400 }
      )
    }

    // Get job application
    const companyApplicationMonth = new Date().toISOString().slice(0, 7)
    const jobApplication = await prisma.jobApplication.findFirst({
      where: {
        userId,
        company: job.company,
        companyApplicationMonth,
      }
    })

    if (!jobApplication) {
      return NextResponse.json(
        { error: 'Job application not found' },
        { status: 400 }
      )
    }

    // Generate messages for each contact
    const messages = await Promise.all(
      contacts.map(async (contact: any) => {
        // Find previous message if this is a revision
        const previousMessage = isRevision && previousMessages 
          ? previousMessages.find((m: any) => m.contactId === contact.id)
          : null
        
        const contactFeedback = isRevision && feedback ? feedback[contact.id] : null

        // If revision but no feedback for this contact, return previous message
        if (isRevision && previousMessage && !contactFeedback) {
          return {
            contactId: contact.id,
            messageId: previousMessage.messageId,
            subject: previousMessage.subject,
            body: previousMessage.body,
          }
        }

        let prompt = ''
        
        if (isRevision && previousMessage && contactFeedback) {
          // Revision prompt with feedback
          prompt = `
Revise the following email based on user feedback.

ORIGINAL EMAIL:
Subject: ${previousMessage.subject || 'Not specified'}
Body: ${previousMessage.body || 'Not specified'}

USER FEEDBACK:
${contactFeedback}

CANDIDATE INFORMATION:
- Name: ${profile.firstName} ${profile.lastName}
- Current Title: ${profile.currentTitle || 'Not specified'}
- Current Company: ${profile.currentCompany || 'Not specified'}
- Summary: ${profile.summary || 'Not specified'}
- Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified'}
- Years of Experience: ${profile.yearsExperience || 'Not specified'}

${applicationQuestions?.questions ? `
APPLICATION QUESTIONS ANSWERS:
${JSON.stringify(applicationQuestions.questions, null, 2)}
` : ''}

CONTACT INFORMATION:
- Name: ${contact.name}
- Title: ${contact.title || 'Not specified'}
- Company: ${contact.company || 'Not specified'}
- Role: ${contact.role}

JOB INFORMATION:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description || 'Not specified'}

REVISION REQUIREMENTS:
1. Incorporate the user feedback provided above
2. Maintain the core message and professionalism
3. Keep all the relevant information from the original email
4. Make the requested improvements/changes
5. Ensure the email still positions the candidate as a strong fit
6. Keep it concise but impactful (3-4 paragraphs)
7. Use a professional but approachable tone

FORMAT:
Return a JSON object with the following structure:
{
  "subject": "Revised email subject line",
  "body": "Revised email body content (use \\n for line breaks)"
}

Return ONLY the JSON object, no additional text or formatting.
`
        } else {
          // Initial generation prompt
          prompt = `
Create a personalized professional email for a job application networking outreach.

CANDIDATE INFORMATION:
- Name: ${profile.firstName} ${profile.lastName}
- Current Title: ${profile.currentTitle || 'Not specified'}
- Current Company: ${profile.currentCompany || 'Not specified'}
- Summary: ${profile.summary || 'Not specified'}
- Skills: ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Not specified'}
- Years of Experience: ${profile.yearsExperience || 'Not specified'}

${applicationQuestions?.questions ? `
APPLICATION QUESTIONS ANSWERS:
${JSON.stringify(applicationQuestions.questions, null, 2)}
` : ''}

CONTACT INFORMATION:
- Name: ${contact.name}
- Title: ${contact.title || 'Not specified'}
- Company: ${contact.company || 'Not specified'}
- Role: ${contact.role}

JOB INFORMATION:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location || 'Not specified'}
- Description: ${job.description || 'Not specified'}

EMAIL REQUIREMENTS:
1. Write a warm, professional email that positions the candidate as a strong fit for the role
2. Reference the specific job title and company
3. Highlight 2-3 key qualifications from the candidate's profile that match the role
4. Express genuine interest in the position and company
5. Ask for a brief 15-30 minute conversation to discuss the role
6. Be respectful of their time
7. Keep it concise but impactful (3-4 paragraphs)
8. Use a professional but approachable tone
9. Include specific details from the candidate's experience that relate to the job

FORMAT:
Return a JSON object with the following structure:
{
  "subject": "Compelling email subject line",
  "body": "Email body content (use \\n for line breaks)"
}

Return ONLY the JSON object, no additional text or formatting.
`
        }

        try {
          const response = await axios.post(
            `${GROK_API_URL}/chat/completions`,
            {
              model: 'grok-beta',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert at writing professional, personalized emails for job networking. Your emails should be warm, professional, and position the sender as a strong candidate while asking for a brief connection. Keep emails concise but impactful. Always return valid JSON.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              max_tokens: 1000,
              temperature: 0.7
            },
            {
              headers: {
                'Authorization': `Bearer ${GROK_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          )

          const content = response.data.choices[0].message.content.trim()
          
          // Parse the JSON response
          let messageData
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              messageData = JSON.parse(jsonMatch[0])
            } else {
              messageData = JSON.parse(content)
            }
          } catch (parseError) {
            console.error('Error parsing message response:', parseError)
            // Fallback: create a simple message
            messageData = {
              subject: `Re: ${job.title} Position at ${job.company}`,
              body: `Dear ${contact.name},\n\nI am writing to express my interest in the ${job.title} position at ${job.company}.\n\n[Message generation failed - please edit manually]`
            }
          }

          // Save or update message in database
          let savedMessage
          if (isRevision && previousMessage && previousMessage.messageId) {
            // Update existing message
            savedMessage = await prisma.generatedMessage.update({
              where: { id: previousMessage.messageId },
              data: {
                subject: messageData.subject || `Re: ${job.title} Position`,
                body: messageData.body || '',
                updatedAt: new Date(),
              }
            })
          } else {
            // Create new message
            savedMessage = await prisma.generatedMessage.create({
              data: {
                userId,
                jobApplicationId: jobApplication.id,
                contactId: contact.id,
                subject: messageData.subject || `Re: ${job.title} Position`,
                body: messageData.body || '',
                messageType: 'INTEREST_EXPRESSION',
                status: 'PENDING',
                platform: 'email',
              }
            })
          }

          return {
            contactId: contact.id,
            messageId: savedMessage.id,
            subject: messageData.subject || `Re: ${job.title} Position`,
            body: messageData.body || '',
          }
        } catch (error: any) {
          console.error(`Error generating message for contact ${contact.id}:`, error)
          // Return a fallback message
          return {
            contactId: contact.id,
            subject: `Re: ${job.title} Position at ${job.company}`,
            body: `Dear ${contact.name},\n\nI am writing to express my interest in the ${job.title} position at ${job.company}.\n\n[Message generation failed - please edit manually]`
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      messages,
      count: messages.length
    })
  } catch (error: any) {
    console.error('Error generating messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate messages' },
      { status: 500 }
    )
  }
}

