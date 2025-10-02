"use client";

import { forwardRef, useImperativeHandle, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal';
  className?: string;
}

export interface HCaptchaRef {
  reset: () => void;
  execute: () => void;
}

export const HCaptchaWidget = forwardRef<HCaptchaRef, HCaptchaProps>(
  ({ siteKey, onVerify, onError, onExpire, theme = 'light', size = 'normal', className }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        captchaRef.current?.resetCaptcha();
      },
      execute: () => {
        captchaRef.current?.execute();
      },
    }));

    return (
      <div className={className}>
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={onVerify}
          onError={onError}
          onExpire={onExpire}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

HCaptchaWidget.displayName = 'HCaptchaWidget';
