"use client";

import { css } from '@emotion/css';

/**
 * Example component demonstrating Emotion CSS with nonce support
 * This component uses Emotion CSS which will be properly handled by
 * the EmotionCacheProvider with nonce for CSP compliance.
 */
export function EmotionExample() {
  // Example Emotion CSS styles
  const buttonStyle = css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  `;

  const cardStyle = css`
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 400px;
    margin: 20px auto;

    h3 {
      color: #333;
      margin-bottom: 16px;
      font-size: 24px;
    }

    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
  `;

  return (
    <div className={cardStyle}>
      <h3>Emotion + CSP Nonce Example</h3>
      <p>
        This component uses Emotion CSS with nonce support for Content Security Policy compliance.
        All styles are properly nonced through the EmotionCacheProvider.
      </p>
      <button 
        className={buttonStyle}
        onClick={() => {
          console.log('🎨 Emotion styles working with CSP nonce!');
          alert('Emotion CSS + CSP Nonce working correctly!');
        }}
      >
        Test Emotion Styles
      </button>
    </div>
  );
} 