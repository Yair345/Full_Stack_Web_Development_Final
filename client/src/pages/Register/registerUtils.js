// Registration form validation
export const validateRegisterForm = (formData) => {
    const errors = {};

    // First name validation
    if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone) {
        errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = "Please enter a valid phone number";
    }

    // National ID validation
    if (!formData.nationalId) {
        errors.nationalId = "National ID is required";
    } else if (formData.nationalId.length < 5) {
        errors.nationalId = "National ID must be at least 5 characters";
    }

    // Address validation
    if (!formData.address.trim()) {
        errors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
        errors.address = "Address must be at least 10 characters";
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required";
    } else {
        const birthDate = new Date(formData.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            errors.dateOfBirth = "You must be at least 18 years old";
        } else if (age > 120) {
            errors.dateOfBirth = "Please enter a valid date of birth";
        }
    }

    // Password validation
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance validation
    if (!formData.acceptTerms) {
        errors.acceptTerms = "You must accept the terms and conditions";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Create mock user for registration
export const createRegisteredUser = (formData) => {
    return {
        id: Math.floor(Math.random() * 10000) + 1,
        email: formData.email,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        role: "customer", // Default role for new registrations
        createdAt: new Date().toISOString(),
    };
};

// Mock token generation
export const generateMockToken = () => {
    return `mock-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Simulate API registration delay
export const simulateRegistrationDelay = (ms = 1500) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// Check if email already exists (mock check)
export const checkEmailExists = (email) => {
    const existingEmails = [
        "customer@demo.com",
        "manager@demo.com",
        "admin@demo.com",
        "test@example.com"
    ];

    return existingEmails.includes(email.toLowerCase());
};

// Initial form state
export const getInitialFormState = () => ({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationalId: "",
    address: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
});
