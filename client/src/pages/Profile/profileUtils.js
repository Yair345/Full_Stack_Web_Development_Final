// Mock profile data
export const mockProfileData = {
    personal: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1990-05-15",
        ssn: "***-**-1234"
    },
    address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States"
    },
    security: {
        loginPassword: "••••••••",
        transactionPin: "••••",
        twoFactorEnabled: true,
        loginNotifications: true,
        biometricEnabled: false
    },
    preferences: {
        language: "English",
        currency: "USD",
        timezone: "Eastern Time (UTC-5)",
        statements: "email",
        marketing: false,
        smsAlerts: true,
        emailAlerts: true,
        pushNotifications: true
    }
};

// Utility functions
export const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
};

export const formatSSN = (ssn) => {
    if (!ssn) return '';
    // Hide all but last 4 digits
    return ssn.replace(/\d(?=\d{4})/g, '*');
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validatePassword = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
};

export const getPasswordStrength = (password) => {
    const validation = validatePassword(password);
    const score = Object.values(validation).filter(Boolean).length;

    if (score < 2) return { strength: 'weak', color: 'danger' };
    if (score < 4) return { strength: 'medium', color: 'warning' };
    if (score === 5) return { strength: 'strong', color: 'success' };
    return { strength: 'weak', color: 'danger' };
};
