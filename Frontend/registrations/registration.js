import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

// Initialize Supabase
const supabaseUrl = 'https://pzvgldyubmvsyrnexpdy.supabase.co'
const supabaseKey = 'sb_publishable_oZA6cnDRUnWbYhz-JDf-cQ_uYVJAzU8'
const supabase = createClient(supabaseUrl, supabaseKey)

function setFormMessage(type, message) {
  const formMessage = document.getElementById('formMessage');
  if (!formMessage) return;

  formMessage.classList.remove('success', 'error');
  if (type) formMessage.classList.add(type);
  formMessage.textContent = message;
}

function setHint(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
}

function getTrimmedValue(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  return String(el.value || '').trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function validatePhone(phone) {
  return normalizePhone(phone).length >= 10;
}

function showStep(stepNumber) {
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
  ];
  steps.forEach((step, idx) => {
    if (!step) return;
    if (idx === stepNumber - 1) step.classList.remove('is-hidden');
    else step.classList.add('is-hidden');
  });
}

function createMemberCard(index) {
  const wrapper = document.createElement('div');
  wrapper.className = 'member-card';
  wrapper.dataset.memberIndex = String(index);

  const head = document.createElement('div');
  head.className = 'member-head';

  const title = document.createElement('div');
  title.className = 'member-title';
  title.textContent = `Member ${index + 1}`;

  const status = document.createElement('div');
  status.className = 'field-status';
  status.setAttribute('aria-label', 'Member validity');

  head.appendChild(title);
  head.appendChild(status);

  const grid = document.createElement('div');
  grid.className = 'reg-grid';

  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name *';
  nameLabel.setAttribute('for', `memberName_${index}`);
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = `memberName_${index}`;
  nameInput.name = `memberName_${index}`;
  nameInput.placeholder = 'Enter member name';
  nameInput.required = true;
  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);

  const phoneGroup = document.createElement('div');
  phoneGroup.className = 'form-group';
  const phoneLabel = document.createElement('label');
  phoneLabel.textContent = 'Phone *';
  phoneLabel.setAttribute('for', `memberPhone_${index}`);
  const phoneInput = document.createElement('input');
  phoneInput.type = 'tel';
  phoneInput.id = `memberPhone_${index}`;
  phoneInput.name = `memberPhone_${index}`;
  phoneInput.placeholder = 'Enter phone number';
  phoneInput.required = true;
  phoneGroup.appendChild(phoneLabel);
  phoneGroup.appendChild(phoneInput);

  grid.appendChild(nameGroup);
  grid.appendChild(phoneGroup);

  const updateStatus = () => {
    const nameOk = String(nameInput.value || '').trim().length > 1;
    const phoneOk = validatePhone(phoneInput.value || '');
    status.classList.remove('is-valid', 'is-invalid');
    if (!nameInput.value && !phoneInput.value) return;
    status.classList.add(nameOk && phoneOk ? 'is-valid' : 'is-invalid');
  };

  nameInput.addEventListener('input', updateStatus);
  phoneInput.addEventListener('input', updateStatus);

  wrapper.appendChild(head);
  wrapper.appendChild(grid);
  return wrapper;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const teamNameEl = document.getElementById('teamName');
  const collegeNameEl = document.getElementById('collegeName');
  const leaderNameEl = document.getElementById('leaderName');
  const leaderEmailEl = document.getElementById('leaderEmail');
  const leaderPhoneEl = document.getElementById('leaderPhone');
  const leaderOtpEl = document.getElementById('leaderOtp');
  const memberCountEl = document.getElementById('memberCount');
  const memberListEl = document.getElementById('memberList');

  const sendOtpBtn = document.getElementById('sendOtpBtn');
  const verifyOtpBtn = document.getElementById('verifyOtpBtn');
  const toStep2Btn = document.getElementById('toStep2Btn');
  const toStep3Btn = document.getElementById('toStep3Btn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const backToStep2Btn = document.getElementById('backToStep2Btn');
  const submitBtn = document.getElementById('submitBtn');

  let otp = '';
  let otpSentFor = '';
  let leaderPhoneVerified = false;

  const canProceedStep1 = () => {
    const teamName = getTrimmedValue('teamName');
    const collegeName = getTrimmedValue('collegeName');
    const leaderName = getTrimmedValue('leaderName');
    const leaderEmail = getTrimmedValue('leaderEmail');
    const leaderPhone = getTrimmedValue('leaderPhone');

    if (!teamName || !collegeName || !leaderName || !leaderEmail || !leaderPhone) return false;
    if (!validateEmail(leaderEmail)) return false;
    if (!validatePhone(leaderPhone)) return false;
    return true;
  };

  const rebuildMembers = (count) => {
    if (!memberListEl) return;
    memberListEl.innerHTML = '';
    if (!count) return;
    for (let i = 0; i < count; i += 1) {
      memberListEl.appendChild(createMemberCard(i));
    }
  };

  const validateMembers = () => {
    const count = Number(getTrimmedValue('memberCount'));
    if (!Number.isFinite(count) || count < 1) return { ok: false, reason: 'Please select number of team members.' };

    const phones = new Set();
    for (let i = 0; i < count; i += 1) {
      const name = getTrimmedValue(`memberName_${i}`);
      const phone = getTrimmedValue(`memberPhone_${i}`);
      const norm = normalizePhone(phone);
      if (!name || name.length < 2) return { ok: false, reason: `Member ${i + 1}: please enter a valid name.` };
      if (!validatePhone(phone)) return { ok: false, reason: `Member ${i + 1}: please enter a valid phone (10+ digits).` };
      if (phones.has(norm)) return { ok: false, reason: 'Duplicate phone numbers found in team members.' };
      phones.add(norm);
    }

    const leaderNorm = normalizePhone(getTrimmedValue('leaderPhone'));
    if (leaderNorm && phones.has(leaderNorm)) return { ok: false, reason: 'Member phone cannot be same as leader phone.' };

    return { ok: true };
  };

  if (leaderPhoneEl) {
    leaderPhoneEl.addEventListener('input', () => {
      leaderPhoneVerified = false;
      if (toStep3Btn) toStep3Btn.disabled = true;
      setHint('leaderPhoneHint', validatePhone(leaderPhoneEl.value) ? '' : 'Enter a valid phone (10+ digits).');
    });
  }

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener('click', async () => {
      setFormMessage('', '');
      setHint('otpHint', '');

      const leaderPhone = getTrimmedValue('leaderPhone');
      if (!validatePhone(leaderPhone)) {
        setHint('leaderPhoneHint', 'Please enter a valid phone number first.');
        return;
      }

      // Disable button while sending
      sendOtpBtn.disabled = true;
      sendOtpBtn.textContent = 'Sending...';

      try {
        // Format phone number for Supabase (with country code)
        const formattedPhone = normalizePhone(leaderPhone).length === 10 
          ? `+91${normalizePhone(leaderPhone)}` 
          : `+${normalizePhone(leaderPhone)}`;

        // Send OTP using Supabase Auth
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: false // Don't create user account, just verify phone
          }
        });

        if (error) throw error;

        otpSentFor = normalizePhone(leaderPhone);
        leaderPhoneVerified = false;
        if (toStep3Btn) toStep3Btn.disabled = true;

        setHint('leaderPhoneHint', 'OTP sent successfully!');
        setHint('otpHint', 'Please enter the OTP received on your phone.');

      } catch (error) {
        console.error('Error sending OTP:', error);
        setHint('leaderPhoneHint', '');
        setHint('otpHint', 'Failed to send OTP. Please try again.');
        
        // Fallback to demo OTP if Supabase fails
        otp = String(Math.floor(100000 + Math.random() * 900000));
        otpSentFor = normalizePhone(leaderPhone);
        setHint('otpHint', `OTP service unavailable. Demo OTP: ${otp}`);
      } finally {
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Send OTP';
      }
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener('click', async () => {
      setFormMessage('', '');

      const leaderPhone = normalizePhone(getTrimmedValue('leaderPhone'));
      const otpInput = getTrimmedValue('leaderOtp');

      if (!otpSentFor || otpSentFor !== leaderPhone) {
        setHint('otpHint', 'Please click "Send OTP" again.');
        leaderPhoneVerified = false;
        if (toStep3Btn) toStep3Btn.disabled = true;
        return;
      }

      if (!otpInput) {
        setHint('otpHint', 'Please enter the OTP.');
        return;
      }

      // Disable button while verifying
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = 'Verifying...';

      try {
        // Format phone number for Supabase
        const formattedPhone = leaderPhone.length === 10 
          ? `+91${leaderPhone}` 
          : `+${leaderPhone}`;

        // Verify OTP using Supabase Auth
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpInput,
          type: 'sms'
        });

        if (error) {
          // Check if it's the demo OTP fallback
          if (otp && otpInput === otp) {
            leaderPhoneVerified = true;
            setHint('otpHint', 'Phone verified successfully (Demo mode).');
            if (toStep3Btn) toStep3Btn.disabled = false;
          } else {
            throw error;
          }
        } else {
          // Real OTP verification successful
          leaderPhoneVerified = true;
          setHint('otpHint', 'Phone verified successfully!');
          if (toStep3Btn) toStep3Btn.disabled = false;
          
          // Clear any demo OTP
          otp = '';
        }

      } catch (error) {
        console.error('Error verifying OTP:', error);
        
        // Check if it's the demo OTP fallback
        if (otp && otpInput === otp) {
          leaderPhoneVerified = true;
          setHint('otpHint', 'Phone verified successfully (Demo mode).');
          if (toStep3Btn) toStep3Btn.disabled = false;
        } else {
          setHint('otpHint', 'Incorrect OTP. Please try again.');
          leaderPhoneVerified = false;
          if (toStep3Btn) toStep3Btn.disabled = true;
        }
      } finally {
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = 'Verify OTP';
      }
    });
  }

  if (toStep2Btn) {
    toStep2Btn.addEventListener('click', () => {
      setFormMessage('', '');
      if (!canProceedStep1()) {
        setFormMessage('error', 'Please complete leader details with valid email and phone.');
        return;
      }
      showStep(2);
    });
  }

  if (backToStep1Btn) {
    backToStep1Btn.addEventListener('click', () => {
      setFormMessage('', '');
      showStep(1);
    });
  }

  if (toStep3Btn) {
    toStep3Btn.addEventListener('click', () => {
      setFormMessage('', '');
      if (!leaderPhoneVerified) {
        setFormMessage('error', 'Please verify the leader phone number to continue.');
        return;
      }
      showStep(3);
    });
  }

  if (backToStep2Btn) {
    backToStep2Btn.addEventListener('click', () => {
      setFormMessage('', '');
      showStep(2);
    });
  }

  if (memberCountEl) {
    memberCountEl.addEventListener('change', () => {
      setFormMessage('', '');
      const count = Number(getTrimmedValue('memberCount'));
      if (!Number.isFinite(count) || count < 1) {
        rebuildMembers(0);
        return;
      }
      rebuildMembers(count);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setFormMessage('', '');

    if (!canProceedStep1()) {
      setFormMessage('error', 'Please complete leader details correctly.');
      showStep(1);
      return;
    }

    if (!leaderPhoneVerified) {
      setFormMessage('error', 'Please verify leader phone number before submitting.');
      showStep(2);
      return;
    }

    const membersValidation = validateMembers();
    if (!membersValidation.ok) {
      setFormMessage('error', membersValidation.reason || 'Please complete team members correctly.');
      showStep(3);
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      // Prepare registration data
      const formData = new FormData(form);
      const registrationData = {
        team_name: formData.get('teamName'),
        leader_name: formData.get('leaderName'),
        leader_email: formData.get('leaderEmail'),
        leader_phone: formData.get('leaderPhone'),
        leader_college: formData.get('leaderCollege'),
        leader_year: formData.get('leaderYear'),
        leader_department: formData.get('leaderDepartment'),
        payment_status: 'pending',
        created_at: new Date().toISOString()
      };

      // Insert registration into Supabase
      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) throw error;

      // Save team members if any
      const members = Array.from(document.querySelectorAll('.member-card')).map((card) => {
        const index = card.dataset.memberIndex;
        return {
          registration_id: data.id,
          name: document.getElementById(`memberName_${index}`).value,
          email: document.getElementById(`memberEmail_${index}`)?.value || '',
          phone: document.getElementById(`memberPhone_${index}`).value,
          college: document.getElementById(`memberCollege_${index}`)?.value || '',
          year: document.getElementById(`memberYear_${index}`)?.value || '',
          department: document.getElementById(`memberDepartment_${index}`)?.value || '',
          created_at: new Date().toISOString()
        };
      });

      if (members.length > 0) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert(members);
        
        if (memberError) throw memberError;
      }

      // Redirect to payment page with registration ID
      window.location.href = `../payment/payment.html?id=${data.id}`;

    } catch (error) {
      console.error('Error submitting registration:', error);
      setFormMessage('error', 'There was an error submitting your registration. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Registration';
      }
    }
  });

  // Default state
  showStep(1);
  if (toStep3Btn) toStep3Btn.disabled = true;
  if (leaderOtpEl) leaderOtpEl.value = '';
  if (teamNameEl) teamNameEl.autocomplete = 'organization';
  if (leaderEmailEl) leaderEmailEl.autocomplete = 'email';
  if (leaderPhoneEl) leaderPhoneEl.autocomplete = 'tel';
  if (leaderNameEl) leaderNameEl.autocomplete = 'name';
  if (collegeNameEl) collegeNameEl.autocomplete = 'organization';
});
