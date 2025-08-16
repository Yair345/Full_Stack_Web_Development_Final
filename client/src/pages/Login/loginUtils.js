// Mock user data for demo purposes
export const createMockUser = (email) => {
    return {
        id: 1,
        email: email,
        firstName: "John",
        lastName: "Doe",
        role: email.includes("admin")
            ? "admin"
            : email.includes("manager")
                ? "manager"
                : "customer",
    };
};

export const getMockToken = () => "mock-jwt-token";

// Demo user credentials
export const demoCredentials = {
    email: "customer@demo.com",
    password: "demo123",
};

// Login validation
export const validateLoginForm = (formData) => {
    const errors = {};

    if (!formData.email) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Email is invalid";
    }

    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 3) {
        errors.password = "Password must be at least 3 characters";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

// Simulate API login delay
export const simulateApiDelay = (ms = 1000) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
