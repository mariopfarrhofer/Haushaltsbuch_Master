import React, { useState } from 'react';
import { SupabaseService } from '../../lib/services/supabaseClient';

export const WaterForm: React.FC = () => {
  const [meterValue, setMeterValue] = useState<number | ''>('');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (meterValue === '' || !date) {
      setMessage({ type: 'error', text: 'Please fill in required fields: Meter Value and Date.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Create payload matching expected water reading schema
      await SupabaseService.add({
        value: Number(meterValue),
        date,
        action: notes || null
      });

      setMessage({ type: 'success', text: 'Reading submitted successfully!' });
      
      // Reset form on success
      setMeterValue('');
      setDate('');
      setNotes('');
    } catch (error) {
      console.error('Submission failed:', error);
      setMessage({ type: 'error', text: 'Failed to submit the reading. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Add New Water Reading</h2>
      
      {message && (
        <div style={{ ...styles.message, ...(message.type === 'error' ? styles.error : styles.success) }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="meterValue" style={styles.label}>Meter Value (m³)*</label>
          <input
            id="meterValue"
            type="number"
            step="0.01"
            value={meterValue}
            onChange={(e) => setMeterValue(e.target.value === '' ? '' : Number(e.target.value))}
            style={styles.input}
            placeholder="e.g. 1450.50"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="date" style={styles.label}>Date*</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="notes" style={styles.label}>Notes (Optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
            placeholder="e.g. 'open' or 'close' state, or general notes"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          style={{ ...styles.button, ...(isSubmitting ? styles.buttonDisabled : {}) }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reading'}
        </button>
      </form>
    </div>
  );
};

// Simple, modern internal styling to ensure it looks good immediately in any app
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  title: {
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '22px',
    color: '#1a1a1a',
    fontWeight: '600',
    letterSpacing: '-0.02em',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    color: '#1f2937',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fafb',
  },
  button: {
    marginTop: '12px',
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  success: {
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
  }
};
