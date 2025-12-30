import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.7/+esm'

// Initialize Supabase
const supabaseUrl = 'https://pzvgldyubmvsyrnexpdy.supabase.co'
const supabaseKey = 'sb_publishable_oZA6cnDRUnWbYhz-JDf-cQ_uYVJAzU8'
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

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
    console.log('Validating step 1...')
    // Required fields
    const requiredFields = ['teamName', 'collegeName', 'leaderName', 'leaderEmail', 'leaderPhone']
    for (const field of requiredFields) {
        const value = getTrimmedValue(field)
        console.log(`Field ${field}: "${value}"`)
        if (!value) {
            setFormMessage('error', `Please fill in all required fields.`)
            return false
        }
    }

    // Validate email
    const email = getTrimmedValue('leaderEmail')
    console.log('Email validation:', email, validateEmail(email))
    if (!validateEmail(email)) {
        setFormMessage('error', 'Please enter a valid email address.')
        return false
    }

    // Validate phone
    const phone = getTrimmedValue('leaderPhone')
    console.log('Phone validation:', phone, validatePhone(phone))
    if (!validatePhone(phone)) {
        setFormMessage('error', 'Please enter a valid phone number.')
        return false
    }

    console.log('Step 1 validation passed!')
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
        console.log('Next button found:', toStep2Btn)
        toStep2Btn.addEventListener('click', (e) => {
            console.log('Next button clicked')
            e.preventDefault()
            const isValid = validateStep1()
            console.log('Validation result:', isValid)
            if (isValid) {
                console.log('Moving to step 2')
                showStep(2)
                setFormMessage('', '')
            }
        })
    } else {
        console.error('Next button not found!')
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

                console.log('Saving team data:', teamData)
                const { data: team, error: teamError } = await supabase
                    .from('teams')
                    .insert([teamData])
                    .select()
                    .single()

                if (teamError) {
                    console.error('Team save error:', teamError)
                    throw teamError
                }
                console.log('Team saved successfully:', team)

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

                // Show success message
                setFormMessage('success', 'Registration successful 🔥! Our team will contact you shortly.')
                
                // Reset form after successful submission
                form.reset()
                memberList.innerHTML = ''
                showStep(1)
                
                // Reset button
                submitBtn.disabled = false
                submitBtn.textContent = 'Submit Registration'

            } catch (error) {
                console.error('Registration error:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                setFormMessage('error', `Maybe Serve is Down 😵: ---  Try Again After Some Time ---  `)
                console.log('error', `Registration failed: ${error.message}`)
                submitBtn.disabled = false
                submitBtn.textContent = 'Submit '
            }
        })
    }
})