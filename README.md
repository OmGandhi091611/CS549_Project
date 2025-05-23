# Functional Correctness vs Security: Case Study of an Insecure MAC Scheme

## Project Overview

This project implements and analyzes a simplified Message Authentication Code (MAC) scheme based on a length-preserving pseudorandom function (PRF).  
The MAC is generated by splitting the message, prefixing control bits, and applying a pseudorandom transformation to each part.  
The project verifies the functional correctness of the scheme and demonstrates a security flaw using a cut-and-paste (splice-and-forge) attack.

The application also includes:
- A complete MAC generation and verification interface.
- Visualization of attack steps.
- Multiple test cases verifying both functionality and vulnerabilities.

---

## Running Environment

- **Programming Language:** JavaScript (ES6+)
- **Frontend Framework:** React (with Vite Build Tool)
- **UI Library:** Material-UI (MUI v5)
- **Package Manager:** npm (Node Package Manager)
- **Node.js Version:** 20.15.1
- **Vite Version:** 4.3.0
- **Operating System:** macOS Sonoma 15.4.1
- **Browser Tested:** Google Chrome Version 124.0
- **Local Server:** Vite Development Server (`npm run dev`)

---

## Installation and Setup Instructions

Follow these steps to run the project locally:

1. **Install Node.js and npm**  
   Download from [https://nodejs.org/](https://nodejs.org/).

2. **Clone or Download the Project Files**  
   Navigate into the project directory.

3. **Install Project Dependencies**  
   Open a terminal inside the project folder and run:
   ```bash
   npm install
   ```
4. **Start the development Server**
    Run:
    ```bash
   npm run dev
   ```