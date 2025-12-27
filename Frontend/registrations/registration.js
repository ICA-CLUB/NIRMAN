
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

// Initialize Supabase
const supabaseUrl = 'https://pzvgldyubmvsyrnexpdy.supabase.co'
const supabaseKey = 'sb_publishable_oZA6cnDRUnWbYhz-JDf-cQ_uYVJAzU8'
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM Elements
const form = document.getElementById('registrationForm')
const toStep2Btn = document.getElementById('toStep2Btn')
const backToStep1Btn = document.getElementById('backToStep1Btn')
const submitBtn = document.getElementById('submitBtn')
const memberCountSelect = document.getElementById('memberCount')
const memberList = document.getElementById('memberList')

// Show/hide steps
function showStep(stepNumber) {
    document.querySelectorAll('.reg-step').forEach((step, index) => {
        step.classList.toggle('is-hidden', index + 1 !== stepNumber)
    })
}

// Validate step 1 (leader details)
function validateStep1() {
    // Required fields
    const requiredFields = ['teamName', 'collegeName', 'leaderName', 'leaderEmail', 'leaderPhone']
    for (const field of requiredFields) {
        const value = getTrimmedValue(field)
        if (!value) {
            setFormMessage('error', `Please fill in all required fields.`)
            return false
        }
    }

    // Validate email
    if (!validateEmail(getTrimmedValue('leaderEmail'))) {
        setFormMessage('error', 'Please enter a valid email address.')
        return false
    }

    // Validate phone
    if (!validatePhone(getTrimmedValue('leaderPhone'))) {
        setFormMessage('error', 'Please enter a valid phone number.')
        return false
    }

    return true
}

// Generate member input fields
function generateMemberFields(count) {
    memberList.innerHTML = ''
    
    for (let i = 0; i < count; i++) {
        const memberDiv = document.createElement('div')
        memberDiv.className = 'member-card'
        memberDiv.innerHTML = `
            <h3>Member ${i + 1}</h3>
            <div class="form-group">
                <label for="memberName${i}">Full Name *</label>
                <input type="text" id="memberName${i}" required>
            </div>
            <div class="form-group">
                <label for="memberEmail${i}">Email *</label>
                <input type="email" id="memberEmail${i}" required>
            </div>
            <div class="form-group">
                <label for="memberPhone${i}">Phone *</label>
                <input type="tel" id="memberPhone${i}" required>
                <div class="hint" id="memberPhoneHint${i}"></div>
            </div>
        `
        memberList.appendChild(memberDiv)
    }
}

// Validate member details
function validateMembers() {
    const memberCount = parseInt(memberCountSelect.value) || 0
    
    for (let i = 0; i < memberCount; i++) {
        const name = getTrimmedValue(`memberName${i}`)
        const email = getTrimmedValue(`memberEmail${i}`)
        const phone = getTrimmedValue(`memberPhone${i}`)

        if (!name || !email || !phone) {
            setFormMessage('error', `Please fill in all details for Member ${i + 1}`)
            return false
        }

        if (!validateEmail(email)) {
            setFormMessage('error', `Please enter a valid email for Member ${i + 1}`)
            return false
        }

        if (!validatePhone(phone)) {
            setFormMessage('error', `Please enter a valid phone number for Member ${i + 1}`)
            return false
        }
    }
    
    return true
}

// Helper functions
function setFormMessage(type, message) {
    const formMessage = document.getElementById('formMessage')
    if (!formMessage) return

    formMessage.className = 'form-message'
    if (type) formMessage.classList.add(type)
    formMessage.textContent = message
    formMessage.style.display = 'block'
}

function getTrimmedValue(id) {
    const el = document.getElementById(id)
    return el ? el.value.trim() : ''
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone) {
    return /^\d{10,15}$/.test(phone.replace(/\D/g, ''))
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Step 1 to Step 2
    if (toStep2Btn) {
        toStep2Btn.addEventListener('click', (e) => {
            e.preventDefault()
            if (validateStep1()) {
                showStep(2)
                setFormMessage('', '')
            }
        })
    }

    // Back to Step 1
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', (e) => {
            e.preventDefault()
            showStep(1)
            setFormMessage('', '')
        })
    }

    // Member count change
    if (memberCountSelect) {
        memberCountSelect.addEventListener('change', (e) => {
            const count = parseInt(e.target.value) || 0
            generateMemberFields(count)
        })
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault()
            setFormMessage('', '')

            if (!validateStep1() || !validateMembers()) {
                return
            }

            submitBtn.disabled = true
            submitBtn.textContent = 'Submitting...'

            try {
                // Prepare team data
                const teamData = {
                    team_name: getTrimmedValue('teamName'),
                    college_name: getTrimmedValue('collegeName'),
                    created_at: new Date().toISOString()
                }

                // Save team to database
                const { data: team, error: teamError } = await supabase
                    .from('teams')
                    .insert([teamData])
                    .select()
                    .single()

                if (teamError) throw teamError

                // Save leader
                const leaderData = {
                    team_id: team.id,
                    name: getTrimmedValue('leaderName'),
                    email: getTrimmedValue('leaderEmail'),
                    phone: getTrimmedValue('leaderPhone'),
                    is_leader: true
                }

                const { error: leaderError } = await supabase
                    .from('members')
                    .insert([leaderData])

                if (leaderError) throw leaderError

                // Save team members
                const memberCount = parseInt(memberCountSelect.value) || 0
                const members = []

                for (let i = 0; i < memberCount; i++) {
                    members.push({
                        team_id: team.id,
                        name: getTrimmedValue(`memberName${i}`),
                        email: getTrimmedValue(`memberEmail${i}`),
                        phone: getTrimmedValue(`memberPhone${i}`),
                        is_leader: false
                    })
                }

                if (members.length > 0) {
                    const { error: membersError } = await supabase
                        .from('members')
                        .insert(members)

                    if (membersError) throw membersError
                }

                // Store team ID in session for payment
                sessionStorage.setItem('teamId', team.id)
                sessionStorage.setItem('teamName', team.team_name)

                // Redirect to payment
                window.location.href = '../payment/payment.html'

            } catch (error) {
                console.error('Registration error:', error)
                setFormMessage('error', 'Registration failed. Please try again.')
                submitBtn.disabled = false
                submitBtn.textContent = 'Submit & Go to Payment'
            }
        })
    }
})