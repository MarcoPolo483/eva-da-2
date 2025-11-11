import React, { useState, useCallback, useEffect } from 'react';

export interface TermsAcceptance {
  protectedBCompliance: boolean;
  dataCollection: boolean;
  termsAcceptance: boolean;
  courseRegistration: boolean;
  version: string;
  acceptedAt: string;
}

// Helper to check if we're in production
const isProduction = () => {
  // In React, check if NODE_ENV is available via process.env (bundled)
  try {
    return (window as any).location?.hostname !== 'localhost' && 
           (window as any).location?.protocol === 'https:';
  } catch {
    return false;
  }
};

// Hook to manage Terms of Use state
export function useTermsOfUse() {
  const [termsAccepted, setTermsAccepted] = useState<TermsAcceptance | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRemoteTermsAcceptance = async () => {
    try {
      const response = await fetch('/api/chat/terms-of-use', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'X-Tenant-Id': getTenantId(),
          'X-User-Id': getUserId(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if user has current version accepted
        if (data.userAcceptance && data.userAcceptance.version === data.currentVersion) {
          setTermsAccepted(data.userAcceptance);
        } else {
          // Need to accept current version
          setShowTermsModal(true);
        }
      } else {
        // API error - show modal as fallback
        setShowTermsModal(true);
      }
    } catch (error) {
      console.error('Error fetching remote terms status:', error);
      setShowTermsModal(true);
    }
  };

  const checkStoredTermsAcceptance = useCallback(async () => {
    try {
      // Try localStorage first (for development)
      const storedTerms = localStorage.getItem('eva-chat-terms-acceptance');
      if (storedTerms) {
        const parsedTerms = JSON.parse(storedTerms) as TermsAcceptance;
        // Check if terms version is current
        if (parsedTerms.version === '2024.1') {
          setTermsAccepted(parsedTerms);
          return;
        }
      }

      // In production, check with EVA Platform API
      if (isProduction()) {
        await checkRemoteTermsAcceptance();
      } else {
        // Development: Show terms modal if no local acceptance
        setShowTermsModal(true);
      }
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      setShowTermsModal(true);
    }
  }, []);

  useEffect(() => {
    // Check if terms were previously accepted
    checkStoredTermsAcceptance();
  }, [checkStoredTermsAcceptance]);

  const submitTermsAcceptance = async (acceptance: TermsAcceptance) => {
    const response = await fetch('/api/chat/terms-of-use', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`,
        'X-Tenant-Id': getTenantId(),
        'X-User-Id': getUserId(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: acceptance.version,
        checkboxes: {
          protectedBCompliance: acceptance.protectedBCompliance,
          dataCollection: acceptance.dataCollection,
          termsAcceptance: acceptance.termsAcceptance,
          courseRegistration: acceptance.courseRegistration
        },
        ipAddress: await getUserIPAddress()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to submit terms: ${errorData.error?.message || 'Unknown error'}`);
    }

    return await response.json();
  };

  const handleTermsAccept = async (acceptance: TermsAcceptance) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Store locally for immediate use
      localStorage.setItem('eva-chat-terms-acceptance', JSON.stringify(acceptance));
      
      // Submit to EVA Platform API (production)
      if (isProduction()) {
        await submitTermsAcceptance(acceptance);
      }

      setTermsAccepted(acceptance);
      setShowTermsModal(false);
    } catch (error) {
      console.error('Error submitting terms acceptance:', error);
      setError('Failed to submit terms acceptance. Please try again.');
      
      // Remove from localStorage if API submission failed
      localStorage.removeItem('eva-chat-terms-acceptance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requireTermsAcceptance = () => {
    if (!termsAccepted) {
      setShowTermsModal(true);
      return false;
    }
    return true;
  };

  const revokeTermsAcceptance = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('eva-chat-terms-acceptance');
      
      // In production, also revoke on server
      if (isProduction()) {
        await fetch('/api/chat/terms-of-use', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`,
            'X-Tenant-Id': getTenantId(),
            'X-User-Id': getUserId()
          }
        });
      }

      setTermsAccepted(null);
      setShowTermsModal(true);
    } catch (error) {
      console.error('Error revoking terms acceptance:', error);
    }
  };

  return {
    termsAccepted,
    showTermsModal,
    setShowTermsModal,
    handleTermsAccept,
    requireTermsAcceptance,
    revokeTermsAcceptance,
    isSubmitting,
    error
  };
}

// Helper functions for production integration
async function getAuthToken(): Promise<string> {
  // In production, get JWT token from Azure AD
  // For now, return mock token
  return 'mock-jwt-token';
}

function getTenantId(): string {
  // Get tenant ID from environment or context
  return ((window as Window & { ENV?: { REACT_APP_TENANT_ID?: string } }).ENV?.REACT_APP_TENANT_ID) || 'esdc';
}

function getUserId(): string {
  // Get anonymized user ID (GDPR compliant)
  // In production, this would come from authenticated user context
  return 'mock-user-id';
}

async function getUserIPAddress(): Promise<string> {
  try {
    // In production, this might be handled server-side
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}