# Privacy and Terms Components

This directory contains reusable components for displaying privacy policy and terms of service modals in the Goodlistseller application.

## Components

### TermsModal

A modal dialog that displays the terms and conditions of the website.

```tsx
import TermsModal from "@/components/auth/TermsModal";

// In your component:
const [showTerms, setShowTerms] = useState(false);
const [acceptedTerms, setAcceptedTerms] = useState(false);

// Then in your JSX:
<TermsModal 
  showTerms={showTerms} 
  setShowTerms={setShowTerms} 
  setAcceptedTerms={setAcceptedTerms} 
/>
```

### PrivacyPolicyModal

A modal dialog that displays the privacy policy of the website.

```tsx
import { PrivacyPolicyModal } from "@/components/shared";

// In your component:
const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);

// Then in your JSX:
<PrivacyPolicyModal 
  showPrivacyPolicy={showPrivacyPolicy} 
  setShowPrivacyPolicy={setShowPrivacyPolicy} 
  setAcceptedPrivacyPolicy={setAcceptedPrivacyPolicy} 
/>
```

## Usage Example

For a complete example of how to use these components together, see the `ModalExample.tsx` component in the examples directory.

```tsx
import TermsModal from "@/components/auth/TermsModal";
import PrivacyPolicyModal from "@/components/shared/PrivacyPolicyModal";

// Set up state for both modals
const [showTerms, setShowTerms] = useState(false);
const [acceptedTerms, setAcceptedTerms] = useState(false);
const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);

// Use in registration forms
<div>
  <div className="flex items-center gap-2 my-4">
    <input 
      type="checkbox" 
      id="terms" 
      checked={acceptedTerms} 
      onChange={() => setShowTerms(true)} 
    />
    <label htmlFor="terms" className="text-sm">
      ฉันยอมรับ <button 
        type="button" 
        className="text-blue-600 underline" 
        onClick={() => setShowTerms(true)}
      >
        ข้อกำหนดและเงื่อนไขการใช้งาน
      </button>
    </label>
  </div>
  
  <div className="flex items-center gap-2 my-4">
    <input 
      type="checkbox" 
      id="privacy" 
      checked={acceptedPrivacyPolicy} 
      onChange={() => setShowPrivacyPolicy(true)} 
    />
    <label htmlFor="privacy" className="text-sm">
      ฉันยอมรับ <button 
        type="button" 
        className="text-blue-600 underline" 
        onClick={() => setShowPrivacyPolicy(true)}
      >
        นโยบายความเป็นส่วนตัว
      </button>
    </label>
  </div>
  
  <button 
    type="submit" 
    disabled={!acceptedTerms || !acceptedPrivacyPolicy}
  >
    ลงทะเบียน
  </button>
  
  {/* Include the modals */}
  <TermsModal 
    showTerms={showTerms} 
    setShowTerms={setShowTerms} 
    setAcceptedTerms={setAcceptedTerms} 
  />
  
  <PrivacyPolicyModal 
    showPrivacyPolicy={showPrivacyPolicy} 
    setShowPrivacyPolicy={setShowPrivacyPolicy} 
    setAcceptedPrivacyPolicy={setAcceptedPrivacyPolicy} 
  />
</div>
```

## Static Pages

The application also includes static pages for the full privacy policy and terms of service:

- `/privacy` - Full privacy policy page
- Terms of service are currently only available via the modal component

These pages use the same content as the modals but in a full-page format. 