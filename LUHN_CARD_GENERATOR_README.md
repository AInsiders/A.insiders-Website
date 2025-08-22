# Luhn Card Number Generator

## Overview

The Luhn Card Number Generator is a **test-only** tool designed for developers, QA testers, and educational purposes. It generates synthetic Primary Account Numbers (PANs) that pass the Luhn checksum algorithm, commonly used to validate credit card numbers.

## ⚠️ IMPORTANT LEGAL DISCLAIMER

**This tool is for development, testing, and education purposes ONLY.**

- ❌ **NOT** valid for real transactions or payments
- ❌ **NOT** for obtaining goods or services
- ❌ **NOT** for bypassing payment systems
- ❌ **NOT** for fraud or illegal activities
- ✅ **ONLY** for legitimate software testing and educational purposes

Using fake card numbers for real transactions is **FRAUD** and may result in legal consequences.

## Features

### Core Functionality
- **Luhn Algorithm Implementation**: Generates card numbers that pass the Luhn checksum validation
- **Customizable IIN/BIN**: User-supplied 6-8 digit Issuer Identification Number/Bank Identification Number
- **Flexible PAN Length**: Support for 13-19 digit card numbers
- **Batch Generation**: Generate 1-50 card numbers at once
- **Real-time Validation**: Input validation with immediate feedback

### Security & Privacy
- **No Server Storage**: All generation happens client-side
- **No Logging**: Generated numbers are not stored or logged
- **Rate Limiting**: Client-side rate limiting (60 requests per hour)
- **Content Filtering**: Prevents malicious input patterns

### User Experience
- **Disclaimer System**: Required acknowledgment before use
- **Copy to Clipboard**: Individual and bulk copy functionality
- **Export to File**: Download generated numbers as .txt file
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: Keyboard navigation and ARIA labels

## Technical Implementation

### Luhn Algorithm
The tool implements the standard Luhn algorithm (mod 10):

1. Starting from the rightmost digit, double every second digit
2. If doubling results in a number > 9, subtract 9
3. Sum all digits
4. Calculate check digit: (10 - (sum % 10)) % 10

### Generation Process
1. Validate IIN/BIN (6-8 digits)
2. Calculate account identifier length: `panLength - (iinLength + 1)`
3. Generate random account identifier
4. Compute check digit using Luhn algorithm
5. Concatenate: `IIN + Account + CheckDigit`

### Input Validation
- **IIN/BIN**: Must be 6-8 digits only
- **PAN Length**: Must be 13-19 digits
- **Quantity**: Must be 1-50
- **Content Filtering**: Blocks suspicious input patterns

## Usage

### Basic Usage
1. **Acknowledge Disclaimer**: Check the "I understand" checkbox
2. **Enter IIN/BIN**: 6-8 digit number (e.g., "424242")
3. **Select PAN Length**: Choose from 13-19 digits (default: 16)
4. **Set Quantity**: 1-50 cards (default: 5)
5. **Generate**: Click "Generate Card Numbers"

### Advanced Features
- **Copy Individual**: Click the copy icon next to each card number
- **Copy All**: Copy all generated numbers to clipboard
- **Export**: Download as .txt file
- **Clear Results**: Remove all generated numbers

### Example Output
```
4242 4242 4242 4242
4242 4242 4242 4243
4242 4242 4242 4244
4242 4242 4242 4245
4242 4242 4242 4246
```

## Educational Resources

### Official Test Card Documentation
- [Stripe Test Cards](https://docs.stripe.com/testing)
- [Stripe Card Testing Guide](https://stripe.com/docs/testing#cards)
- [Braintree Test Cards](https://developers.braintreepayments.com/guides/credit-cards/testing-go-live/node)
- [PayPal Test Cards](https://developer.paypal.com/docs/api-basics/sandbox/test-cards/)
- [Adyen Test Cards](https://docs.adyen.com/development-resources/test-cards/test-card-numbers)

### About Luhn Algorithm
The Luhn algorithm (mod 10) is a simple checksum formula used to validate identification numbers, including:
- Credit card numbers
- IMEI numbers
- National Provider Identifier numbers
- Canadian Social Insurance Numbers

## Security Considerations

### What This Tool Does NOT Do
- Generate real credit card numbers
- Access real BIN catalogs
- Generate CVV codes
- Generate expiration dates
- Store or log generated numbers
- Connect to payment processors

### What This Tool Does
- Generate synthetic numbers for testing
- Implement Luhn algorithm correctly
- Provide educational value
- Support legitimate development workflows

## Development & Testing Use Cases

### Software Development
- Payment gateway integration testing
- E-commerce application development
- Financial software testing
- API endpoint validation

### Quality Assurance
- Form validation testing
- UI/UX testing with realistic data
- Automated test suite development
- Edge case testing

### Education
- Learning about payment systems
- Understanding Luhn algorithm
- Financial technology education
- Security awareness training

## Technical Requirements

### Browser Support
- Modern browsers with ES6+ support
- Clipboard API support (for copy functionality)
- File API support (for export functionality)

### Dependencies
- Font Awesome (for icons)
- Google Fonts (Inter, JetBrains Mono)
- No external JavaScript libraries required

## File Structure

```
luhn-card-generator.html          # Main tool page
tool-banners/
  luhn-card-generator-banner.svg  # Tool banner image
LUHN_CARD_GENERATOR_README.md     # This documentation
```

## Contributing

When contributing to this tool:

1. **Maintain Security Focus**: Never add features that could enable fraud
2. **Preserve Educational Value**: Keep the tool focused on learning and testing
3. **Follow Legal Guidelines**: Ensure all changes comply with legal requirements
4. **Test Thoroughly**: Verify Luhn algorithm implementation remains correct

## Legal Information

### Terms of Use
- This tool is provided "as is" without warranties
- Users are responsible for complying with applicable laws
- Misuse of generated numbers is not the responsibility of the tool creators

### Compliance
- Follows PCI DSS guidelines for test data
- Implements appropriate security measures
- Includes clear legal disclaimers
- Prevents misuse through technical controls

## Support

For questions about this tool:
- Review this documentation
- Check the official test card resources
- Ensure you're using the tool for legitimate purposes only

## Version History

- **v1.0.0**: Initial release with core Luhn generation functionality
- Includes disclaimer system, rate limiting, and export features
- Responsive design with accessibility features

---

**Remember**: This tool is for testing and education only. Always use official test cards provided by payment processors for production testing.
