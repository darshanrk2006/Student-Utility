/**
 * Validation test for Resume Builder Wizard and input sanitization
 */

function testValidation() {
  const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15 && /^[0-9+() -]+$/.test(phone.trim());
  };
  const isValidLocation = (location) => location.trim().length >= 2;

  const validateStep1 = (data) => {
    return Boolean(
      data.fullName.trim().length >= 2 &&
      data.targetRole.trim().length >= 2 &&
      isValidEmail(data.email) &&
      isValidPhone(data.phone) &&
      isValidLocation(data.location)
    );
  };

  console.log("Testing Step 1 Validation with single character 's':");
  const invalidData = {
    fullName: "s",
    targetRole: "Software Engineering & Full Stack",
    email: "s",
    phone: "s",
    location: "s"
  };

  const isInvalidAllowed = validateStep1(invalidData);
  console.log("Is single character 's' allowed?", isInvalidAllowed);
  if (isInvalidAllowed) {
    throw new Error("FAIL: Single character data must NOT be valid!");
  }
  console.log("✅ PASS: Invalid data strictly rejected.");

  console.log("\nTesting Phone filter:");
  const testPhoneInput = "abc1234567xyz";
  const sanitizedPhone = testPhoneInput.replace(/[^0-9+() -]/g, "");
  console.log("Input:", testPhoneInput, "-> Sanitized:", sanitizedPhone);
  if (sanitizedPhone !== "1234567") {
    throw new Error("FAIL: Phone sanitizer failed to strip alphabetic letters!");
  }
  console.log("✅ PASS: Phone sanitization stripped letters properly.");

  console.log("\nTesting Country Dial Code Phones (India +91, UK +44, US +1):");
  const phones = [
    { country: "India (+91)", phone: "+91 98765 43210" },
    { country: "United States (+1)", phone: "+1 (555) 234-5678" },
    { country: "United Kingdom (+44)", phone: "+44 7911 123456" },
    { country: "United Arab Emirates (+971)", phone: "+971 50 123 4567" },
  ];

  for (const p of phones) {
    const valid = isValidPhone(p.phone);
    console.log(`Checking ${p.country}: ${p.phone} -> Valid: ${valid}`);
    if (!valid) {
      throw new Error(`FAIL: Phone for ${p.country} should be valid!`);
    }
  }
  console.log("✅ PASS: All country code phone formats validated successfully.");

  console.log("\nTesting Valid Complete Step 1 Data (India +91 format):");
  const validData = {
    fullName: "Alex Chen",
    targetRole: "Software Engineering & Full Stack",
    email: "alex@university.edu",
    phone: "+91 98765 43210",
    location: "Bengaluru, India"
  };

  const isValidAllowed = validateStep1(validData);
  console.log("Is valid data allowed?", isValidAllowed);
  if (!isValidAllowed) {
    throw new Error("FAIL: Valid data should be allowed!");
  }
  console.log("✅ PASS: Valid data is accepted.");

  console.log("\nAll resume validation tests passed successfully!");
}

testValidation();
