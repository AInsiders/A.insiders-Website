# Mathematical Ciphers Tool

A comprehensive collection of mathematical encryption and decryption tools built with modern web technologies.

## Features

### 🔢 Hill Cipher
- **Matrix-based encryption** using 2x2 matrices
- **Automatic matrix validation** ensuring invertibility
- **Letter-only input** with automatic padding
- **Random matrix generation** for secure keys
- **Real-time encryption/decryption** with visual feedback

**How it works:**
- Uses a 2x2 matrix to encrypt pairs of letters
- Each letter is converted to a number (A=0, B=1, etc.)
- Matrix multiplication is performed modulo 26
- Decryption uses the inverse matrix

### 🔑 One-Time Pad
- **Perfect secrecy** when used correctly
- **Random key generation** for maximum security
- **XOR-based encryption** for fast processing
- **Key length matching** with message length
- **Automatic key generation** if none provided

**How it works:**
- Each character is XORed with a corresponding key character
- Key must be as long as the message
- Same operation for encryption and decryption
- Provides perfect secrecy when key is truly random

### ⚡ XOR Cipher
- **Symmetric encryption** using XOR operation
- **Repeating key pattern** for variable-length messages
- **Fast processing** with bitwise operations
- **Key generation** for convenience
- **Universal compatibility** with any text

**How it works:**
- Each message character is XORed with key characters
- Key repeats if shorter than message
- Same operation for encryption and decryption
- Efficient bitwise processing

### 🔄 Bit Shifting Cipher
- **Left/right bit shifting** for character transformation
- **Configurable shift amount** (1-7 bits)
- **Circular shifting** to preserve all bits
- **Direction selection** for encryption/decryption
- **Visual feedback** on shift parameters

**How it works:**
- Each character's bits are shifted left or right
- Circular shifting preserves all 8 bits
- Decryption reverses the shift direction
- Configurable shift amount for security

### 📊 Modular Arithmetic Cipher
- **Number-based encryption** using modular arithmetic
- **Configurable modulus** (2-100)
- **Multiplicative key** with inverse calculation
- **Automatic key generation** with valid inverses
- **Mathematical validation** for all parameters

**How it works:**
- Numbers are multiplied by a key modulo n
- Decryption uses the modular multiplicative inverse
- Supports any modulus value
- Validates key invertibility

## Technical Features

### 🎨 Modern UI/UX
- **Responsive design** for all device sizes
- **Neural background animation** for visual appeal
- **Glassmorphism styling** with backdrop blur effects
- **Smooth animations** and hover effects
- **Accessible color scheme** with high contrast

### 🔒 Security Features
- **Client-side processing** - no data sent to servers
- **Input validation** for all cipher parameters
- **Error handling** with user-friendly messages
- **Secure random generation** for keys
- **No data persistence** - all data stays in browser

### ⚡ Performance Optimizations
- **Efficient algorithms** for all ciphers
- **Optimized matrix operations** for Hill cipher
- **Fast bitwise operations** for XOR and bit shifting
- **Minimal DOM manipulation** for smooth interactions
- **Lazy loading** of non-critical features

### 🛠️ User Experience
- **One-click copy** for all results
- **Mode switching** between encrypt/decrypt
- **Clear all functions** for quick reset
- **Random generation** buttons for convenience
- **Real-time validation** and feedback

## Usage Examples

### Hill Cipher
```
Message: "HELLO"
Matrix: [3, 2; 1, 4]
Result: "KQNNS"
```

### One-Time Pad
```
Message: "Hello"
Key: "Xj9mK"
Result: Encrypted binary data
```

### XOR Cipher
```
Message: "Hello World"
Key: "secret"
Result: XOR encrypted text
```

### Bit Shifting
```
Message: "ABC"
Shift: 3 left
Result: Shifted character codes
```

### Modular Arithmetic
```
Message: "1 2 3 4 5"
Modulus: 26
Key: 3
Result: "3 6 9 12 15"
```

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## Security Notes

⚠️ **Important:** These ciphers are for educational and demonstration purposes. For real-world security applications, use established cryptographic libraries and protocols.

- Hill Cipher: Vulnerable to known-plaintext attacks
- One-Time Pad: Requires truly random keys and secure key distribution
- XOR Cipher: Vulnerable to frequency analysis
- Bit Shifting: Provides minimal security
- Modular Arithmetic: Basic mathematical transformation

## File Structure

```
mathematical-ciphers.html          # Main application file
MATHEMATICAL_CIPHERS_README.md     # This documentation
brain-styles.css                   # Shared styling (referenced)
brain-script.js                    # Background animation (referenced)
```

## Development

The application is built with vanilla JavaScript and modern CSS, requiring no build process or dependencies. Simply open `mathematical-ciphers.html` in a web browser to use.

## Contributing

Feel free to enhance the ciphers with:
- Additional mathematical ciphers
- Improved algorithms
- Better UI/UX features
- Performance optimizations
- Security enhancements

## License

This tool is part of the A.Insiders Tools collection and follows the same licensing terms.
