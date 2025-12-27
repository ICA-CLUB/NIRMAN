// Frontend/registrations/payment.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'

// Initialize Supabase
const supabaseUrl = 'https://pzvgldyubmvsyrnexpdy.supabase.co'
const supabaseKey = 'sb_publishable_oZA6cnDRUnWbYhz-JDf-cQ_uYVJAzU8'
const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const verifyPaymentBtn = document.getElementById('verifyPayment');
    const paymentSuccess = document.getElementById('paymentSuccess');
    
    // Get registration ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const registrationId = urlParams.get('id');
    
    if (verifyPaymentBtn) {
        verifyPaymentBtn.addEventListener('click', async () => {
            if (!registrationId) {
                alert('Invalid registration ID. Please try registering again.');
                return;
            }
            
            try {
                // Update payment status in Supabase
                const { data, error } = await supabase
                    .from('registrations')
                    .update({ 
                        payment_status: 'pending_verification',
                        payment_method: 'upi',
                        payment_date: new Date().toISOString()
                    })
                    .eq('id', registrationId)
                    .select()
                    .single();
                
                if (error) throw error;
                
                // Show success message
                verifyPaymentBtn.style.display = 'none';
                paymentSuccess.style.display = 'block';
                
                // You might want to send an email to admin for manual verification
                // or implement webhook for payment gateway verification
                
            } catch (error) {
                console.error('Error updating payment status:', error);
                alert('There was an error verifying your payment. Please contact support.');
            }
        });
    }
});